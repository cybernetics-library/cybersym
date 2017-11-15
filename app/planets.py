import pandas as pd

ADJS = [l.strip() for l in open('data/adjectives.txt', 'r').readlines() if l.strip()]
NOUNS = [l.strip() for l in open('data/nouns.txt', 'r').readlines() if l.strip()]

EXISTING = pd.read_csv('qrcode_output.csv')
EXISTING = {id: name for i, (id, name) in EXISTING[['qrid', 'planet_name']].iterrows()}

def name_from_id(id):
    """this will deterministically return
    a planet name given a unique hex id.
    note that the first version of this was not actually
    deterministic, so we also manually lookup ids that were
    generated then."""
    if id in EXISTING:
        return EXISTING[id]

    h = int(id, 16)
    i = h % len(ADJS)
    adj = ADJS[i]

    h = int(''.join(list(reversed(str(h)[1:]))))
    nouns = [n for n in NOUNS if n[:3] != adj[:3]] # try to filter out redundancies
    i = h % len(nouns)
    noun = nouns[i]

    return 'The Planet of {} {}'.format(adj, noun)
