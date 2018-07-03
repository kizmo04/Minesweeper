/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(6);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(3);
__webpack_require__(4);
module.exports = __webpack_require__(7);


/***/ }),
/* 3 */
/***/ (function(module, exports) {


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
    scoreStorage = JSON.parse(score.val());
  });

  function loadTemplate() {
    // scoreStorage = JSON.parse(window.localStorage.getItem("minesweeper"));
    // if (!scoreStorage) scoreStorage = [];
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
          scoreStorage.push(gameData);
          displayScoreBoard(scoreStorage);
          gameDataRef.set(JSON.stringify(scoreStorage));
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
          scoreStorage.push(gameData);
          gameDataRef.set(JSON.stringify(scoreStorage));
          displayScoreBoard(scoreStorage);
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
    console.log(typeof e.target.className)
    e.preventDefault();
    if (e.target && e.target.className.includes('difficulty')) {
      difficultyMenus.classList.remove('hide');
      mainMenus.classList.add('hide');
    } else if (e.target && e.target.className.includes('score')) {
      scoreBoardContainer.classList.remove('hide');
      mainMenus.classList.add('hide');
      displayScoreBoard(scoreStorage);
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

  function displayScoreBoard(scoreStorageData) {
    if (scoreBoard.hasChildNodes()) {
      while (scoreBoard.hasChildNodes()) {
        scoreBoard.firstChild.remove();
      }
    }
    scoreStorageData.forEach(function(item) {
      var record = scoreBoard.insertRow();
      record.classList.add('score-list');
      var dateCell = record.insertCell();
      dateCell.textContent = item.date;
      dateCell.classList.add('td-date');
      var usernameCell = record.insertCell();
      usernameCell.textContent = item.username;
      usernameCell.classList.add('td-username');
      var difficultyCell = record.insertCell();
      difficultyCell.textContent = item.difficulty;
      difficultyCell.classList.add('td-difficulty');
      var scoreCell = record.insertCell();
      scoreCell.textContent = item.score;
      scoreCell.classList.add('td-score');
    });
  }

  var bombList = makeBomb();
  var map = createMap();
  var mineMap = searchBomb(map, bombList);
  loadTemplate();

})();















/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/cjs.js!./reset.less", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/cjs.js!./reset.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// imports


// module
exports.push([module.i, "/* reset--------------------------------- */\n/* http://meyerweb.com/eric/tools/css/reset/\n   v2.0 | 20110126\n   License: none (public domain)\n*/\nhtml,\nbody,\ndiv,\nspan,\napplet,\nobject,\niframe,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6,\np,\nblockquote,\npre,\na,\nabbr,\nacronym,\naddress,\nbig,\ncite,\ncode,\ndel,\ndfn,\nem,\nimg,\nins,\nkbd,\nq,\ns,\nsamp,\nsmall,\nstrike,\nstrong,\nsub,\nsup,\ntt,\nvar,\nb,\nu,\ni,\ncenter,\ndl,\ndt,\ndd,\nol,\nul,\nli,\nfieldset,\nform,\nlabel,\nlegend,\ntable,\ncaption,\ntbody,\ntfoot,\nthead,\ntr,\nth,\ntd,\narticle,\naside,\ncanvas,\ndetails,\nembed,\nfigure,\nfigcaption,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\noutput,\nruby,\nsection,\nsummary,\ntime,\nmark,\naudio,\nvideo {\n  margin: 0;\n  padding: 0;\n  border: 0;\n  font-size: 100%;\n  font: inherit;\n  vertical-align: baseline;\n}\n/* HTML5 display-role reset for older browsers */\narticle,\naside,\ndetails,\nfigcaption,\nfigure,\nfooter,\nheader,\nhgroup,\nmenu,\nnav,\nsection {\n  display: block;\n}\nbody {\n  line-height: 1;\n}\nol,\nul {\n  list-style: none;\n}\nblockquote,\nq {\n  quotes: none;\n}\nblockquote:before,\nblockquote:after,\nq:before,\nq:after {\n  content: '';\n  content: none;\n}\ntable {\n  border-collapse: collapse;\n  border-spacing: 0;\n}\n", ""]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(1)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/cjs.js!./style.less", function() {
			var newContent = require("!!../node_modules/css-loader/index.js!../node_modules/less-loader/dist/cjs.js!./style.less");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(0)(false);
// imports


// module
exports.push([module.i, "body {\n  background-color: black;\n}\nh1 {\n  color: #ffe600;\n}\n@media screen and (min-width: 600px) {\n  .minesweeper-container {\n    width: 50%;\n    margin: 0 auto;\n    padding: 100px 0;\n  }\n  .minesweeper-container #title {\n    font-size: 3em;\n    font-family: 'Bungee Shade', cursive;\n    text-align: center;\n    padding: 20px;\n  }\n  .minesweeper-container .btn-container {\n    width: 90%;\n    height: 70px;\n    margin: 0 auto;\n    text-align: center;\n    position: relative;\n  }\n  .minesweeper-container .btn-container a.btn-close {\n    position: absolute;\n    top: -15px;\n    right: -150px;\n  }\n  .minesweeper-container .btn-container .difficulty-menu-container {\n    position: absolute;\n    top: 0;\n  }\n  .minesweeper-container .game-container {\n    margin: 0 auto;\n    width: 360px;\n  }\n  .minesweeper-container .game-container .game-box {\n    padding: 20px;\n    background-color: #CCCCCC;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box .score-container {\n    overflow: hidden;\n    width: 300px;\n    margin: 0 auto;\n    margin-bottom: 20px;\n    background-color: #CCCCCC;\n    border-right: 4px solid white;\n    border-bottom: 4px solid white;\n    border-top: 4px solid #808080;\n    border-left: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section {\n    width: 33%;\n    overflow: hidden;\n    float: left;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-count-bomb-left {\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-status {\n    cursor: pointer;\n    background-color: #CCCCCC;\n    background-image: url(\"https://github.com/kizmo04/Minesweeper/blob/master/img/wink-emoji.png?raw=true\");\n    background-repeat: no-repeat;\n    background-position: center;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n    border-radius: 2px;\n    width: 50px;\n    height: 50px;\n    background-size: 45px 45px;\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-status:active {\n    border-left: 4px solid #808080;\n    border-top: 4px solid #808080;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    background-position: 4px 4px;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .dead {\n    background-image: url(\"https://github.com/kizmo04/Minesweeper/blob/master/img/sad-emoji.png?raw=true\");\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-timer {\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .digits-box {\n    margin: 15px auto;\n    background-image: url('https://minesweeper.online/img/skins/hd/nums_background.svg');\n    background-size: 100% 100%;\n    overflow: hidden;\n    width: 90px;\n    height: 60px;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .digits-box .digits {\n    float: left;\n    background-size: 100% 100%;\n    background-position: center;\n    background-repeat: no-repeat;\n    width: 24px;\n    height: 54px;\n    display: block;\n    margin: 3px;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper {\n    margin: 0 auto;\n    width: inherit;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    border-top: 4px solid #808080;\n    border-left: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper .map-cell {\n    text-align: center;\n    width: 30px;\n    height: 30px;\n    cursor: pointer;\n    background-size: 30px 30px;\n    background-position: center;\n    background-color: #C1C1C1;\n    background-repeat: no-repeat;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper .blind {\n    position: relative;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.blind::after {\n    top: 0;\n    left: 0;\n    position: absolute;\n    width: 22px;\n    height: 22px;\n    content: \" \";\n    background-color: #CCCCCC;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.flagged::after {\n    background-image: url('https://minesweeper.online/img/skins/hd/flag.svg');\n    background-size: 30px 30px;\n    background-position: center;\n    pointer-events: none;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.pushed::after {\n    background-image: url('https://minesweeper.online/img/skins/hd/type0.svg');\n    width: 30px;\n    height: 30px;\n    border: none;\n    background-size: 30px 30px;\n  }\n  .hide {\n    display: none;\n  }\n  a[class|='btn'] {\n    background-color: #ffe600;\n    font-family: 'Bungee Shade', cursive;\n    font-size: 1.5em;\n    text-align: center;\n    padding: 10px;\n    text-decoration: none;\n    color: black;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #fdc306;\n    border-right: 4px solid #fdc306;\n  }\n  a[class|='btn']:active {\n    border-left: 4px solid #117ABD;\n    border-top: 4px solid #117ABD;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    padding-left: 5px;\n    padding-right: 15px;\n    padding-top: 6px;\n    padding-bottom: 14px;\n  }\n  .score-board-container {\n    position: absolute;\n    top: 170px;\n    width: 50%;\n    background-color: black;\n    border: 10px solid #fdc306;\n    border-radius: 10px;\n  }\n  .score-board-container .score-board-title-container {\n    width: 100%;\n    border-bottom: none;\n    text-align: center;\n  }\n  .score-board-container .score-board-title-container .score-board-title {\n    color: #fdc306;\n    font-family: 'Bungee Shade', cursive;\n    font-size: 3em;\n  }\n  .score-board-container .score-board-title-container a.btn-close {\n    background-color: black;\n    border: 10px solid #fdc306;\n    border-radius: 10px;\n    position: absolute;\n    top: -10px;\n    right: -120px;\n    color: #fdc306;\n  }\n  .score-board-container .score-board {\n    width: 100%;\n  }\n  .score-board-container .score-board .score-list {\n    width: 100%;\n    font-size: 1em;\n    color: red;\n    font-family: 'Bungee Shade', cursive;\n  }\n  .score-board-container .score-board .score-list td[class|=\"td\"] {\n    font-family: 'Bungee Shade', cursive;\n    font-size: 1em;\n    padding: 10px 10px;\n  }\n  .score-board-container .score-board .score-list th[class|=\"td\"] {\n    font-family: 'Bungee Shade', cursive;\n    font-size: 1em;\n  }\n}\n@media screen and (max-width: 599px) {\n  .minesweeper-container {\n    width: 100%;\n    margin: 0;\n    padding: 100px 0;\n  }\n  .minesweeper-container #title {\n    font-size: 2em;\n    font-family: 'Bungee Shade', cursive;\n    text-align: center;\n    padding: 20px;\n  }\n  .minesweeper-container .btn-container {\n    width: 90%;\n    height: 70px;\n    margin: 0 auto;\n    margin-bottom: 20px;\n    height: 120px;\n    text-align: center;\n    position: relative;\n  }\n  .minesweeper-container .btn-container a.btn-close {\n    position: absolute;\n    top: 0px;\n    right: -100px;\n  }\n  .minesweeper-container .btn-container .difficulty-menu-container {\n    position: absolute;\n    top: 0;\n  }\n  .minesweeper-container .game-container {\n    margin: 0 auto;\n    width: 360px;\n  }\n  .minesweeper-container .game-container .game-box {\n    padding: 20px;\n    background-color: #CCCCCC;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box .score-container {\n    overflow: hidden;\n    width: 300px;\n    margin: 0 auto;\n    margin-bottom: 20px;\n    background-color: #CCCCCC;\n    border-right: 4px solid white;\n    border-bottom: 4px solid white;\n    border-top: 4px solid #808080;\n    border-left: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section {\n    width: 33%;\n    overflow: hidden;\n    float: left;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-count-bomb-left {\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-status {\n    cursor: pointer;\n    background-color: #CCCCCC;\n    background-image: url(\"https://github.com/kizmo04/Minesweeper/blob/master/img/wink-emoji.png?raw=true\");\n    background-repeat: no-repeat;\n    background-position: center;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n    border-radius: 2px;\n    width: 50px;\n    height: 50px;\n    background-size: 45px 45px;\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-status:active {\n    border-left: 4px solid #808080;\n    border-top: 4px solid #808080;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    background-position: 4px 4px;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .dead {\n    background-image: url(\"https://github.com/kizmo04/Minesweeper/blob/master/img/sad-emoji.png?raw=true\");\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .display-timer {\n    margin: 16px auto;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .digits-box {\n    margin: 15px auto;\n    background-image: url('https://minesweeper.online/img/skins/hd/nums_background.svg');\n    background-size: 100% 100%;\n    overflow: hidden;\n    width: 90px;\n    height: 60px;\n  }\n  .minesweeper-container .game-container .game-box .score-container .section .digits-box .digits {\n    float: left;\n    background-size: 100% 100%;\n    background-position: center;\n    background-repeat: no-repeat;\n    width: 24px;\n    height: 54px;\n    display: block;\n    margin: 3px;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper {\n    margin: 0;\n    width: inherit;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    border-top: 4px solid #808080;\n    border-left: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper .map-cell {\n    text-align: center;\n    width: 30px;\n    height: 30px;\n    cursor: pointer;\n    background-size: 30px 30px;\n    background-position: center;\n    background-color: #C1C1C1;\n    background-repeat: no-repeat;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper .blind {\n    position: relative;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.blind::after {\n    top: 0;\n    left: 0;\n    position: absolute;\n    width: 22px;\n    height: 22px;\n    content: \" \";\n    background-color: #CCCCCC;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #808080;\n    border-right: 4px solid #808080;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.flagged::after {\n    background-image: url('https://minesweeper.online/img/skins/hd/flag.svg');\n    background-size: 30px 30px;\n    background-position: center;\n    pointer-events: none;\n  }\n  .minesweeper-container .game-container .game-box table#minesweeper td.pushed::after {\n    background-image: url('https://minesweeper.online/img/skins/hd/type0.svg');\n    width: 30px;\n    height: 30px;\n    border: none;\n    background-size: 30px 30px;\n  }\n  .hide {\n    display: none;\n  }\n  a[class|='btn'] {\n    display: block;\n    background-color: #ffe600;\n    font-family: 'Bungee Shade', cursive;\n    font-size: 1em;\n    text-align: center;\n    padding: 10px;\n    text-decoration: none;\n    color: black;\n    border-left: 4px solid white;\n    border-top: 4px solid white;\n    border-bottom: 4px solid #fdc306;\n    border-right: 4px solid #fdc306;\n  }\n  a[class|='btn']:active {\n    border-left: 4px solid #117ABD;\n    border-top: 4px solid #117ABD;\n    border-bottom: 4px solid white;\n    border-right: 4px solid white;\n    padding-left: 5px;\n    padding-right: 15px;\n    padding-top: 6px;\n    padding-bottom: 14px;\n  }\n  .score-board-container {\n    position: absolute;\n    top: 170px;\n    width: 100%;\n    background-color: black;\n    border: 10px solid #fdc306;\n    border-radius: 10px;\n  }\n  .score-board-container .score-board-title-container {\n    width: 100%;\n    border-bottom: none;\n    text-align: center;\n  }\n  .score-board-container .score-board-title-container .score-board-title {\n    color: #fdc306;\n    font-family: 'Bungee Shade', cursive;\n    font-size: 2em;\n  }\n  .score-board-container .score-board-title-container a.btn-close {\n    background-color: black;\n    border: 10px solid #fdc306;\n    border-radius: 10px;\n    position: absolute;\n    color: #fdc306;\n    bottom: -60px;\n    left: -10px;\n  }\n  .score-board-container .score-board {\n    width: 100%;\n  }\n  .score-board-container .score-board .score-list {\n    width: 100%;\n    font-size: 0.5em;\n    color: red;\n    font-family: 'Bungee Shade', cursive;\n  }\n  .score-board-container .score-board .score-list td[class|=\"td\"] {\n    font-family: 'Bungee Shade', cursive;\n    font-size: 0.5em;\n    padding: 5px 5px;\n  }\n  .score-board-container .score-board .score-list th[class|=\"td\"] {\n    font-family: 'Bungee Shade', cursive;\n    font-size: 0.5em;\n  }\n}\n", ""]);

// exports


/***/ })
/******/ ]);