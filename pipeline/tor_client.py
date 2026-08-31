"""
pineSAW Tor Client & Ephemeral SOCKS5 Stream Isolation Manager
--------------------------------------------------------------
Implements RFC 1928 SOCKS5 username/password multiplexing over `socks5h://`.
By providing unique random credentials per connection/request, Tor's `IsolateSOCKSAuth`
directive automatically maps the session to an isolated 3-hop circuit without triggering
expensive daemon reloads or `SIGNAL NEWNYM` lockups.
"""

import uuid
import asyncio
from typing import Tuple, Dict, Any, Optional
import aiohttp
from aiohttp_socks import ProxyConnector


class EphemeralTorProxyManager:
    def __init__(self, proxy_host: str = "127.0.0.1", proxy_port: int = 9050):
        self.proxy_host = proxy_host
        self.proxy_port = proxy_port

    def generate_isolated_credentials(self) -> Tuple[str, str]:
        """
        Generate random SOCKS5 auth credentials.
        Tor treats each distinct username/password combination as an isolated stream,
        assigning a fresh 3-hop circuit and exit node.
        """
        stream_user = f"pinesaw_{uuid.uuid4().hex[:12]}"
        stream_pass = uuid.uuid4().hex[:16]
        return stream_user, stream_pass

    def get_socks5h_url(self, user: Optional[str] = None, password: Optional[str] = None) -> str:
        """
        Construct socks5h:// URL (remote DNS resolution inside Tor).
        """
        if not user or not password:
            user, password = self.generate_isolated_credentials()
        return f"socks5h://{user}:{password}@{self.proxy_host}:{self.proxy_port}"

    def get_playwright_proxy_dict(self) -> Dict[str, str]:
        """
        Generate Playwright-compatible proxy configuration dictionary.
        """
        user, password = self.generate_isolated_credentials()
        return {
            "server": f"socks5://{self.proxy_host}:{self.proxy_port}",
            "username": user,
            "password": password
        }

    def create_aiohttp_connector(self) -> ProxyConnector:
        """
        Create an isolated aiohttp SOCKS5 connector.
        """
        proxy_url = self.get_socks5h_url()
        return ProxyConnector.from_url(proxy_url, rdns=True)

    async def test_circuit_isolation(self) -> Dict[str, Any]:
        """
        Self-test validating that two back-to-back requests produce distinct Tor exit IP identities.
        """
        ip_results = []
        for i in range(2):
            connector = self.create_aiohttp_connector()
            async with aiohttp.ClientSession(connector=connector) as session:
                try:
                    async with session.get("https://check.torproject.org/api/ip", timeout=aiohttp.ClientTimeout(total=20)) as resp:
                        if resp.status == 200:
                            data = await resp.json()
                            ip_results.append(data.get("IP"))
                except Exception as e:
                    ip_results.append(f"Error: {str(e)}")

        return {
            "request_1_ip": ip_results[0] if len(ip_results) > 0 else None,
            "request_2_ip": ip_results[1] if len(ip_results) > 1 else None,
            "isolated": ip_results[0] != ip_results[1] if len(ip_results) == 2 else False
        }


if __name__ == "__main__":
    async def main():
        print("[*] Testing SOCKS5 Stream Isolation via HAProxy / Tor Fleet...")
        mgr = EphemeralTorProxyManager(proxy_host="127.0.0.1", proxy_port=9050)
        res = await mgr.test_circuit_isolation()
        print(f"[*] Circuit Test Result: {res}")

    asyncio.run(main())
