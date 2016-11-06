var painter = {
  context: undefined,
  size : 8, grid : 1,
  width: 40,
  height: 30,
  initialize: function(id) {
    var canvas = document.getElementById(id);
    this.context = canvas.getContext("2d");
    //this.paintPalette();

  },
  paintPalette: function() {
    var x = 0, y = 0, cid = 0;
    for(y = 0; y < this.height; ++y) {
      for(x = 0; x < this.width; ++x) {
        this.paintCell(x, y, cid);
        cid++;
      }
    }
  },
  paintBorder: function(x, y, on) {
    var ctx = this.context, size = this.size;
    var cx = (x * size),
        cy = (y * size),
        s = size;
    if(on) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "white";
      ctx.strokeRect(cx + 1, cy + 1, s - 1, s - 1);
    } else {
      ctx.clearRect(cx, cy, s + 1, s + 1);
    }
  },
  paintCell: function(x, y, colorId) {
    var ctx = this.context, size = this.size, grid = this.grid;
    ctx.fillStyle = toRGBString(COLORS[colorId%256]);
    ctx.fillRect((x * size) + 1, (y * size) + 1, size - grid, size - grid);
  }
};

function toRGBString(c) {return 'rgb('+hexToR(c)+','+hexToG(c)+','+hexToB(c)+')';}
function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16);}
function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16);}
function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16);}
function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h;}
