from .db import DB
from .topics import get_topic_mixture
from .monuments import compute_monuments_state
from flask import Flask, request, jsonify

app = Flask(__name__)
db = {
    table: DB(table)
    for table in ['books', 'monuments']
}


@app.route('/checkout', methods=['POST'])
def checkout():
    """accepts a list of book ids at the key `ids`,
    then loads their topic mixtures
    and computes a new monuments state"""
    # save new book ids
    book_ids = request.json['ids']
    db['books'].append(*book_ids)

    # load all book ids and their topic mixtures
    topic_mixtures = [get_topic_mixture(id) for id in db['books'].all()]

    # compute new monuments state and save to db
    monuments_state = compute_monuments_state(topic_mixtures)
    db['monuments'].append(monuments_state)
    return jsonify(**monuments_state)


@app.route('/monuments')
def monuments():
    state = db['monuments'].last()
    return jsonify(**state)


@app.route('/pp')
def pp():
    dummy = {
        'humans': 100,
        'animals': 20,
        'humans->animals': 2,
        'animals->humans': 3
    }
    return jsonify(**dummy)
