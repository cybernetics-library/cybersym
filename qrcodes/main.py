import os
import qrcode
from uuid import uuid4

QR_PATH = 'output'
ADJS = [l.strip() for l in open('adjectives.txt', 'r').readlines() if l.strip()]
NOUNS = [l.strip() for l in open('nouns.txt', 'r').readlines() if l.strip()]


def gen_qr_code(id):
    id = 'A:{}'.format(id)
    img = qrcode.make(id, border=0)
    fname = '{}.png'.format(id)
    img.save(os.path.join(QR_PATH, fname))


def name_from_id(id):
    h = hash(id)
    i = h % len(ADJS)
    adj = ADJS[i]

    h = int(''.join(list(reversed(str(h)[1:]))))
    nouns = [n for n in NOUNS if n[:3] != adj[:3]] # try to filter out redundancies
    i = h % len(nouns)
    noun = nouns[i]

    return 'The Planet of {} {}'.format(adj, noun)


if __name__ == '__main__':
    N_ATTENDEES = 200
    for i in range(N_ATTENDEES):
        id = uuid4().hex
        gen_qr_code(id)
        print(name_from_id(id))