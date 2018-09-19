
var canvas = document.querySelector("canvas");
canvas.width = document.querySelector(".container").clientWidth-36;
if(canvas.width>1200) canvas.width=1200;
canvas.height = canvas.width;

document.body.style.cursor = "wait";

var XRANGE=3;
var YRANGE=3;

var xdown   = 0;
var xlength = 0;
var ydown   = 0; 
var ylength = 0;
var divRect = document.createElement("div");
var divPrec = document.querySelector("#msetscale");

function MandelbrotSet(canvas) {

  this.canvas = canvas;
  this.cx     = canvas.getContext("2d");

  this.height = canvas.height;
  this.width  = canvas.width;
  
  this.step    = 1;
  this.maxIter = 100;
 
  this.scale = 1;
  this.x0 = 0;
  this.y0 = 0;
  
  this.palette = [];
  this.load_palette();
};

MandelbrotSet.prototype.load_palette = function() {
  var k, r, g, b;
  this.palette = [];
  for (k = 0; k < this.maxIter; k++) {
    r = 205 * Math.abs(Math.sin(3 * k / this.maxIter));
    g = 205 * Math.abs(Math.sin(3 * k / this.maxIter));
    b = 255 * Math.abs(Math.sin(3 * (k+5) / this.maxIter));
    this.palette.push("rgb(" + r.toString() + "," + 
                               g.toString() + "," + 
                               b.toString() + ")");
  }
  console.log(this.palette[0]);
};

MandelbrotSet.prototype.iterate2 = function(x, y, x0, y0, k, n) {
  var xx = x*x - y*y + x0;
  y = 2*x*y + y0;
  x = xx;
  if (x*x + y*y > 4)
    return k;
  k += 1;
  if (k >= n) 
    return k;
  return this.iterate2(x, y, x0, y0, k, n);
};

MandelbrotSet.prototype.iterate4 = function(x, y, x0, y0, k, n) {
  var xx = x*x - y*y;
  y = 2*x*y;
  x = xx;
  xx = x*x - y*y + x0;
  y = 2*x*y + y0;
  x = xx;
  if (x*x + y*y > 4)
    return k;
  k += 1;
  if (k >= n) 
    return k;
  return this.iterate4(x, y, x0, y0, k, n);
};

MandelbrotSet.prototype.draw = function(x0, y0, scale) {
  var i, j, k, x, y, col;

  if (this.scale * scale < 1e-12) {
    return;
  }

  document.body.style.cursor = "wait";

  this.x0 += XRANGE*this.scale*x0/this.width;
  this.y0 += YRANGE*this.scale*y0/this.height;
  this.scale *= scale;
  
  for (i = 0; i < this.width; i += this.step) {
    x = this.x0 + XRANGE*this.scale*i/this.width;
    for (j = 0; j < this.height; j += this.step) {  
      y = this.y0 + this.scale*YRANGE*j/this.height;
      k = this.iterate2(0, 0, x, y, 0, this.maxIter);
      if (k > 0) {
        col = k - 1;
        this.cx.fillStyle = this.palette[col];
      }
      else {
        this.cx.fillStyle = this.palette[0];
      }
      this.cx.fillRect(i, j, this.step, this.step);
    }
  }
  
  var mscale = XRANGE*this.scale/this.width;
  if (mset.scale < 1e-10) {
    divPrec.setAttribute("style", 
      "text-align:center;color:red; border: 2px solid white;padding:8px;");
    divPrec.textContent = "Pixel resolution: " + 
      mscale.toExponential(2) + 
      " (precision loss)";
  }
  else {
    divPrec.setAttribute("style", 
    "text-align:center;color:rgb(5,5,55);font-size:120%;padding:8px;");
    divPrec.textContent = "Pixel resolution: " + 
      mscale.toExponential(2);
  }

  document.body.style.cursor = "auto"; 
};

MandelbrotSet.prototype.drawDefault = function() {
    this.scale = 1;
    this.x0 = 0;
    this.y0 = 0;
    this.draw(-(XRANGE-1)*canvas.width/XRANGE , -canvas.height/2, 1);
}

var mset = new MandelbrotSet(canvas, 1);
mset.drawDefault();

function mouseup(event) {
  
  canvas.removeEventListener("mousemove", moved);

  divRect.setAttribute("style", "");
  document.body.removeChild(divRect);

  if (xlength < 8 || ylength < 8)
    return;

  var scale = Math.min(ylength / canvas.height, 
                       xlength / canvas.width);
  if (scale < 1e-14) scale = 1e-14;

  mset.draw(xdown, ydown, scale);
}

function moved(event) {

  if (event.which != 1) {
    mouseup();
    return;
  }
  
  xlength = event.offsetX - xdown;
  ylength = event.offsetY - ydown;
    
  var crect = canvas.getBoundingClientRect();
  var rleft = xdown + crect.left + window.scrollX;
  var rtop  = ydown + crect.top  + window.scrollY;
  divRect.setAttribute("style", 
                       "color:white; border: 2px solid white;" + 
                       "position: absolute; " + 
                       "top: " + rtop.toString() + "px;" + 
                       "left: " + rleft.toString() + "px;" + 
                       "width:"   + xlength.toString() + "px;" + 
                       "height:"  + ylength.toString() + "px;");
}

canvas.addEventListener("mouseclick", function(event) {
  
  if (event.which == 3) {
    event.preventDefault();
    event.stopPropagation();
    mset.drawDefault();
    return;
  }
});

canvas.addEventListener("contextmenu", function(event) {
    event.preventDefault();
    event.stopPropagation();
});

canvas.addEventListener("mousedown", function(event) {

  if (event.which == 3) {
    mset.drawDefault();
    return;
  }
  
  if (event.which != 1) {
    return;
  }

  event.preventDefault();
  
  xdown = event.offsetX;
  ydown = event.offsetY;
  
  divRect.setAttribute("style", "");
  document.body.appendChild(divRect);

  canvas.addEventListener("mousemove", moved);
});

canvas.addEventListener("mouseup", function(event) {
  mouseup();
});

divRect.addEventListener("mouseup", function(event) {
  mouseup();
});

