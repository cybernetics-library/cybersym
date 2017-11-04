from flask import Flask, request, jsonify

app = Flask(__name__)


@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json()
    # TODO


@app.route('/monuments')
def monuments():
    dummy = {
        'military': 24.81,
        'biology': 64.18
    }
    return jsonify(**dummy)


@app.route('/pp')
def pp():
    dummy = {
        'humans': 100,
        'animals': 20,
        'humans->animals': 2,
        'animals->humans': 3
    }
    return jsonify(**dummy)
