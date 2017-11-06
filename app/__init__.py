import json
from .db import DB
from .monuments import compute_monuments_state
from flask import Flask, request, jsonify
from flask_cors import CORS
from .params import MONUMENT_NAMES
import subprocess

app = Flask(__name__)
CORS(app)
db = {
    table: DB(table)
    for table in ['checkouts', 'monuments', 'pp']
}
LIBRARY = json.load(open('data/library.json', 'r'))


@app.route('/checkout', methods=['POST'])
def checkout():
    """accepts a list of book ids at the key `ids`,
    then loads their topic mixtures
    and computes a new monuments state"""
    # save new book ids
    book_ids = request.json['ids']
    db['checkouts'].append(*book_ids)

    # load all book ids and their topic mixtures
    topic_mixtures = [LIBRARY['books'][id]['mixture'] for id in db['checkouts'].all()]

    # compute new monuments state and save to db
    monuments_state = compute_monuments_state(topic_mixtures)
    db['monuments'].append(monuments_state)
    return jsonify(**monuments_state)


@app.route('/books')
def books():
    """returns checked-out book ids"""
    return jsonify(checkouts=list(db['checkouts'].all()))


@app.route('/questions/<id>')
def questions(id):
    """returns questions given a book id"""
    book = LIBRARY['books'][id]
    questions = book.get('questions')

    # if no questions for this book,
    # get questions for its topics
    if questions is None:
        topics = book['topics']
        questions = []
        for t in topics:
            questions.extend(LIBRARY['questions'][t])
    return jsonify(questions=questions)


@app.route('/monuments')
def monuments():
    state = db['monuments'].last()
    if state is None:
        state = compute_monuments_state([])
    return jsonify(state=state, names=MONUMENT_NAMES)


@app.route('/pp', methods=['GET', 'POST'])
def pp():
    if request.method == 'POST':
        pp_state = request.form
        db['pp'].append(pp_state)
        return jsonify(**pp_state)

    else:
        state = db['pp'].last()
        return jsonify(**state)

try:
    proc
except:
    proc = subprocess.Popen(['python',  'app/models/predator_prey/engine.py'])
