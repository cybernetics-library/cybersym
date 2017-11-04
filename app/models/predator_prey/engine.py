import time
import requests
import networkx as nx

########

import Monument_to_Relations_Logic as Logic

########

MONUMENTS_API_URL = "http://localhost:5000/monuments"


def setup():
    # TODO: load state from db if null
    monuments = {} # fakes a state change
#    G=nx.read_weighted_edgelist(model.model_pp) # TODO: make this work

def update():
    this_monuments = requests.get(MONUMENTS_API_URL).json()

    this_relations = Logic.state_to_relations(this_monuments)

    print(this_relations)


def run():
    setup()
    while True:
        update()
        time.sleep(1)

#######
if __name__ == "__main__":
    run()
