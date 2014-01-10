import glob
import json

from flask import Flask, render_template, request, redirect, url_for, Response

from .models import CrosswordPuzzle

app = Flask(__name__)

@app.route('/puzzles')
def list_of_puzzles():
    puzzles = glob.glob('data/*.puz')
    return render_template('list_of_puzzles.html', puzzles=puzzles)

@app.route('/')
def play_puzzle():
    puz_file = request.args.get('puz')
    if not puz_file:
        return redirect(url_for('list_of_puzzles'))
    return render_template('play_puzzle.html', puz_file=puz_file)

@app.route('/puz')
def puzzle_data():
    puz_file = request.args['puz']
    puzzle = CrosswordPuzzle(puz_file)
    d = {
        'crosswords': puzzle.rows,
        'hints': {
            'across': puzzle.clues_across,
            'down': puzzle.clues_down
        }
    }
    return Response(json.dumps(d), mimetype='application/json')
