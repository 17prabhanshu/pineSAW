"""
AIL Framework (Analysis Information Leak) ZeroMQ Connector.
Listens to the CIRCL AIL Framework stream for dark web crawled data and paste leaks over native TCP.
"""
import zmq
import json
from typing import Generator, Dict, Any, Optional

class AILFrameworkConnector:
    def __init__(self, zmq_address: str = "tcp://127.0.0.1:5557"):
        self.zmq_address = zmq_address
        self.context = zmq.Context()
        self.socket = self.context.socket(zmq.SUB)
        self.socket.connect(self.zmq_address)
        self.socket.setsockopt_string(zmq.SUBSCRIBE, "")
        print(f"[*] Subscribing to AIL ZeroMQ feed at {self.zmq_address}")

    def listen(self, timeout_ms: int = 2000) -> Generator[Optional[Dict[str, Any]], None, None]:
        """Polls the ZeroMQ TCP socket and yields real deserialized payloads."""
        poller = zmq.Poller()
        poller.register(self.socket, zmq.POLLIN)

        while True:
            events = dict(poller.poll(timeout_ms))
            if self.socket in events and events[self.socket] == zmq.POLLIN:
                try:
                    frames = self.socket.recv_multipart()
                    if len(frames) >= 2:
                        payload = json.loads(frames[1].decode("utf-8"))
                        yield payload
                    elif len(frames) == 1:
                        payload = json.loads(frames[0].decode("utf-8"))
                        yield payload
                except Exception as e:
                    print(f"[AIL Connector Error] {e}")
                    yield None
            else:
                yield None

    def close(self):
        self.socket.close()
        self.context.term()
