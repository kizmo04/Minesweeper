
(function() {
  var size = 5;
  var quantity = 1;

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
        mapCell.dataset.index = i * 10 + j;
        mapCell.textContent = mineMap[i][j];
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
        alert('you died!');
        document.querySelector('a.hide').classList.remove('hide');
      } else {
        e.target.classList.remove('blind');
        nonBombCellList.pop();
        if (nonBombCellList.length < 1) {
          alert('끝!');
          document.querySelector('a.hide').classList.remove('hide');
        }
      }
    }
  });
})();













