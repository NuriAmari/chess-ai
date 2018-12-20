var boardRepresentation, game = new Chess();
var label = document.getElementById("display"); 
var pieceValueMap = new Map();
var positionsEvaluated = 0;
var currTotal = 0;
var totalMoves = 0;

pieceValueMap.set('p', 10);
pieceValueMap.set('n', 30);
pieceValueMap.set('b', 33);
pieceValueMap.set('r', 50);
pieceValueMap.set('q', 90);
pieceValueMap.set('k', 900);

var getPieceValue = function(piece) {
    if (!piece) return 0;
    var colorCoefficient = piece.color === "w" ? -1 : 1;
    var pieceValue = pieceValueMap.get(piece.type);
    if (!pieceValue) {
        console.log(piece.type);
    }
    return colorCoefficient * pieceValue;
}

for (var i = 0; i < 64; i++) {
    pieceValueMap.set(game.SQUARES[i], getPieceValue(game.get(game.SQUARES[i])));
}

label.style.visibility = "hidden";

var updateBoard = function() {
    if (game.game_over()) {
        label.style.visibility = "visible";
    }
    boardRepresentation.position(game.fen());
}

var restart = function() {
    game.reset();
    currTotal = 0;
    for (var i = 0; i < 64; i++) {
        pieceValueMap.set(game.SQUARES[i], getPieceValue(game.get(game.SQUARES[i])));
    }
    label.style.visibility = "hidden";
    updateBoard();
}

// prevent moving the bot's pieces and if the game is over
var onDragStart = function(source, piece, position, orientation) {
    if (game.game_over() === true || piece.search(/^w/) === -1) {
        return false;
    }
}

var onDrop = function(source, target) {
    // execute the attempted players move
    var move = Move(game, {from: source, to: target, promotion: 'q'});
    // if its an invald move, "snapback"
    if (!move) return 'snapback';
    //aiMove();
    /*var moves = game.moves();
    var bestTotal = -999999;
    var bestMove = moves[0];
    for (var i = 0; i < moves.length; i++) {
        Move(game, moves[i]);
        if (currTotal > bestTotal) {
            bestTotal = currTotal;
            bestMove = moves[i];
        }
        Undo(game, moves[i]);
    }
    Move(game, bestMove);
    window.setTimeout(() => { updateBoard(); }, 250);*/
    aiMove();
}

var Move = function(board, move) {
    move = board.move(move);
    if (!move) return move;
    var moveTo = pieceValueMap.get(move.to);
    var moveFrom  = pieceValueMap.get(move.from);
    if (moveTo != 0) {
        currTotal -= moveTo;
    }
    pieceValueMap.set(move.to, moveFrom);
    pieceValueMap.set(move.from, 0);
    return move;
}

var Undo = function(board, move) {
    move = board.undo();
    if (!move) return;
    pieceValueMap.set(move.from, pieceValueMap.get(move.to));
    var revivedPiece = getPieceValue(board.get(move.to));
    pieceValueMap.set(move.to, revivedPiece);
    if (revivedPiece != 0) {
        currTotal += revivedPiece;
    }
}

// make the computer play its turn    
var aiMove = function() {
    if (game.game_over()) return;
    var moves = game.moves();
    var bestMove = moves[0];
    Move(game, bestMove);
    var bestValue = recursiveBestMove(game, 3, -99999);
    Undo(game, bestMove);
    console.log(0);
    for (var i = 1; i < moves.length; i++) {
        console.log(i);
        Move(game, moves[i]);
        var currValue = recursiveBestMove(game, 3, bestValue);
        if (currValue > bestValue) {
            bestValue = currValue;
            bestMove = moves[i];
        }         
        Undo(game, moves[i]);
    }
    Move(game, bestMove); 
    window.setTimeout(() => {updateBoard();}, 250);
}

var recursiveBestMove = function(board, depth, bestValue) {
    if (depth <= 0 || currTotal <= bestValue) {
        return currTotal;
    }
    depth -= 2;
    var blackMoves = board.moves();
    Move(board, blackMoves[0]);
    var bestBlackValue = recursiveBestMove(board, depth, bestValue);
    Undo(board, blackMoves[0]);
    for(var i = 1; i < blackMoves.length; i++) {
        Move(board, blackMoves[i]);
        var completeWhiteMove = whiteMove(board);
        var currBlackValue = recursiveBestMove(board, depth, bestValue);    
        if (currBlackValue > bestBlackValue) {
            bestBlackValue = currBlackValue;
        }
        Undo(board, completeWhiteMove);
        Undo(board, blackMoves[i]);
    }
    return bestBlackValue;
}

var whiteMove = function(board) {
    var whiteMoves = board.moves();
    var bestWhiteMove = whiteMoves[0];
    Move(board, bestWhiteMove);
    var bestWhiteValue = currTotal;
    Undo(board, bestWhiteMove);
    for (var i = 1; i < whiteMoves.length; i++) {
        Move(board, whiteMoves[i]);
        var currWhiteValue = currTotal;
        if (currWhiteValue < bestWhiteValue) {
            bestWhiteValue = currWhiteValue;
            bestWhiteMove = whiteMoves[i];
        }
        Undo(board, whiteMoves[i]);
    }
    Move(board, bestWhiteMove);
    return bestWhiteMove;
}

const config = {
    draggable: true,
    position: 'start',
    onDrop: onDrop,
    onDragStart: onDragStart,
};

boardRepresentation = ChessBoard('board', config);

