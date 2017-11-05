import time
import requests
import networkx as nx

########

import Monument_to_Relations_Logic as Logic
from World import World
import Relationship_Model

########

MONUMENTS_API_URL = "http://localhost:5000/monuments"
PP_API_URL = "http://localhost:5000/pp"


def setup():
    # TODO: load state from db if null
    global PreyWorld
    PreyWorld = World()

def update():
    global PreyWorld

    # get from api
    this_mstate = requests.get(MONUMENTS_API_URL).json()

    # TODO: if state is different
    if(True):
        # convert monument state to relation graphs
        new_relations = Logic.monument_state_to_relations(this_mstate)
        PreyWorld.change(relations=new_relations)

    # update world with relations
    PreyWorld.update()

INTERVAL_TIME = 1

def run():
    setup()

    starttime=time.time()
    while True:
        update()
        time.sleep(INTERVAL_TIME - ((time.time() - starttime) % INTERVAL_TIME))

#######
if __name__ == "__main__":
    run()
