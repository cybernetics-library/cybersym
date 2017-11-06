import json
import time

from Ploopy import Ploopy
import lvsolver 
# World implements Ploopy.
# The World is in charge of running the Ploopy graph,
# as well as changing any Ploopy graph relations based on new input
# as well as output, etc.

# World treates Ploopy as a library that knows nothing about cybersym.

# this is starting to become a useless wrapper... but keeping here for now.

class World:

    def __init__(self, state=None):
        self.WorldPloopy = Ploopy()
        self.generations_run = 0

    # update loop
    def update(self):
        self.WorldPloopy.update()
        self.generations_run += 1

        (r, f) = lvsolver.rabbit_fox_lotka_volterra_phase_curve(r_to_r=4, f_to_r=-0.4, f_to_f=-0.5, r_to_f=0.5, init_r=10, init_f=10, samples_n=100)
        print(lvsolver.curve_output_rounded(r=r, f=f)) #    save_phase_curve_as_svg(r=r, f=f)

    def pprint(self):
        self.WorldPloopy.pprint()
        print("GENERATION: {}".format(self.generations_run))

    def replace_edges(self, relations):
        if(relations):
            self.WorldPloopy.replace_edges(relations)

    def import_graph(self, g):
        if('generations_run' in g):
            self.generations_run = int(g['generations_run'])
            g.pop('generations_run')
        else:
            self.generations_run = 0
        self.WorldPloopy.import_graph(g)

    def export_graph(self):
        g = self.WorldPloopy.export_graph()
        g['generations_run'] = self.generations_run
        return g

