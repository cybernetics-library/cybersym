import time
import requests

import model
import networkx as nx

MONUMENTS_API_URL = "http://localhost:5000/monuments"


def setup():
    # TODO: load state from db if null
    global monuments, prev_monuments
    monuments = {} # fakes a state change
    G=nx.read_weighted_edgelist(model.model_pp) # TODO: make this work

def update():
    global monuments, prev_monuments
    prev_monuments = monuments
    monuments = requests.get(MONUMENTS_API_URL).json()
    if(prev_monuments != monuments):
        print(model.monuments_delta_to_pp(prev_monuments, monuments))


def main():
    setup()
    while True:
        update()
        time.sleep(1)

main()
