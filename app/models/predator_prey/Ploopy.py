from collections import defaultdict
import ujson


"""
Ploopy

Simple directed edge_weighted graph structure that's Loopy-esque
Very light-edge_weight. Each graph state is a dict.
All functions just return new states, rather than editing the dict.

Example State:
{
    edges: {
        "rabbit": {"rabbit" : 0.5, "fox": 0.3 },
        "fox": {"rabbit" : -0.5 }
    },
    nodes: {
        "rabbit": { "value": 0.5, "properties": {} },
        "fox": { "value": 0.3, "properties": {} }
    }
}

Update() method 'runs' a single generation.

Example usage:

P = Ploopy()
P.add_edge("rabbits", "foxes", 0.5)
P.add_edge("foxes", "rabbits", -0.7)
P.pprint() # outputs starting status
P.update() # runs one generation
P.pprint() # outputs new status
a = P.export_graph() # outputs P as a compressed format.
P.import_graph(a) # imports a compressed format.
"""

SIG_FIGS = 8

class Ploopy():

    def __init__(self):
        self.Graph = self._make_empty_graph()

    @staticmethod
    def _make_empty_graph():
        g = {}
        g['nodes'] = defaultdict(float)
        g['edges'] = defaultdict(lambda: defaultdict(float))
        return g

    def replace_edges(self, edges):
        self.Graph['edges'] = edges
        self._add_missing_nodes()

    def add_edge(self, node_from_name, node_to_name, edge_weight=1):
        self.Graph['edges'][node_from_name][node_to_name] = edge_weight
        self._create_node_if_none(name=node_from_name)
        self._create_node_if_none(name=node_to_name)

    def _create_node_if_none(self, name, value=0, properties={}):
        if(name not in self.Graph['nodes']):
            self.Graph['nodes'][name] = { "value": value, "properties": properties}

    def _add_missing_nodes(self):
        all_node_names = set()
        for node_from,nodes_to in self.Graph['edges'].items():
            all_node_names.add(node_from)
            all_node_names.update([k for k, v in nodes_to.items()])

        for n in all_node_names:
            self._create_node_if_none(n, value=1)
        
    def update(self):
        newG = deepcopy(self.Graph)

        # iterate over each node, then that node's edges.
        # multiply the value of that node with the edge, and add it to the target node's value (in the newG)
        # newG becomes the current graph. 

        for node_from, nodes_to in self.Graph['edges'].items():
            for node_to, edge_weight in nodes_to.items():
                if(node_from == node_to):
                    newG['nodes'][node_to]['value'] += self.Graph['nodes'][node_from]['value'] * edge_weight 
                else:
                    newG['nodes'][node_to]['value'] += self.Graph['nodes'][node_from]['value'] * self.Graph['nodes'][node_to]['value'] * edge_weight 

        # round nodes to SIG_FIGS
        for name, node in newG['nodes'].items():
            newG['nodes'][name]['value'] = max(0, round(node['value'], SIG_FIGS))

        self.Graph = newG


    def pprint(self):
        print("==================")
        print("=== Nodes:")
        for name, node in sorted(self.Graph['nodes'].items()):
            print("{:10}({:3}), properties: {}".format(name, node['value'], node['properties']))
        print("=== Edges:")
        for node_from,nodes_to in sorted(self.Graph['edges'].items()):
            for node_to, edge_weight in nodes_to.items():
                print("{:10} --> {:10} : {:4}".format(node_from, node_to, edge_weight))



    def export_graph(self):
        G = {}
        for name, node in self.Graph['nodes'].items():
            G[name] = node['value']

        for node_from, nodes_to in self.Graph['edges'].items():
            for node_to, edge_weight in nodes_to.items():
                G[node_from + "->" + node_to] = edge_weight

        return G 

    def import_graph(self, g):
        Graph = self._make_empty_graph()

        for k, v in  g.items():
            print(k, v)
            if("->" not in k):
                Graph['nodes'][k] = { 'value': float(v), 'properties': {} }
            else:
                (n_from, n_to) = k.split("->")
                Graph['edges'][n_from][n_to] = float(v)
        self.Graph = Graph

 

def deepcopy(d):
    return ujson.loads(ujson.dumps(d))
    # we're doing this because copy.deepcopy is very slow!
    # https://stackoverflow.com/questions/24756712/deepcopy-is-extremely-slow


