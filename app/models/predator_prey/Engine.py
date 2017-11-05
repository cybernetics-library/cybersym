import time
import requests


import Monument_to_Relations_Logic as Logic
from World import World

########

MONUMENTS_API_URL = "http://localhost:5000/monuments"
PP_API_URL = "http://localhost:5000/pp"
INTERVAL_TIME = 1

#######

def setup():
    global PreyWorld, this_mstate, prev_mstate

    PreyWorld = World()

    # get graph from `/pp
    try: 
        ppstate = requests.get(PP_API_URL).json()
        PreyWorld.import_graph(ppstate)
    except Exception as e:
        print(e)

    prev_mstate = {}

def update():
    global PreyWorld, this_mstate, prev_mstate

    # get from api
    this_mstate = requests.get(MONUMENTS_API_URL).json()
    print(this_mstate)

    if(this_mstate != prev_mstate): # if state is different

        # convert monument state to relation graphs
        new_relations = Logic.monument_state_to_relations(this_mstate)

        # convert relation graphs to PreyWorld
        PreyWorld.change(relations=new_relations)

        # store previous state so we don't do this over and over again.
        # although, in theory, nothing goes wrong if we do.
        prev_mstate = this_mstate

    # update world with relations
    PreyWorld.update()

def run():
    setup()

    starttime=time.time()
    while True:
        update()
        time.sleep(INTERVAL_TIME - ((time.time() - starttime) % INTERVAL_TIME))

#######
if __name__ == "__main__":
    run()
