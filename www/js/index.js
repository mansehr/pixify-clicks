var BACKEND_URL = 'https://pixify-clicks.herokuapp.com/';

var app = {
    // Application Constructor
    initialize: function() {
        this.connectSocket();
        countCalc.calcClickSpeed();
    },
    connectSocket: function() {
      var socket = this.socket = io(BACKEND_URL);
      this.clicks = 0;
      this.clickers = 1;
      this.speed = 0;
      this.lastClickCount = 0;

      socket.on('c', function() {
        ++this.clicks;
        this.updateText();
      }.bind(this));

      socket.on('k', function(newClicks) {
        this.clicks = newClicks;
        this.updateText();
      }.bind(this));

      socket.on('u', function(newClickers) {
        this.clickers = newClickers;
        this.updateText();
      }.bind(this));
    },
    touched : false,
    touch: function() {
      this.clicked();
      this.touched = true;
      return false;
    },
    clicked: function() {
      if(!this.touched) {
        this.socket.emit('c');
      }
      this.touched = false;
      return false;
    },

    _lastUpdate : Date.now(),
    _paintTimer : undefined,
    updateText: function () {
      // Only do 30 updates each second
      if((Date.now() - this._lastUpdate) > 33 ) {
        this.setText('clickersElement', this.clickers);
        this.setText('clicksElement', this.clicks);
        this.setText('speedElement', this.speed);
        this._lastUpdate = Date.now();
      } else {
        clearTimeout(this._paintTimer);
        this._paintTimer = setTimeout(this.updateText.bind(this), 33);
      }
    },
    _elements : {},
    setText: function(id, value) {
      if(this._elements[id] === undefined) {
        this._elements[id] = document.getElementById(id);
      }
      this._elements[id].innerText = value;
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
      app.updateText();
    }
  }
};
