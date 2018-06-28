
(function() {
  var size = 20;
  var quantity = 30;

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
    '*': "url('https://github.com/pardahlman/minesweeper/blob/master/Images/bomb.png?raw=true')"
  }

  var deadImgUrl = "https://png2.kisspng.com/sh/d19633b4fd54c97092e8472864540d1d/L0KzQYm3UsA1N6lBfZH0aYP2gLBuTfVud5tuReV2aXzoiX76lPlkc5Z3Rd9uYX7sfri0hvVmdJpzf598YXSwdb72ivkueJ9sRdh7ZXWwdLFAjvxwaZUyTdMCN3HndIO9hfMyO2QzSaMDM0a1QIq4VcE4P2o3T6Q7NEW2R3B3jvc=/kisspng-emoji-smiley-sticker-meaning-feeling-sad-emoji-png-free-download-5a77add26ec133.1183620915177927224537.png";

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

  var mineMapTable = document.querySelector('#minesweeper');

  function loadTemplate() {
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
        mapCell.dataset.index = i * 10 + j;
        
        mapRow.appendChild(mapCell);
      }
    }
  }

  var bombList = makeBomb();
  var map = createMap();
  var mineMap = searchBomb(map, bombList);
  loadTemplate();
  var blindCellList = document.querySelectorAll('.blind');
  var nonBombCellList = [];
  blindCellList.forEach(function(item) {
    if (item.dataset.value !== '*') {
      nonBombCellList.push(item);
    }
  });

  mineMapTable.addEventListener('click', function(e) {
    if (e.target && Array.prototype.includes.call(e.target.classList, 'blind')) {
      if (e.target.dataset.value === '*') {
        blindCellList.forEach(function(item) {
          item.classList.remove('blind');
        });
        var smileIcon = document.querySelector('.display-state');
        smileIcon.style.backgroundImage = "url('" + deadImgUrl + "')"
        alert('you died!');
        // document.querySelector('a.hide').classList.remove('hide');
      } else {
        e.target.classList.remove('blind');
        nonBombCellList.pop();
        if (nonBombCellList.length < 1) {
          alert('끝!');
          // document.querySelector('a.hide').classList.remove('hide');
        }
      }
    }
  });
})();













