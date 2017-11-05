import time
import requests


import Monument_to_Relations_Logic as Logic
from World import World

########

MONUMENTS_API_URL = "http://localhost:5000/monuments"
PP_API_URL = "http://localhost:5000/pp"
UPDATE_INTERVAL_SECS = 0.5
PP_POST_INTERVAL_SECS = 5

#######

def setup():
    global PreyWorld, this_mstate, prev_mstate

    PreyWorld = World()

    # get graph from `/pp`
    try: 
        ppstate = requests.get(PP_API_URL).json()
        print("LOADING predator_prey state from API")
        print(ppstate)
        PreyWorld.import_graph(ppstate)
    except Exception as e:
        print(e)

    prev_mstate = {}

def update():
    global PreyWorld, this_mstate, prev_mstate

    # get from api
    this_mstate = requests.get(MONUMENTS_API_URL).json()['state']

    if(this_mstate != prev_mstate): # if state is different

        # convert monument state to relation graphs
        new_relations = Logic.monument_state_to_relations(this_mstate)

        # convert relation graphs to PreyWorld
        PreyWorld.replace_edges(new_relations)

        # store previous state so we don't do this over and over again.
        # although, in theory, nothing goes wrong if we do.
        prev_mstate = this_mstate

    # update world with relations
    PreyWorld.update()


def run():
    setup()

    counter = 0
    starttime=time.time()
    while True:
        update()
        PreyWorld.pprint()
        counter += 1
        time.sleep(UPDATE_INTERVAL_SECS - ((time.time() - starttime) % UPDATE_INTERVAL_SECS))
        if(counter >= (PP_POST_INTERVAL_SECS / UPDATE_INTERVAL_SECS)):
            counter = 0
            update_db_with_world_state()

def update_db_with_world_state():
    G = PreyWorld.export_graph()
    print("updatingdb")
    print(G)
    r = requests.post(PP_API_URL, data=G)



#######
if __name__ == "__main__":
    run()
