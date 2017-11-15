import os
import qrcode
from uuid import uuid4
from app.planets import name_from_id

QR_PATH = 'qrcodes'


def gen_qr_code(rawid):
    id = 'http://library.cybernetics.social/planet/{}'.format(rawid)
    img = qrcode.make(id, border=0)
    fname = '{}.png'.format(rawid)
    img.save(os.path.join(QR_PATH, fname))

if __name__ == '__main__':
    f = open('qrcode_output.csv', 'w')
    f.write("planet_name,qrid\n")
    N_ATTENDEES = 300
    for i in range(N_ATTENDEES):
        id = uuid4().hex
        gen_qr_code(id)
        print(name_from_id(id), id)
        f.write(name_from_id(id) + "," + id + "\n")

