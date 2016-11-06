var BACKEND_URL = 'https://pixify-clicks.herokuapp.com/';
var NUM_COLORS = 256;
var MIN_UPDATE = 33;
var app = {
    lstUpd: 0,
    x : -1,
    y : -1,
    // Application Constructor
    initialize: function() {
        this.connectSocket();
        //this.updateColor();
        countCalc.calcClickSpeed();
        /*console.log = function() {
          debug.apply(this, arguments);
        };*/
        /*setInterval(function () {
          var x = rand(0, painter.width-1);
          var y = rand(0, painter.height-1);
          var lstUpd = this.clicks;
          var idx = rand(0, 255);
          this.newPosition(x, y, idx, lstUpd);
        }.bind(this), 10);*/
        this.newPosition(-1,-1,0,0);
    },
    connectSocket: function() {
      var socket = this.socket = io(BACKEND_URL);
      this.clicks = 0;
      this.clickers = 1;
      this.speed = 0;
      this.lastClickCount = 0;

      socket.on('c', function() {
        ++this.clicks;
        this.updateScreen();
      }.bind(this));

      socket.on('p', function(x, y, c) {
        painter.paintCell(x, y, c);
      }.bind(this));

      socket.on('t', function(x, y, t) {
        this.newPosition(x, y, t);
      }.bind(this));

      socket.on('k', function(newClicks) {
        this.clicks = newClicks;
        this.updateScreen();
      }.bind(this));

      socket.on('u', function(newClickers) {
        this.clickers = newClickers;
        this.updateScreen();
      }.bind(this));
    },

    newPosition: function(newX, newY, lastUpdate) {
      // Clear border before update
      this.refreshActiveCell(false);

      this.x = newX;
      this.y = newY;
      this.lstUpd = lastUpdate;
      this.updateColor();
      console.log('new pos:', this.x, this.y);
    },
    refreshActiveCell: function(showBorder) {
      var idx = this.clicks - this.lstUpd;
      painter.paintBorder(this.x,this.y, showBorder);
      painter.paintCell(this.x, this.y, idx);
    },

    sendClick: function() {
      this.socket.emit('c');
    },

    _touchedLast: 0,
    touched: function(el) {
      this.sendClick();
      this._touchedLast = Date.now();
      return false;
    },
    clicked: function(el) {
      if((Date.now() - this._touchedLast) < 500) {
        return false;
      }
      this.sendClick();
      return false;
    },
    updateColor: function() {
        var idx = this.clicks - this.lstUpd;
        var color = COLORS[idx%NUM_COLORS];
        this.getElement('color_holder').style.background = '#'+color;
        if(color === "ffffff") {
          this.getElement('color_holder').style.color = '#000000';
        } else {
          this.getElement('color_holder').style.color = '#ffffff';
        }
        painter.paintCell(app.x, app.y, idx);
    },

    _lastUpdate : Date.now(),
    _paintTimer : undefined,
    updateScreen: function () {
      // Only do 30 updates each second
      if((Date.now() - this._lastUpdate) > MIN_UPDATE ) {
        this.setText('clickersElement', this.clickers);
        this.setText('clicksElement', this.clicks);
        this.setText('speedElement', this.speed);
        this.updateColor();
        this._lastUpdate = Date.now();
      } else {
        clearTimeout(this._paintTimer);
        this._paintTimer = setTimeout(this.updateScreen.bind(this), MIN_UPDATE);
      }
    },
    _elements : {},
    setText: function(id, value) {
      this.getElement(id).innerText = value;
    },
    getElement: function(id) {
      if(this._elements[id] === undefined) {
        this._elements[id] = document.getElementById(id);
      }
      return this._elements[id];
    }
};
var countCalc = {
  _click_buckets : [],
  _bucket : 0,
  _buckets : 20,
  calcClickSpeed: function() {
    var hasChanged = false;
    this._click_buckets[this._bucket] = app.clicks;
    this._bucket = this._bucket++ > this._buckets ? 0 : this._bucket;
    var lastClickCount = this._click_buckets[this._bucket];
    if(lastClickCount !== undefined && lastClickCount !== 0) {
      var lastSpeed = app.speed;
      app.speed = (app.clicks - lastClickCount);
      hasChanged = app.speed !== lastSpeed;
    }
    lastClickCount = app.clicks;
    setTimeout(this.calcClickSpeed.bind(this), 1000 / this._buckets);
    if(hasChanged) {
      app.updateScreen();
    }
  }
};
function debug() {
  if(arguments.length === 0) {
    return;
  }
  var el = document.getElementById('debug_log');
  for (i = 0; i < arguments.length; i++) {
    el.innerHTML = el.innerHTML + (i > 0 ? ',' : '') + JSON.stringify(arguments[i]);
  }
  el.innerHTML = el.innerHTML + '\n';
}

function rand(min, max) {
  return Math.round(min + (max * Math.random()));
}
