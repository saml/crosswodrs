import puz

def tokenize_row(s):
    '''
    'AB.C..D' => ['AB', '', 'C', '', '', 'D']
    '''
    chunk = []
    tokens = []
    for x in (s+'.'):#sentinel
        if x == '.':
            if len(chunk) > 0:
                tokens.append(''.join(chunk))
            tokens.append('')
            chunk = []
        else:
            chunk.append(x)
    return tokens[:-1]


class CrosswordPuzzle(object):
    def __init__(self, puz_file=None):
        self.rows = None
        self.clues_across = None
        self.clues_down = None
        self.author = None
        self.width = None
        self.height = None
        self.puz_file = puz_file
        if puz_file is not None:
            self.load(puz_file)

    def load(self, puz_file):
        puzzle = puz.read(puz_file)
        clues = puzzle.clue_numbering()
        solution = puzzle.solution
 
        self.rows = []
        while len(solution) >= puzzle.width:
            row = solution[:puzzle.width]
            self.rows.append(tokenize_row(row))
            solution = solution[puzzle.width:]
        
        self.clues_across = [[d['num'], d['clue']] for d in clues.across]
        self.clues_down = [[d['num'], d['clue']] for d in clues.down]
        self.author = puzzle.author
        self.width = puzzle.width
        self.height = puzzle.height

