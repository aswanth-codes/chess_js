const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟',
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

let boardState = [
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', '.', '.', '.'],
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

const WHITE_PAWN_START_ROW = 6;
const BLACK_PAWN_START_ROW = 1;
const EMPTY_SQUARE = '.';

let currentPlayer = 'white'; // 'white' or 'black'
let selectedSquare = null;

function drawBoard() {
    const board = document.getElementById('chessboard'); // Ensure the board element is selected
    board.innerHTML = '';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.className = 'square ' + ((row + col) % 2 === 0 ? 'light' : 'dark');
            square.dataset.row = row;
            square.dataset.col = col;
            square.innerText = pieces[boardState[row][col]] || '';
            square.addEventListener('click', handleSquareClick);
            board.appendChild(square);
        }
    }
}

function handleSquareClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    console.log(`Square clicked: (${row}, ${col})`);

    if (selectedSquare) {//second click on the piece
        const [fromRow, fromCol] = selectedSquare;
        console.log(`Selected square: (${fromRow}, ${fromCol})`);
        if (isValidMove(fromRow, fromCol, row, col)) {
            console.log(`Move from (${fromRow}, ${fromCol}) to (${row}, ${col}) is valid`);
            
            boardState[row][col] = boardState[fromRow][fromCol];
            boardState[fromRow][fromCol] = '.';
            selectedSquare = null;
            console.log(isCheck() ? 'Check!' : 'No check');//checkmate or not
            currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
            drawBoard();
        } else {
            console.log(`Move from (${fromRow}, ${fromCol}) to (${row}, ${col}) is invalid`);
            selectedSquare = null;
            drawBoard();
        }
    } else {//first click on the piece
        if (isCurrentPlayerPiece(row, col)) {
            // console.log(`Piece at (${row}, ${col}) is current player's piece`);
            selectedSquare = [row, col];
            highlightSquare(row, col);
            highlightPossibleMoves(row, col);
        } else {
            // console.log(`Piece at (${row}, ${col}) is not current player's piece`);
        }
    }
}

function highlightPossibleMoves(row, col) {
    const moves = getPossibleMoves(row, col);
    moves.forEach(([moveRow, moveCol]) => {
        const square = document.querySelector(`[data-row='${moveRow}'][data-col='${moveCol}']`);
        if (square) {
            square.classList.add('highlightpossible');
        }
    });
}

function isCheck() {
    // Find king position
    let kingRow = -1;
    let kingCol = -1;
    boardState.forEach((row, rowIndex) => {
        row.forEach((piece, colIndex) => {
            if (piece === (currentPlayer === 'white' ? 'k' : 'K')) {
                kingRow = rowIndex;
                kingCol = colIndex;
                console.log(`King found at (${kingRow}, ${kingCol})`);
            }
        });
    });

    // Check if any opponent piece can capture the king
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (isCurrentPlayerPiece(row, col)) {
                if (isValidMove(row, col, kingRow, kingCol)) {
                    return true;
                }
            }
        }
    }

    return false;
}

function isCurrentPlayerPiece(row, col) {
    const piece = boardState[row][col];
    if (piece === EMPTY_SQUARE) {
        return false;
    }
    if (currentPlayer === 'white') {
        return piece === piece.toUpperCase();
    } else {
        return piece === piece.toLowerCase();
    }
}

function isValidMove(fromRow, fromCol, toRow, toCol) {
    const piece = boardState[fromRow][fromCol].toLowerCase();
    const isWhite = boardState[fromRow][fromCol] === boardState[fromRow][fromCol].toUpperCase();
    const direction = isWhite ? -1 : 1;

    console.log(`Validating move for piece: ${piece} from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);

    // Prevent capturing own pieces
    if (isCurrentPlayerPiece(toRow, toCol)) {
        // console.log('Move invalid: cannot capture own piece');
        return false;
    }

    switch (piece) {
        case 'p': // Pawn
            return isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, direction);
        case 'r': // Rook
            return isValidRookMove(fromRow, fromCol, toRow, toCol);
        case 'n': // Knight
            return isValidKnightMove(fromRow, fromCol, toRow, toCol);
        case 'b': // Bishop
            return isValidBishopMove(fromRow, fromCol, toRow, toCol);
        case 'q': // Queen
            return isValidQueenMove(fromRow, fromCol, toRow, toCol);
        case 'k': // King
            return isValidKingMove(fromRow, fromCol, toRow, toCol);
        default:
            console.log('Move invalid: unknown piece type');
            return false;
    }
}


function isValidPawnMove(fromRow, fromCol, toRow, toCol, isWhite, direction) {
    // console.log(`Validating pawn move from (${fromRow}, ${fromCol}) to (${toRow}, ${toCol})`);
    if (toRow < 0 || toRow >= 8 || toCol < 0 || toCol >= 8) {
        return false;
    }
    if (fromCol === toCol && boardState[toRow][toCol] === EMPTY_SQUARE) {
        if (toRow === fromRow + direction) {
            // console.log('Valid single step move');
            return true;
        }
        if (((isWhite && fromRow === WHITE_PAWN_START_ROW) || (!isWhite && fromRow === BLACK_PAWN_START_ROW)) && toRow === fromRow + 2 * direction && boardState[fromRow + direction][fromCol] === EMPTY_SQUARE) {
            // console.log('Valid double step move');
            return true;
        }
    }
    if (Math.abs(fromCol - toCol) === 1 && toRow === fromRow + direction && boardState[toRow][toCol] !== EMPTY_SQUARE && !isCurrentPlayerPiece(toRow, toCol)) {
        // console.log('Valid capture move');
        return true;
    }
    // console.log('Invalid pawn move');
    return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol) {
    if (fromRow === toRow || fromCol === toCol) {
        return isPathClear(fromRow, fromCol, toRow, toCol);
    }
    return false;
}

function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    return (Math.abs(fromRow - toRow) === 2 && Math.abs(fromCol - toCol) === 1) || (Math.abs(fromRow - toRow) === 1 && Math.abs(fromCol - toCol) === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol) && isPathClear(fromRow, fromCol, toRow, toCol);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol) {
    return isValidRookMove(fromRow, fromCol, toRow, toCol) || isValidBishopMove(fromRow, fromCol, toRow, toCol);
}

function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    return Math.abs(fromRow - toRow) <= 1 && Math.abs(fromCol - toCol) <= 1;
}

function isPathClear(fromRow, fromCol, toRow, toCol) {
    const rowStep = Math.sign(toRow - fromRow);
    const colStep = Math.sign(toCol - fromCol);

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
        // Boundary checks
        if (currentRow < 0 || currentRow >= 8 || currentCol < 0 || currentCol >= 8) {
            return false;
        }

        if (boardState[currentRow][currentCol] !== EMPTY_SQUARE) {
            return false;
        }

        currentRow += rowStep;
        currentCol += colStep;
    }

    return true;
}

function highlightSquare(row, col) {
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
        square.classList.remove('highlight');
    });
    const square = document.querySelector(`.square[data-row='${row}'][data-col='${col}']`);
    square.classList.add('highlight');
}

function getPossibleMoves(row, col) {
    const piece = boardState[row][col].toLowerCase();
    const moves = [];

    switch (piece) {
        case 'p': // Pawn
            getPawnMoves(row, col, moves);
            break;
        case 'r': // Rook
            getRookMoves(row, col, moves);
            break;
        case 'n': // Knight
            getKnightMoves(row, col, moves);
            break;
        case 'b': // Bishop
            getBishopMoves(row, col, moves);
            break;
        case 'q': // Queen
            getQueenMoves(row, col, moves);
            break;
        case 'k': // King
            getKingMoves(row, col, moves);
            break;
    }

    return moves;
}

function getPawnMoves(row, col, moves) {
    const direction = currentPlayer === 'white' ? -1 : 1;
    const isWhite = currentPlayer === 'white';

    // Single step forward
    if (isValidPawnMove(row, col, row + direction, col, isWhite, direction)) {
        moves.push([row + direction, col]);
    }

    // Double step forward from starting position
    if (isWhite && row === WHITE_PAWN_START_ROW && isValidPawnMove(row, col, row + 2 * direction, col, isWhite, direction)) {
        moves.push([row + 2 * direction, col]);
    } else if (!isWhite && row === BLACK_PAWN_START_ROW && isValidPawnMove(row, col, row + 2 * direction, col, isWhite, direction)) {
        moves.push([row + 2 * direction, col]);
    }

    // Capture moves
    if (isValidPawnMove(row, col, row + direction, col - 1, isWhite, direction)) {
        moves.push([row + direction, col - 1]);
    }
    if (isValidPawnMove(row, col, row + direction, col + 1, isWhite, direction)) {
        moves.push([row + direction, col + 1]);
    }
}

function getRookMoves(row, col, moves) {
    const directions = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
    ];

    directions.forEach(([rowStep, colStep]) => {
        let currentRow = row + rowStep;
        let currentCol = col + colStep;

        while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
            if (boardState[currentRow][currentCol] === EMPTY_SQUARE) {
                moves.push([currentRow, currentCol]);
            } else {
                if (!isCurrentPlayerPiece(currentRow, currentCol)) {
                    moves.push([currentRow, currentCol]);
                }
                break;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
    });
}

function getKnightMoves(row, col, moves) {
    const knightMoves = [
        [row + 2, col + 1], [row + 2, col - 1],
        [row - 2, col + 1], [row - 2, col - 1],
        [row + 1, col + 2], [row + 1, col - 2],
        [row - 1, col + 2], [row - 1, col - 2]
    ];

    knightMoves.forEach(([toRow, toCol]) => {
        if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) { // Boundary check
            if (!isCurrentPlayerPiece(toRow, toCol)) {
                moves.push([toRow, toCol]);
            }
        }
    });
}

function getBishopMoves(row, col, moves) {
    const directions = [
        [1, 1], [1, -1], [-1, 1], [-1, -1]
    ];

    directions.forEach(([rowStep, colStep]) => {
        let currentRow = row + rowStep;
        let currentCol = col + colStep;

        while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
            if (boardState[currentRow][currentCol] === EMPTY_SQUARE) {
                moves.push([currentRow, currentCol]);
            } else {
                if (!isCurrentPlayerPiece(currentRow, currentCol)) {
                    moves.push([currentRow, currentCol]);
                }
                break;
            }
            currentRow += rowStep;
            currentCol += colStep;
        }
    });
}

function getQueenMoves(row, col, moves) {
    getRookMoves(row, col, moves);
    getBishopMoves(row, col, moves);
}

function getKingMoves(row, col, moves) {
    const kingMoves = [
        [row + 1, col], [row - 1, col],
        [row, col + 1], [row, col - 1],
        [row + 1, col + 1], [row + 1, col - 1],
        [row - 1, col + 1], [row - 1, col - 1]
    ];

    kingMoves.forEach(([toRow, toCol]) => {
        if (toRow >= 0 && toRow < 8 && toCol >= 0 && toCol < 8) { // Boundary check
            if (!isCurrentPlayerPiece(toRow, toCol)) {
                moves.push([toRow, toCol]);
            }
        }
    });
}


drawBoard();