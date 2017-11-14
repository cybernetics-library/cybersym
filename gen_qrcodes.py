import os
import qrcode
from uuid import uuid4

QR_PATH = 'qrcodes'


def gen_qr_code(rawid):
    id = 'A:{}'.format(rawid)
    img = qrcode.make(id, border=0)
    fname = '{}.png'.format(rawid)
    img.save(os.path.join(QR_PATH, fname))


if __name__ == '__main__':
    N_ATTENDEES = 250
    for i in range(N_ATTENDEES):
        id = uuid4().hex
        gen_qr_code(id)
