import json
from .db import DB
from .monuments import compute_monuments_state
from .pp import compute_pp_state
from flask import Flask, request, jsonify
from flask_cors import CORS
from .params import MONUMENT_NAMES

app = Flask(__name__)
CORS(app)
db = {
    table: DB(table)
    for table in ['checkouts', 'monuments', 'pp']
}
LIBRARY = json.load(open('data/library.json', 'r'))


@app.route('/checkout/<id>', methods=['POST'])
def checkout(id):
    """accepts a book id,
    loads its topic mixtures
    and computes a new monuments state"""
    # save new book ids
    db['checkouts'].append(id)

    # load all book ids and their topic mixtures
    topic_mixtures = [LIBRARY['books'][id]['topics'] for id in db['checkouts'].all()]

    # compute new monuments state and save to db
    monuments_state = compute_monuments_state(topic_mixtures)
    db['monuments'].append(monuments_state)

    # return book info
    book = LIBRARY['books'][id]
    return jsonify(**book)


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
    """
    if request.method == 'POST':
        pp_state = request.form
        db['pp'].append(pp_state)
        return jsonify(**pp_state)
    """
    if request.method == 'GET':
        mstate = db['monuments'].last()
        if mstate is None:
            mstate = compute_monuments_state([])
        pp_state = compute_pp_state(mstate)
        return jsonify(**pp_state)
