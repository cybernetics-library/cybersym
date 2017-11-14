adjs = [l.strip() for l in open('adjectives.txt', 'r').readlines() if l.strip()]
nouns = [l.strip() for l in open('nouns.txt', 'r').readlines() if l.strip()]

h = hash('foo bar')
i = h % len(adjs)

adj = adjs[i]
nouns_ = [n for n in nouns if n[:3] != adj[:3]] # try to filter out redundancies

h = int(''.join(list(reversed(str(h)[1:]))))
i = h % len(nouns_)
noun = nouns[i]

print('The Planet of {} {}'.format(adj, noun))