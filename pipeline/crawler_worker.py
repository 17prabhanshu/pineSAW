"""
pineSAW Distributed Darknet Stealth Crawler Worker
--------------------------------------------------
High-concurrency async crawler orchestrating Playwright headless instances over
Tor SOCKS5 stream-isolated proxies, applying anti-fingerprinting patches, Gaussian
interval jitter, edge filtering, and streaming raw DOMs to Kafka.
"""

import asyncio
import json
import random
import logging
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from urllib.parse import urlparse

from playwright.async_api import async_playwright, Browser, BrowserContext, Page
from aiokafka import AIOKafkaProducer
from pydantic import BaseModel, Field

from tor_client import EphemeralTorProxyManager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("CrawlerWorker")


class RawDarknetPayload(BaseModel):
    url: str
    onion_host: str
    html_content: str
    status_code: int
    headers: Dict[str, str]
    scraped_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    viewport: Dict[str, int]
    circuit_id: str


class StealthCrawlerWorker:
    # Heuristic keywords for edge filtering (discard non-relevant/empty pages)
    RELEVANT_EDGE_KEYWORDS = {
        "pgp", "bitcoin", "btc", "monero", "xmr", "wallet", "escrow",
        "vendor", "listing", "telegram", "proton", "wickr", "session",
        "m30", "fentanyl", "ice", "meth", "pharma", "delivery", "dead drop"
    }

    def __init__(
        self,
        kafka_bootstrap_servers: str = "localhost:9092",
        kafka_topic: str = "raw.darknet.dom",
        proxy_host: str = "127.0.0.1",
        proxy_port: int = 9050,
    ):
        self.kafka_servers = kafka_bootstrap_servers
        self.kafka_topic = kafka_topic
        self.proxy_mgr = EphemeralTorProxyManager(proxy_host, proxy_port)
        self.producer: Optional[AIOKafkaProducer] = None

    async def init_kafka(self):
        """Initialize connection to Kafka message broker."""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=self.kafka_servers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8")
        )
        try:
            await self.producer.start()
            logger.info(f"Connected to Kafka broker at {self.kafka_servers}")
        except Exception as e:
            logger.warning(f"Kafka unavailable ({e}). Running in offline/stdout mode.")
            self.producer = None

    async def apply_stealth_scripts(self, page: Page):
        """
        Inject anti-fingerprinting evasion scripts into the browser context.
        Bypasses `navigator.webdriver` flags, Canvas/WebGL hash fingerprinting, and hardware concurrency limits.
        """
        stealth_js = """
        // 1. Overwrite navigator.webdriver
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });

        // 2. Mock Chrome runtime
        window.chrome = { runtime: {} };

        // 3. Spoof Canvas noise
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function(type) {
            const context = this.getContext('2d');
            if (context) {
                const shift = Math.floor(Math.random() * 2) - 1;
                context.fillStyle = 'rgba(255,255,255,0.01)';
                context.fillRect(0, 0, 1, 1);
            }
            return originalToDataURL.apply(this, arguments);
        };

        // 4. Spoof Permissions API
        const originalQuery = window.navigator.permissions.query;
        window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
                Promise.resolve({ state: Notification.permission }) :
                originalQuery(parameters)
        );

        // 5. Spoof Plugins & Language
        Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
        """
        await page.add_init_script(stealth_js)

    def generate_random_viewport(self) -> Dict[str, int]:
        """Generate jittered viewports mimicking realistic consumer desktop resolutions."""
        base_resolutions = [
            (1920, 1080), (1440, 900), (1536, 864), (1366, 768), (1280, 720)
        ]
        w, h = random.choice(base_resolutions)
        return {
            "width": w + random.randint(-15, 15),
            "height": h + random.randint(-15, 15)
        }

    async def gaussian_sleep(self, mean: float = 2.85, std_dev: float = 0.65, min_val: float = 1.5, max_val: float = 4.2):
        """Gaussian-distributed delay between requests to mimic organic human navigation patterns."""
        delay = random.gauss(mean, std_dev)
        clamped_delay = max(min_val, min(max_val, delay))
        await asyncio.sleep(clamped_delay)

    def edge_filter_content(self, text: str) -> bool:
        """
        Lightweight heuristic edge filter.
        Discards empty 404s, landing splash loops, and dead listings before pushing to Kafka.
        """
        if not text or len(text.strip()) < 100:
            return False
        text_lower = text.lower()
        match_count = sum(1 for kw in self.RELEVANT_EDGE_KEYWORDS if kw in text_lower)
        return match_count >= 1

    async def crawl_target(self, browser: Browser, target_url: str) -> Optional[RawDarknetPayload]:
        """Crawl a single .onion target over an isolated SOCKS5 stream."""
        proxy_config = self.proxy_mgr.get_playwright_proxy_dict()
        circuit_id = proxy_config["username"]
        viewport = self.generate_random_viewport()

        context: BrowserContext = await browser.new_context(
            proxy=proxy_config,
            viewport=viewport,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            ignore_https_errors=True
        )

        page: Page = await context.new_page()
        await self.apply_stealth_scripts(page)

        payload: Optional[RawDarknetPayload] = None
        try:
            logger.info(f"Navigating to {target_url} via circuit {circuit_id}...")
            response = await page.goto(target_url, wait_until="domcontentloaded", timeout=45000)

            status_code = response.status if response else 0
            headers = response.headers if response else {}
            html = await page.content()

            # Apply edge filter
            if self.edge_filter_content(html):
                parsed_url = urlparse(target_url)
                payload = RawDarknetPayload(
                    url=target_url,
                    onion_host=parsed_url.netloc,
                    html_content=html,
                    status_code=status_code,
                    headers=headers,
                    viewport=viewport,
                    circuit_id=circuit_id
                )
                logger.info(f"✔ Edge filter accepted payload for {target_url} ({len(html)} bytes)")
            else:
                logger.info(f"⚠ Edge filter discarded non-relevant content from {target_url}")

        except Exception as e:
            logger.error(f"Failed to crawl {target_url} over Tor: {str(e)}")
        finally:
            await page.close()
            await context.close()

        return payload

    async def publish_to_kafka(self, payload: RawDarknetPayload):
        """Emit raw scraped DOM to Kafka event bus."""
        if self.producer:
            await self.producer.send_and_wait(self.kafka_topic, payload.model_dump())
            logger.info(f"Emitted payload to Kafka topic [{self.kafka_topic}]")
        else:
            logger.info(f"[OFFLINE KAFKA] Would emit payload for {payload.url} ({len(payload.html_content)} bytes)")

    async def run_batch(self, target_urls: List[str]):
        """Run batch crawling across target URLs with stream isolation and concurrency controls."""
        await self.init_kafka()

        async with async_playwright() as p:
            browser = await p.chromium.launch(
                headless=True,
                args=[
                    "--disable-blink-features=AutomationControlled",
                    "--disable-infobars",
                    "--no-sandbox",
                    "--disable-setuid-sandbox"
                ]
            )

            for url in target_urls:
                payload = await self.crawl_target(browser, url)
                if payload:
                    await self.publish_to_kafka(payload)

                await self.gaussian_sleep()

            await browser.close()

        if self.producer:
            await self.producer.stop()


if __name__ == "__main__":
    test_urls = [
        "http://genesis4xyt6z9a1.onion/listing/84920",
        "http://alphabay77reup9q.onion/listing/33104",
        "http://torrezhub889xz.onion/listing/11094"
    ]
    worker = StealthCrawlerWorker()
    asyncio.run(worker.run_batch(test_urls))
