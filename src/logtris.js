(function () {

  var board = [];
  var score = 0;
  var level = 0;
  var levelProgress = 0;

  var startGame = function (e) {
    console.clear();

    if (e && e.which){
      console.clear();
      if (e.which === 13) {
        window.removeEventListener('keydown', startGame);
        window.addEventListener('keydown', play);
        clearBoard();
        tick();
        return;
      }
    }

    console.log('%c  console.logtris();', 'color:blue;font-size:1.5em');
    console.log('a game experiment by Eric Hannum\n\n');
    console.log('    Click on your page and');
    console.log('     press Enter to start');
  };

  var clearBoard = function () {
    for (var y = 0; y < 24; y++) {
      board[y] = [];
      for (var x = 0; x < 10; x++) {
        board[y][x] = 0;
      }
    }
  };

  var gameClock;
  var clockSpeed = 800;

  var tick = function () {
    console.clear();
    gameClock = setTimeout(tick, clockSpeed);
    if (tilesOpen(currentX, currentY+1) && inBounds(currentX, currentY+1)) {
      movePiece(0, 1);
    } else {
      bakePiece();
      if (gameOver()) return;
      spawnNewPiece();
    }
    showBoard();
  };

  var tilesOpen = function (x, y, piece) {
    piece = piece || currentPiece.shape;

    for (var i = 0; i < piece.length; i++) {
      if (!board[y+i]) continue;
      for (var j = 0; j < piece[i].length; j++) {
        if (board[y+i][x+j] && piece[i][j]) {
          return false;
        }
      }
    }

    return true;
  };

  var inBounds = function (x, y, piece) {
    piece = piece || currentPiece.shape;

    for (var i = 0; i < piece.length; i++) {
      for (var j = 0; j < piece[i].length; j++) {
        if (piece[i][j] === 1) {
          if (x + j > 9 || x + j < 0 || y + i > 23) {
            return false;
          }
        }
      }
    }
    return true;
  };

  var movePiece = function (x, y) {
    if (paused) return;
    currentX += x;
    currentY += y;
  };

  var rotatePieceCW = function () {
    var rotatedPiece = [];

    for (var i = 0; i < currentPiece.shape.length; i++) {
      for (var j = 0; j < currentPiece.shape[i].length; j++) {
        rotatedPiece[j] = rotatedPiece[j] || [];
        rotatedPiece[j][i] = currentPiece.shape[i][j];
      }
    }

    for (var k = 0; k < rotatedPiece.length; k++) {
      rotatedPiece[k] = rotatedPiece[k].reverse();
    }

    if (!tilesOpen(currentX, currentY, rotatedPiece) || currentY + rotatedPiece.length > 23) return;

    currentPiece.shape = rotatedPiece;

    if (currentX + currentPiece.shape[0].length > 9) {
      currentX = 10 - currentPiece.shape[0].length;
    } else if (currentX < 0) {
      currentX = 0;
    }
  };

  var rotatePieceCCW = function () {
    var rotatedPiece = [];

    for (var i = 0; i < currentPiece.shape.length; i++) {
      for (var j = 0; j < currentPiece.shape[i].length; j++) {
        rotatedPiece[j] = rotatedPiece[j] || [];
        rotatedPiece[j][i] = currentPiece.shape[i][j];
      }
    }

    rotatedPiece = rotatedPiece.reverse();

    if (!tilesOpen(currentX, currentY, rotatedPiece) || currentY + rotatedPiece.length > 23) return;

    currentPiece.shape = rotatedPiece;

    if (currentX + currentPiece.shape[0].length > 9) {
      currentX = 10 - currentPiece.shape[0].length;
    } else if (currentX < 0) {
      currentX = 0;
    }
  };

  window.addEventListener('keydown', startGame);

  var konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65, 13];
  var keysPressed = 0;

  var play = function(e){
    console.clear();

    if (e.which === konamiCode[keysPressed]) {
      keysPressed++;
    } else {
      keysPressed = 0;
    }

    if (keysPressed === konamiCode.length) {
      console.log('HADOKEN!');
    }

    switch (e.which) {
      case 32: // space
        pause();
        showBoard();
        break;
      case 38: // up
        rotatePieceCW();
        showBoard();
        break;
      case 40: // down
        if (tilesOpen(currentX, currentY+1) && inBounds(currentX, currentY+1)) {
          movePiece(0, 1);
          score++;
          clearTimeout(gameClock);
          gameClock = setTimeout(tick, clockSpeed);
        } else {
          bakePiece();
          if (gameOver()) return;
          spawnNewPiece();
        }
        showBoard();
        break;
      case 37: // left
        if (tilesOpen(currentX-1, currentY) && inBounds(currentX-1, currentY)) {
          movePiece(-1, 0);
        }
        showBoard();
        break;
      case 39: // right
        if (tilesOpen(currentX+1, currentY) && inBounds(currentX+1, currentY)) {
          movePiece(1, 0);
        }
        showBoard();
        break;
      case konamiCode[keysPressed-1]: // HADOKEN!
        showBoard();
        break;
      default: // boss
        if (!paused) {
          pause();
        }
        console.clear();
        break;
    }
  };

  var paused = false;

  var pause = function () {
    if (paused) {
      gameClock = setTimeout(tick, clockSpeed);
    } else {
      clearTimeout(gameClock);
    }

    paused = !paused;
  };

  var gameOver = function () {
    for (var i = 0; i < board[3].length; i++) {
      if (board[3][i]) {
        reset();
        return true;
      }
    }
  };

  var reset = function () {
    clearTimeout(gameClock);
    clockSpeed = 800;

    window.removeEventListener('keydown', play);
    setTimeout(function(){
      startGame();
      window.addEventListener('keydown', startGame);
    }, 3000);

    console.clear();
    console.log('%c  GAME OVER', 'font-size:1.5em');
    console.log('    Score: ' + score);
    score = 0;
    level = 0;
    levelProgress = 0;
  };

  var pieces = [
    {
      symbol: '[]',
      color: '#0DD',
      shape: [
        [0,0,0,0],
        [0,0,0,0],
        [1,1,1,1],
        [0,0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#90F',
      shape: [
        [0,1,0],
        [1,1,1],
        [0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#F70',
      shape: [
        [0,0,1],
        [1,1,1],
        [0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#06F',
      shape: [
        [1,0,0],
        [1,1,1],
        [0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#F00',
      shape: [
        [1,1,0],
        [0,1,1],
        [0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#0F0',
      shape: [
        [0,1,1],
        [1,1,0],
        [0,0,0]
      ]
    },
    {
      symbol: '[]',
      color: '#ED0',
      shape: [
        [0,0,0,0],
        [0,1,1,0],
        [0,1,1,0],
        [0,0,0,0]
      ]
    }
  ];

  var bag = [];

  var fillBag = function () {
    var newBag = [];
    var potentialPieces = pieces.slice();

    for (var i = 0; i < 7; i++) {
      var randomPiece;
      if (i === 0) {
        randomPiece = potentialPieces.splice(Math.floor(Math.random()*4), 1)[0];
      } else {
        randomPiece = potentialPieces.splice(Math.floor(Math.random()*potentialPieces.length), 1)[0];
      }
      newBag.push(randomPiece);
    }

    bag = bag.concat(newBag);
  };

  fillBag();

  var currentPiece = bag.shift();
  var currentX = 5 - Math.ceil(currentPiece.shape[0].length/2);
  var currentY = 4 - currentPiece.shape.length;

  var bakePiece = function () {

    var combo = 0;

    for (var i = 0; i < currentPiece.shape.length; i++) {
      for (var j = 0; j < currentPiece.shape[i].length; j++) {
        if (currentPiece.shape[i][j] === 1) {
          board[currentY + i][currentX + j] = {color: currentPiece.color, symbol: currentPiece.symbol};
        }
      }
      if (checkFullRow(currentY + i)) {
        combo++;
      }
    }

    scoreCombo(combo);
  };

  var checkFullRow = function (row) {
    if (row >= 24) return;
    var line = true;

    for (var i = 0; i < board[row].length; i++) {
      if (board[row][i] === 0) {
        line = false;
        break;
      }
    }

    if (line) {
      board.splice(row, 1);
      board.unshift([0,0,0,0,0,0,0,0,0,0]);
      levelProgress++;

      if (levelProgress >= 10) {
        gainLevel();
      }

      return true;
    }
  };


  var scoreCombo = function (combo) {
    var multipliers = [0, 40, 100, 300, 1200];

    score += multipliers[combo] * (level + 1);
  };

  var gainLevel = function () {
    level++;
    clockSpeed -= clockSpeed * 0.2;
    levelProgress = 0;
  };

  var spawnNewPiece = function () {
    currentPiece = bag.shift();
    if (bag.length < 7) fillBag();
    currentX = 5 - Math.ceil(currentPiece.shape[0].length/2);
    currentY = 4 - currentPiece.shape.length;
  };

  var showBoard = function () {
    var grid = paused ? [] : overlayPiece([], colors);
    var colors = [];
    var nextPiece = bag[0];

    for (var i = 4; i < 24; i++) {
      grid[i] = grid[i] || [];

      if (paused) {
        grid[i] = i === 12 ? '%c##       PAUSED       ##' : '%c##                    ##';
        colors.push('color:#000');
        continue;
      }

      colors.push('color:#000'); // for the '##' at the start of the row, added later

      for (var j = 0; j < 10; j++) {

        if (typeof grid[i][j] === 'object') {
          var tile = grid[i][j];
          grid[i][j] = '%c' + tile.symbol;
          colors.push('color:' + tile.color);

        } else if (typeof board[i][j] === 'object') {
          grid[i][j] = '%c' + board[i][j].symbol;
          colors.push('color:' + board[i][j].color);

        } else if (board[i][j] === 0) {
          grid[i][j] = '%c  ';
          colors.push('color:#000');
        }
      }

      grid[i].unshift('%c##');
      grid[i].push('%c##');
      colors.push('color:#000');

      if (nextPiece.shape[i-4]) {
        grid[i].push('%c  ');
        colors.push('color:#000');

        for (var k = 0; k < nextPiece.shape[i-4].length; k++) {

          if (nextPiece.shape[i-4][k] === 1) {
            grid[i].push('%c' + nextPiece.symbol);
            colors.push('color:' + nextPiece.color);

          } else if (nextPiece.shape[i-4][k] === 0) {
            grid[i].push('%c  ');
            colors.push('color:#000');
          }
        }
      }

      grid[i] = grid[i].join('');
    }

    grid = grid.splice(4);
    grid.unshift('%c########################   NEXT');
    colors.unshift('color:#000');
    grid.push('%c########################');
    colors.push('color:#000');
    grid.push('%cLEVEL: ' + level + ' SCORE: ' + score);
    colors.push('color:#000');

    colors.unshift(grid.join('\n'));

    console.log.apply(this, colors);
  };

  var overlayPiece = function (grid) {
    for (var i = 0; i < currentPiece.shape.length; i++) {
      if (currentY + i >= 24 || currentY + i < 4) continue;
      grid[currentY + i] = [];
      for (var j = 0; j < currentPiece.shape[i].length; j++) {
        if (currentPiece.shape[i][j] === 1) {
          grid[currentY + i][currentX + j] = {color: currentPiece.color, symbol: currentPiece.symbol};
        }
      }
    }

    return grid;
  };

  startGame();
})();
