ADJS = [l.strip() for l in open('data/adjectives.txt', 'r').readlines() if l.strip()]
NOUNS = [l.strip() for l in open('data/nouns.txt', 'r').readlines() if l.strip()]

def name_from_id(id):
    h = hash(id)
    i = h % len(ADJS)
    adj = ADJS[i]

    h = int(''.join(list(reversed(str(h)[1:]))))
    nouns = [n for n in NOUNS if n[:3] != adj[:3]] # try to filter out redundancies
    i = h % len(nouns)
    noun = nouns[i]

    return 'The Planet of {} {}'.format(adj, noun)
