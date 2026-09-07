import requests
import time
import threading

url = "http://localhost:8005/api/analytics/graph/train-gnn"
headers = {"X-API-Key": "test"}

def do_req(i):
    print(f"Request {i} sending...")
    res = requests.post(url, headers=headers)
    print(f"Request {i} response: {res.status_code}")

threads = []
for i in range(4):
    t = threading.Thread(target=do_req, args=(i,))
    threads.append(t)
    t.start()
    time.sleep(0.5)

for t in threads:
    t.join()
