import networkx as nx
from collections import defaultdict
from Ploopy import Ploopy
import time

# World implements Ploopy.
# The World is in charge of running the Ploopy graph,
# as well as changing any Ploopy graph relations based on new input
# as well as output, etc.

# When the world changes Ploopy graph relations, it replaces them wholesale
# not a modification, but a replacement.
# this is so to ensure that there's no state/side effects

class World:

    # example relations: {'rabbits->foxes': 0.08000000000000002, 'foxes->rabbits': 0.24}
    def __init__(self, relations=None, actors=None):
        self.WorldPloopy = Ploopy()
        self.change(relations=relations)

    # update loop
    def update(self):
        start_time = time.time()
        self.WorldPloopy.update()
        print("--- %s seconds ---" % (time.time() - start_time))

    def change(self, relations=None):
        if(relations):
            self.WorldPloopy.replace_edges(relations)

