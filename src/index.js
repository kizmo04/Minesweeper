
(function() {
  var size = 10;
  var quantity = 10;
  var countBombLeftQuantity = quantity;
  var blindCellList = [];
  var nonBombCellList = [];
  var surroundElementsList = [];
  var timerID;
  var difficulty = 'easy';
  var userName;
  var isFirst = true;
  var scoreStorage;
  var count = 0;
  var cellsToOpen = [];
  var memo = [];
  var prevCell;
  var smileIcon = document.querySelector('.display-status');
  var btnContainer = document.querySelector('.btn-container');
  var displayBombLeft = document.querySelector('.display-count-bomb-left');
  var mineMapTable = document.querySelector('#minesweeper');
  var timerDisplay = document.querySelector('.display-timer');
  var scoreBoard = document.querySelector('.score-board');
  var scoreContainer = document.querySelector('.score-container');
  var scoreBoardContainer = document.querySelector('.score-board-container');
  var gameContainer = document.querySelector('.game-container');
  var mainMenus = document.querySelector('.main-menu-container');
  var difficultyMenus = document.querySelector('.difficulty-menu-container');
  var sourceImgUrl = {
    0: "url('https://minesweeper.online/img/skins/hd/type0.svg')",
    1: "url('https://minesweeper.online/img/skins/hd/type1.svg')",
    2: "url('https://minesweeper.online/img/skins/hd/type2.svg')",
    3: "url('https://minesweeper.online/img/skins/hd/type3.svg')",
    4: "url('https://minesweeper.online/img/skins/hd/type4.svg')",
    5: "url('https://minesweeper.online/img/skins/hd/type5.svg')",
    6: "url('https://minesweeper.online/img/skins/hd/type6.svg')",
    7: "url('https://minesweeper.online/img/skins/hd/type7.svg')",
    8: "url('https://minesweeper.online/img/skins/hd/type8.svg')",
    '*': "url('https://minesweeper.online/img/skins/hd/mine.svg')",
    '*red': "url('https://minesweeper.online/img/skins/hd/mine_red.svg')",
    'dead': "url('https://github.com/kizmo04/Minesweeper/blob/master/img/sad-emoji.png?raw=true')",
    'victory': "url('https://github.com/kizmo04/Minesweeper/blob/master/img/victory-emoji.png?raw=true')",
    'hmm': "url('https://github.com/kizmo04/Minesweeper/blob/master/img/hmm-emoji.png?raw=true')",
    'wink': "url('https://github.com/kizmo04/Minesweeper/blob/master/img/wink-emoji.png?raw=true')"
  };
  var digitImgUrl = {
    0: "url('https://minesweeper.online/img/skins/hd/d0.svg')",
    1: "url('https://minesweeper.online/img/skins/hd/d1.svg')",
    2: "url('https://minesweeper.online/img/skins/hd/d2.svg')",
    3: "url('https://minesweeper.online/img/skins/hd/d3.svg')",
    4: "url('https://minesweeper.online/img/skins/hd/d4.svg')",
    5: "url('https://minesweeper.online/img/skins/hd/d5.svg')",
    6: "url('https://minesweeper.online/img/skins/hd/d6.svg')",
    7: "url('https://minesweeper.online/img/skins/hd/d7.svg')",
    8: "url('https://minesweeper.online/img/skins/hd/d8.svg')",
    9: "url('https://minesweeper.online/img/skins/hd/d9.svg')",
    '-': "url('https://minesweeper.online/img/skins/hd/d-.svg')"
  };

  // Initialize Firebase
  var firebase = require("firebase");
  var config = {
    apiKey: "AIzaSyAfD4FaWZyBRc8UgPL5P47wL4mOhLNu2yM",
    authDomain: "minesweeper-edd23.firebaseapp.com",
    databaseURL: "https://minesweeper-edd23.firebaseio.com",
    projectId: "minesweeper-edd23",
    storageBucket: "",
    messagingSenderId: "537666346206"
  };
  firebase.initializeApp(config);

  var database = firebase.database();

  var gameDataRef;
  gameDataRef = database.ref('games');

  var gameDataKeys;

  function createMap() {
    var mapRow = new Array(size);
    for (var i = 0; i < size; i++) {
      mapRow[i] = new Array(size);
      for (var j = 0; j < size; j++) {
        mapRow[i][j] = 0;
      }
    }
    return mapRow;
  }

  function Bomb(locationX, locationY) {
    this.locationX = locationX;
    this.locationY = locationY;
  }

  function getRandom(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function makeBomb() {
    var bombList = [];
    var prevBombLocation = [];

    while (bombList.length < quantity) {
      var x = getRandom(0, size);
      var y = getRandom(0, size);
      var tempLocation = x + '-' + y;
      if (!prevBombLocation.includes(tempLocation)) {
        bombList.push(new Bomb(x, y));
        prevBombLocation.push(tempLocation);
      }
    }
    return bombList;
  }

  function searchBomb(map, bombList) {
    for (var i = 0; i < bombList.length; i++) {
      for (var j = bombList[i].locationX - 1; j <= bombList[i].locationX + 1; j++) {
        for (var k = bombList[i].locationY - 1; k <= bombList[i].locationY + 1; k++) {
          if (0 <= j && j <= size - 1 && 0 <= k && k <= size - 1) {
            if (j === bombList[i].locationX && k === bombList[i].locationY) {
              map[j][k] = '*';
            } else if (map[j][k] !== '*') {
              map[j][k] += 1;
            }
          }
        }
      }
    }
    return map;
  }

  gameDataRef.once('value').then(function(score) {
    console.log(score.games);
  });

  function loadTemplate() {
    // scoreStorage = JSON.parse(window.localStorage.getItem("minesweeper"));
    smileIcon.style.backgroundImage = sourceImgUrl.wink;
    countBombLeftQuantity = quantity;
    countBombLeft(countBombLeftQuantity);
    if (timerID) clearInterval(timerID);
    isFirst = true;
    timerDisplay.querySelector('.section-1').style.backgroundImage = digitImgUrl[0];
    timerDisplay.querySelector('.section-2').style.backgroundImage = digitImgUrl[0];
    timerDisplay.querySelector('.section-3').style.backgroundImage = digitImgUrl[0];
    for (var i = 0; i < size; i++) {
      var mapRow = document.createElement('tr');
      mapRow.classList.add('map-row');
      mineMapTable.appendChild(mapRow);
      for (var j = 0; j < size; j++) {
        var mapCell = document.createElement('td');
        mapCell.classList.add('map-cell');
        mapCell.classList.add('blind');
        mapCell.dataset.value = mineMap[i][j];
        mapCell.style.backgroundImage = sourceImgUrl[mineMap[i][j]];
        mapCell.dataset.index = i * size + j;
        mapRow.appendChild(mapCell);
      }
    }
    blindCellList = document.querySelectorAll('.blind');

    for (var i = 0; i < 10; i++) {
      var record = scoreBoard.insertRow();
      record.classList.add('score-list');
      var dateCell = record.insertCell();
      dateCell.classList.add('td-date');
      var usernameCell = record.insertCell();
      usernameCell.classList.add('td-username');
      var difficultyCell = record.insertCell();
      difficultyCell.classList.add('td-difficulty');
      var scoreCell = record.insertCell();
      scoreCell.classList.add('td-score');
    }
  }



  function countBombLeft(count) {
    var countToString = count.toString(10);
    countToString = countToString.length === 1 ? '00' + countToString :
      countToString.length === 2 ? '0' + countToString : countToString;
    displayBombLeft.querySelector('.section-1').style.backgroundImage = digitImgUrl[countToString.charAt(0)];
    displayBombLeft.querySelector('.section-2').style.backgroundImage = digitImgUrl[countToString.charAt(1)];
    displayBombLeft.querySelector('.section-3').style.backgroundImage = digitImgUrl[countToString.charAt(2)];
  }


  window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
  }, false);

  mineMapTable.addEventListener('mousemove', function(e) {
    e.preventDefault();
    if (e.target && e.target.tagName === 'TD') {
      if (e.buttons === 1) {
        if (prevCell) {
          prevCell.classList.remove('pushed');
        }
        prevCell = e.target;
        e.target.classList.add('pushed');
      }
    }
  });

  mineMapTable.addEventListener('touchend', function(e) {

    if (e.target && e.target.className.includes('blind')) {
      if (isFirst) {
        timerID = startTimer();
        isFirst = false;
      }

      if (e.target.dataset.value === '*') {
        blindCellList.forEach(function(item) {
          item.classList.remove('blind');
        });
        smileIcon.style.backgroundImage = sourceImgUrl.dead;
        e.target.style.backgroundImage = sourceImgUrl['*red'];
        clearInterval(timerID);
      } else if (e.target.className.includes('blind')) {
        e.target.classList.remove('blind');
        if (e.target.dataset.value === '0') {
          var zeroCellList = findZeroCells(e.target);
          zeroCellList.forEach(function(cell) {
            cell.classList.remove('blind');
          });
        }
        if (document.querySelectorAll('.blind').length === quantity) {
          clearInterval(timerID);
          smileIcon.style.backgroundImage = sourceImgUrl.victory;
          var leftBombList = document.querySelectorAll('td[data-value="*"]');
          leftBombList.forEach(function(item) {
            item.classList.add('flagged');
          });
          userName = prompt('승리했습니다! 이름을 입력해주세요', 'user name');
          var gameData = {};
          gameData.date = new Date().toLocaleDateString();
          gameData.username = userName;
          gameData.difficulty = difficulty;
          gameData.score = timerDisplay.dataset.time;
          // scoreStorage.push(gameData);
          // gameDataRef.set(scoreStorage);
          var newGameData = gameDataRef.push();
          newGameData.set(gameData);
          // displayScoreBoard();
          scoreBoardContainer.classList.remove('hide');
          // window.localStorage.setItem("minesweeper", JSON.stringify(scoreStorage));
        }
      }


    }
  });

  mineMapTable.addEventListener('mousedown', function(e) {
    if (e.target && e.target.className.includes('blind')) {
      smileIcon.style.backgroundImage = sourceImgUrl.hmm;
      if (e.buttons === 2) {
        if (!e.target.className.includes('flagged')) {
          e.target.classList.add('flagged');
          countBombLeft(--countBombLeftQuantity);
        } else {
          e.target.classList.remove('flagged');
          countBombLeft(++countBombLeftQuantity);
        }
      } else if (e.buttons === 1 && !e.target.className.includes('flagged')) {
        if (prevCell) {
          prevCell.classList.remove('pushed');
        }
        e.target.classList.add('pushed');
        prevCell = e.target;
      }
    } else if (e.target.dataset.value !== '0'){
      surroundElementsList = findSurroundElements(parseInt(e.target.dataset.index));
      surroundElementsList.forEach(function(element) {
        if (element && !element.className.includes('flagged')) element.classList.add('pushed');
      });
    }
  });

  function findSurroundElements(centerElementIndex) {
    var surroundElementsList = [];
    var lastDigit = centerElementIndex.toString(10).charAt(centerElementIndex.toString(10).length - 1);

    if (lastDigit !== '0') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex - 1) +'"]'));
    if (lastDigit !== '9') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex + 1) +'"]'));

    if (centerElementIndex >= size) {
      if (lastDigit !== '0') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex - 1 - size) +'"]'));
      surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex - size) +'"]'));
      if (lastDigit !== '9') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex + 1 - size) +'"]'));
    }

    if (centerElementIndex < size * 10 - size) {
      if (lastDigit !== '0') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex - 1 + size) +'"]'));
      surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex + size) +'"]'));
      if (lastDigit !== '9') surroundElementsList.push(document.querySelector('td.blind[data-index="'+ (centerElementIndex + 1 + size) +'"]'));
    }
    return surroundElementsList;
  }

  mineMapTable.addEventListener('mouseup', function(e) {
    smileIcon.style.backgroundImage = sourceImgUrl.wink;
    if (surroundElementsList.length > 0) {
      surroundElementsList.forEach(function(element) {
        if (element && !element.className.includes('flagged')) element.classList.remove('pushed');
      });
      surroundElementsList.length = 0;
    }

    if (e.target && e.target.className.includes('blind') && e.target.className.includes('pushed')) {
      if (isFirst) {
        timerID = startTimer();
        isFirst = false;
      }
      e.target.classList.remove('pushed');
      prevCell = null;
      if (e.target.dataset.value === '*') {
        blindCellList.forEach(function(item) {
          item.classList.remove('blind');
        });
        smileIcon.style.backgroundImage = sourceImgUrl.dead;
        e.target.style.backgroundImage = sourceImgUrl['*red'];
        clearInterval(timerID);
      } else if (e.target.className.includes('blind')) {
        e.target.classList.remove('blind');
        if (e.target.dataset.value === '0') {
          var zeroCellList = findZeroCells(e.target);
          zeroCellList.forEach(function(cell) {
            cell.classList.remove('blind');
          });
        }
        if (document.querySelectorAll('.blind').length === quantity) {
          clearInterval(timerID);
          smileIcon.style.backgroundImage = sourceImgUrl.victory;
          var leftBombList = document.querySelectorAll('td[data-value="*"]');
          leftBombList.forEach(function(item) {
            item.classList.add('flagged');
          });
          userName = prompt('승리했습니다! 이름을 입력해주세요', 'user name');
          var gameData = {};
          gameData.date = new Date().toLocaleDateString();
          gameData.username = userName;
          gameData.difficulty = difficulty;
          gameData.score = timerDisplay.dataset.time;
          // scoreStorage.push(gameData);
          // gameDataRef.set(scoreStorage);
          var newGameData = gameDataRef.push();
          newGameData.set(gameData);
          // displayScoreBoard();
          // gameDataRef.on('child_added', function(score) {
          //   displayScoreBoard(score.val());
          // });
          scoreBoardContainer.classList.remove('hide');
          // window.localStorage.setItem("minesweeper", JSON.stringify(scoreStorage));
        }
      }
    }
  });

  function startGame() {
    while (mineMapTable.hasChildNodes()) {
      mineMapTable.removeChild(mineMapTable.firstChild);
    }
    bombList = makeBomb();
    map = createMap();
    mineMap = searchBomb(map, bombList);
    loadTemplate();
  }

  smileIcon.addEventListener('click', function(e) {
    if (e.target && e.target.className.includes('display-status')) {
      startGame();
    }
  });

  scoreBoardContainer.addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target && e.target.className.includes('score-board-close')) {
      scoreBoardContainer.classList.add('hide');
      mainMenus.classList.remove('hide');
    }
  });

  btnContainer.addEventListener('click', function(e) {
    e.preventDefault();
    if (e.target && e.target.className.includes('difficulty')) {
      difficultyMenus.classList.remove('hide');
      mainMenus.classList.add('hide');
    } else if (e.target && e.target.className.includes('score')) {
      scoreBoardContainer.classList.remove('hide');
      mainMenus.classList.add('hide');
      // displayScoreBoard(scoreStorage);
    } else if (e.target && e.target.className.includes('close')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');
    } else if (e.target.className.includes('beginner')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 10;
      quantity = 10;
      difficuty = "easy";
      gameContainer.style.width = (30 * size + 60) + 'px';
      scoreContainer.style.width = (30 * size) + 'px';
      startGame();
    } else if (e.target.className.includes('amateur')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 15;
      quantity = 40;
      difficuty = "normal";
      gameContainer.style.width = (30 * size + 60) + 'px';
      scoreContainer.style.width = (30 * size) + 'px';
      startGame();
    } else if (e.target.className.includes('expert')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 20;
      quantity = 100;
      difficuty = "hard";
      gameContainer.style.width = (30 * size + 60) + 'px';
      scoreContainer.style.width = (30 * size) + 'px';
      startGame();
    }
  });

  function startTimer() {
    var timeDigits = 0;

    function changeDigits() {
      var timeDigitsToString = timeDigits.toString(10);
      timeDigitsToString = timeDigitsToString.length === 1 ? '00' + timeDigitsToString :
      timeDigitsToString.length === 2 ? '0' + timeDigitsToString : timeDigitsToString;

      timerDisplay.querySelector('.section-1').style.backgroundImage = digitImgUrl[timeDigitsToString.charAt(0)];
      timerDisplay.querySelector('.section-2').style.backgroundImage = digitImgUrl[timeDigitsToString.charAt(1)];
      timerDisplay.querySelector('.section-3').style.backgroundImage = digitImgUrl[timeDigitsToString.charAt(2)];
      timerDisplay.dataset.time = timeDigitsToString;
      timeDigits++;
    }
    return setInterval(changeDigits, 1000);
  }

  function findZeroCells(cell) {

    if (cell.dataset.value !== '0' && cell.dataset.value !== '*') {
      cellsToOpen.push(cell);
      return cellsToOpen;
    }

    if (!memo.includes(cell)) {
      memo.push(cell);
      if (cell.dataset.value !== '*') cellsToOpen.push(cell);
    }
    var leftIndex = parseInt(cell.dataset.index) - 1;
    var rightIndex = parseInt(cell.dataset.index) + 1;
    var prevRowIndex = parseInt(cell.dataset.index) - size;
    var nextRowIndex = parseInt(cell.dataset.index) + size;

    var leftCell = document.querySelector('td[data-index="' + leftIndex + '"]');
    var rightCell = document.querySelector('td[data-index="' + rightIndex + '"]');
    var upCell = document.querySelector('td[data-index="' + prevRowIndex + '"]');
    var downCell = document.querySelector('td[data-index="' + nextRowIndex + '"]');

    if (leftCell && !memo.includes(leftCell) && (parseInt(cell.dataset.index) % size) !== 0) cellsToOpen.concat(findZeroCells(leftCell));
    if (rightCell && !memo.includes(rightCell) && (parseInt(cell.dataset.index) % size) !== (size - 1)) cellsToOpen.concat(findZeroCells(rightCell));
    if (upCell && !memo.includes(upCell)) cellsToOpen.concat(findZeroCells(upCell));
    if (downCell && !memo.includes(downCell)) cellsToOpen.concat(findZeroCells(downCell));

    return cellsToOpen;
  }

  firebase.database().ref('games').orderByChild('score').limitToFirst(10).on('value', function(snapshot) {
    var sortedScoreData = snapshot.val();
    var sortedScoreDataKeys = Object.keys(snapshot.val());
    console.log(sortedScoreDataKeys);
    var recordRows = document.querySelectorAll('.score-list:not(:first-child)');

    for (var i = 0; i < sortedScoreDataKeys.length; i++) {
      var dateCell = recordRows[i].cells[0];
      dateCell.textContent = sortedScoreData[sortedScoreDataKeys[sortedScoreDataKeys.length - 1 - i]].date;
      var usernameCell = recordRows[i].cells[1];
      usernameCell.textContent = sortedScoreData[sortedScoreDataKeys[sortedScoreDataKeys.length - 1- i]].username;
      var difficultyCell = recordRows[i].cells[2];
      difficultyCell.textContent = sortedScoreData[sortedScoreDataKeys[sortedScoreDataKeys.length - 1 - i]].difficulty;
      var scoreCell = recordRows[i].cells[3];
      scoreCell.textContent = sortedScoreData[sortedScoreDataKeys[sortedScoreDataKeys.length - 1 - i]].score;
    }
  });

  // function displayScoreBoard() {
  //   // if (scoreBoard.hasChildNodes()) {
  //   //   while (scoreBoard.children.length > 1) {
  //   //     scoreBoard.lastChild.remove();
  //   //   }
  //   // }

  // }

  var bombList = makeBomb();
  var map = createMap();
  var mineMap = searchBomb(map, bombList);
  loadTemplate();

})();













