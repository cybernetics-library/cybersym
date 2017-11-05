import os
import json
import mmap

class DB:
    DIR = 'data/'

    """simple file-based database,
    optimized to append and return last n items."""
    def __init__(self, name):
        self.path = os.path.join(self.DIR, name)
        if not os.path.exists(self.path):
            open(self.path, 'w').close()

    def last(self):
        """returns last item"""
        last = self.last_n(n=1)
        if not last:
            return None
        return last[0]

    def last_n(self, n=1):
        """returns last n items"""
        lines = [l.decode('utf8') for l in self.tail(n=n)]
        return list(map(json.loads, lines))

    def all(self):
        """returns all items"""
        with open(self.path, 'r') as f:
            for line in f.readlines():
                yield json.loads(line.strip())

    def append(self, *data):
        """adds a new item"""
        with open(self.path, 'a') as f:
            for d in data:
                f.write(json.dumps(d))
                f.write('\n')

    # <https://stackoverflow.com/a/6813975>
    def tail(self, n=1):
        """returns last n lines from the filename"""
        size = os.path.getsize(self.path)
        if size == 0:
            return []
        with open(self.path, 'rb') as f:
            fm = mmap.mmap(f.fileno(), 0, mmap.MAP_SHARED, mmap.PROT_READ)
            try:
                for i in range(size - 1, -1, -1):
                    if fm[i] == ord('\n'):
                        n -= 1
                        if n == -1:
                            break
                return fm[i + 1 if i else 0:].splitlines()
            finally:
                fm.close()
