"""
Telegram OSINT Bot Worker Service
Runs polling worker when TELEGRAM_BOT_TOKEN is present, or operates in local
CLI / API dispatch mode for programmatic ingestion control.
"""

import time
import threading
import json
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

from .config import TELEGRAM_BOT_TOKEN
from .handlers import TelegramBotCommandHandler


class TelegramBotService:
    """
    Main Bot service worker.
    """

    def __init__(self, token: Optional[str] = None):
        self.token = token or TELEGRAM_BOT_TOKEN
        self.is_running = False
        self._thread: Optional[threading.Thread] = None

    def execute_command(self, command: str, user_id: str = "admin", args: Optional[list] = None) -> Dict[str, Any]:
        """Direct programmatic execution of bot commands."""
        return TelegramBotCommandHandler.handle_command(command, user_id, args)

    def start_polling_if_configured(self):
        """Starts background polling thread if a valid bot token is configured."""
        if not self.token:
            print("[TelegramBot] TELEGRAM_BOT_TOKEN not set; running in local dispatch & API mode.")
            return

        self.is_running = True
        self._thread = threading.Thread(target=self._polling_loop, daemon=True)
        self._thread.start()
        print("[TelegramBot] Polling service started for defensive OSINT monitoring.")

    def _polling_loop(self):
        offset = 0
        while self.is_running:
            try:
                url = f"https://api.telegram.org/bot{self.token}/getUpdates?offset={offset}&timeout=10"
                req = urllib.request.Request(url, headers={"User-Agent": "pineSAW-OSINT-Bot/1.0"})
                with urllib.request.urlopen(req, timeout=15) as resp:
                    if resp.status == 200:
                        data = json.loads(resp.read().decode("utf-8"))
                        for update in data.get("result", []):
                            offset = update["update_id"] + 1
                            msg = update.get("message", {})
                            text = msg.get("text", "")
                            user_id = str(msg.get("from", {}).get("id", ""))
                            chat_id = msg.get("chat", {}).get("id")

                            if text.startswith("/"):
                                parts = text.split()
                                cmd = parts[0]
                                args = parts[1:]
                                res = self.execute_command(cmd, user_id, args)
                                if chat_id:
                                    self._send_reply(chat_id, res["text"])
            except Exception as e:
                time.sleep(3)

    def _send_reply(self, chat_id: int, text: str):
        if not self.token:
            return
        try:
            url = f"https://api.telegram.org/bot{self.token}/sendMessage"
            payload = json.dumps({"chat_id": chat_id, "text": text, "parse_mode": "Markdown"}).encode("utf-8")
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
            urllib.request.urlopen(req, timeout=5)
        except Exception:
            pass

    def stop(self):
        self.is_running = False


# Global bot instance
bot_service = TelegramBotService()
