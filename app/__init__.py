import json
import random
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
    for table in ['checkouts']
}
LIBRARY = json.load(open('data/library.json', 'r'))


def get_questions(id):
    book = LIBRARY['books'][id]
    questions = book.get('questions')

    # if no questions for this book,
    # get questions for its topics
    if questions is None:
        topics = book['topics']
        questions = []
        for t in topics:
            questions.extend(LIBRARY['questions'][t])
    return questions


@app.route('/checkout/<id>', methods=['POST'])
def checkout(id):
    """records a checkout for a attendee and station"""
    # save new book ids
    data = request.json()
    db['checkouts'].append({
        'book_id': id,
        'attendee_id': data['attendee_id'],
        'station_id': data['station_id']
    })

    # return book info
    book = LIBRARY['books'][id]
    return jsonify(**book)


@app.route('/books')
def books():
    """returns checked-out book ids"""
    return jsonify(checkouts=list(db['checkouts'].all()))


@app.route('/question')
def question():
    """returns a question based on what has been checked out"""
    questions = []
    for id in set(db['checkouts'].all()):
        questions.extend(get_questions(id))
    questions = list(set(questions))
    if questions:
        question = random.choice(questions)
    else:
        question = 'Hmm...'
    return jsonify(question=question)


@app.route('/questions/<id>')
def questions(id):
    """returns questions given a book id"""
    questions = get_questions(id)
    return jsonify(questions=questions)


@app.route('/monuments')
def monuments():
    state = db['monuments'].last()
    if state is None:
        state = compute_monuments_state([])
    return jsonify(state=state, names=MONUMENT_NAMES)


@app.route('/pp', methods=['GET'])
def pp():
    mstate = db['monuments'].last()
    if mstate is None:
        mstate = compute_monuments_state([])
    pp_state = compute_pp_state(mstate)
    return jsonify(**pp_state)

