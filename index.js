var boardRepresentation, game = new Chess();
var label = document.getElementById("display"); 
var pieceValueMap = new Map();

console.log(game);

pieceValueMap.set('p', 10);
pieceValueMap.set('n', 30);
pieceValueMap.set('b', 33);
pieceValueMap.set('r', 50);
pieceValueMap.set('q', 90);
pieceValueMap.set('k', 900);

label.style.visibility = "hidden";

var updateBoard = function() {
    if (game.game_over()) {
        label.style.visibility = "visible";
    }
    boardRepresentation.position(game.fen());
}

var restart = function() {
    label.style.visibility = "hidden";
    game.reset();
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
    var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
    });
    // if its an invald move, "snapback"
    if (!move) return 'snapback';
    aiMove();
}

// make the computer play its turn    
var aiMove = function() {
    if (game.game_over()) return;
    var moves = game.moves();
    game.move(moves[0]);
    var bestValue = evaluateBoard(game.SQUARES);
    game.undo();
    for (var i = 0; i < moves.length; i++) {
        game.move(moves[i]);
        var value = evaluateBoard(game.SQUARES);
        //console.log(value);
        if (value >= bestValue) {
            bestValue = value;
        } else {
            game.undo();
        }
    }
    window.setTimeout(() => { updateBoard() }, 250);
}

var evaluateBoard = function(squares) {
    var total = 0;
    for (var i = 0; i < 64; i++) {
        total += getPieceValue(game.get(squares[i]));
    }
    return total;
}

var getPieceValue = function(piece) {
    if (!piece) return 0;
    var colorCoefficient = piece.color === "w" ? -1 : 1;
    var pieceValue = pieceValueMap.get(piece.type);
    if (!pieceValue) {
        console.log(piece.type);
    }
    //console.log("colorCpefficient " + colorCoefficient);
    //console.log("pieceValue " + pieceValue);
    return colorCoefficient * pieceValue;
}

const config = {
    draggable: true,
    position: 'start',
    onDrop: onDrop,
    onDragStart: onDragStart,
};

boardRepresentation = ChessBoard('board', config);

