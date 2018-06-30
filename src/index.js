
(function() {
  var size = 10;
  var quantity = 10;
  var countBombLeftQuantity = quantity;
  var nonBombCellCount = Math.pow(size, 2) - quantity;
  var blindCellList = [];
  var nonBombCellList = [];
  var surroundElementsList = [];
  var timerID;
  var isFirst = true;
  var smileIcon = document.querySelector('.display-status');
  var btnContainer = document.querySelector('.btn-container');
  var displayBombLeft = document.querySelector('.display-count-bomb-left');
  var mineMapTable = document.querySelector('#minesweeper');
  var timerDisplay = document.querySelector('.display-timer');
  var sourceImgUrl = {
    0: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/0.png?raw=true')",
    1: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/1.png?raw=true')",
    2: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/2.png?raw=true')",
    3: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/3.png?raw=true')",
    4: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/4.png?raw=true')",
    5: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/5.png?raw=true')",
    6: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/6.png?raw=true')",
    7: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/7.png?raw=true')",
    8: "url('https://github.com/pardahlman/minesweeper/blob/master/Images/8.png?raw=true')",
    '*': "url('https://github.com/pardahlman/minesweeper/blob/master/Images/bomb.png?raw=true')",
    'dead': "url('https://github.com/kizmo04/Minesweeper/blob/master/img/sad-emoji.png?raw=true')"
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

  function loadTemplate() {
    nonBombCellCount = Math.pow(size, 2) - quantity;
    smileIcon.classList.remove('dead');
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

  var prevCell;

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

  mineMapTable.addEventListener('mousedown', function(e) {
    if (e.target && e.target.className.includes('blind')) {
      if (e.buttons === 2) {
        e.target.classList.toggle('flagged');
        if (e.target.dataset.flagged) {
          e.target.dataset.flagged = false;
          countBombLeft(++countBombLeftQuantity);
        } else {
          e.target.dataset.flagged = true;
          countBombLeft(--countBombLeftQuantity);
        }
      } else if (e.buttons === 0) {
        if (prevCell) {
          prevCell.classList.remove('pushed');
        }
        prevCell = e.target;
        e.target.classList.add('pushed');
      }
    } else if (e.target.dataset.value !== '0'){
      surroundElementsList = findSurroundElements(parseInt(e.target.dataset.index));
      surroundElementsList.forEach(function(element) {
        if (element) element.classList.add('pushed');
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
    if (surroundElementsList.length > 0) {
      surroundElementsList.forEach(function(element) {
        if (element) element.classList.remove('pushed');
      });
    }

    if (e.target && e.target.tagName === 'TD' && !e.target.dataset.flagged) {
      if (e.buttons === 0) {
        if (isFirst) {
          timerID = startTimer();
          isFirst = false;
        }
        e.target.classList.remove('pushed');
        e.target.classList.remove('blind');
        prevCell = null;
        if (e.target.dataset.value === '*') {
          blindCellList.forEach(function(item) {
            item.classList.remove('blind');
          });
          smileIcon.classList.add('dead');
        } else {
          e.target.classList.remove('blind');
          // nonBombCellList.pop();
          nonBombCellCount--;
          if (nonBombCellCount === 0) {
            alert('끝!');
          }
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

  btnContainer.addEventListener('click', function(e) {
    e.preventDefault();
    var mainMenus = document.querySelector('.main-menu-container');
    var difficultyMenus = document.querySelector('.difficulty-menu-container');
    if (e.target && e.target.className.includes('difficulty')) {
      difficultyMenus.classList.remove('hide');
      mainMenus.classList.add('hide');
    } else if (e.target && e.target.className.includes('score')) {

    } else if (e.target && e.target.className.includes('close')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');
    } else if (e.target.className.includes('beginner')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 10;
      quantity = 10;
      startGame();
    } else if (e.target.className.includes('amateur')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 15;
      quantity = 40;
      startGame();
    } else if (e.target.className.includes('expert')) {
      difficultyMenus.classList.add('hide');
      mainMenus.classList.remove('hide');

      size = 20;
      quantity = 100;
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
      timeDigits++;
    }
    return setInterval(changeDigits, 1000);
  }


  var bombList = makeBomb();
  var map = createMap();
  var mineMap = searchBomb(map, bombList);
  loadTemplate();

})();













