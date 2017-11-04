import time
import requests

MONUMENTS_API_URL = "http://localhost:5000/monuments"

def update():
    r = requests.get(MONUMENTS_API_URL)
    print(r.json())

while True:
    update()
    time.sleep(1)

