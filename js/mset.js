
var canvas = document.querySelector("canvas");
canvas.width = document.querySelector(".container").clientWidth-36;
if(canvas.width>800) canvas.width=800;
canvas.height = canvas.width;

document.body.style.cursor = "wait";

var xaxis  = document.querySelector("#xaxis");
var xleft  = document.querySelector("#xleft");
var xright = document.querySelector("#xright");
xaxis.style.width = canvas.width + "px";

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

  this.xrange=3;
  this.yrange=3;
  
  this.step    = 1;
  this.maxIter = 100;
 
  this.scale = 1;
  this.x0 = 0;
  this.y0 = 0;
  
  this.palette = [];
};

MandelbrotSet.prototype.load_palette = function(maxiter) {
  var k, r, g, b;
  this.palette = new Array(Math.floor(maxiter));
  for (k = 0; k < maxiter; k++) {
    r = 200 * Math.abs(Math.sin(6.28 * k / maxiter));
    g = 200 * Math.abs(Math.sin(6.28 * k / maxiter));
    b = 250 * Math.abs(Math.sin(6.28 * (k+5) / maxiter));
    this.palette[k] = "rgb(" + r.toString() + "," + 
                               g.toString() + "," + 
                               b.toString() + ")";
  }
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
  var i, j, k, x, y, col, res, maxiter;

  if (this.scale * scale < 1e-12) {
    return;
  }

  document.body.style.cursor = "wait";

  this.x0 += this.xrange*this.scale*x0/this.width;
  this.y0 += this.yrange*this.scale*y0/this.height;
  this.scale *= scale;

  var bits = Math.floor(Math.exp(Math.LN10*Math.floor(1 - Math.log(this.scale)/Math.LN10)));
  res = Math.floor(this.x0 * bits)/bits;
  xleft.textContent = "[" + res.toString();
  res = this.x0 + this.xrange*this.scale;
  res = Math.floor(res * bits)/bits;
  xright.textContent = res.toString() + "]";
  
  maxiter = Math.floor(this.maxIter - 10*Math.log(this.scale));
  if (maxiter > 1000) maxiter = 1000;
  this.load_palette(maxiter);

  for (i = 0; i < this.width; i += this.step) {
    x = this.x0 + this.xrange*this.scale*i/this.width;
    for (j = 0; j < this.height; j += this.step) {  
      y = this.y0 + this.scale*this.yrange*j/this.height;
      k = this.iterate2(0, 0, x, y, 0, maxiter);
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

  res = this.xrange*this.scale/this.width;  
  if (mset.scale < 1e-10) {
    divPrec.setAttribute("style", 
      "text-align:center;color:red; border: 2px solid white;padding:8px;");
    divPrec.textContent = "Pixel resolution: " + 
      res.toExponential(2) + 
      " (precision loss)";
  }
  else {
    divPrec.setAttribute("style", 
    "text-align:center;color:rgb(5,5,55);padding:8px;");
    divPrec.textContent = "Pixel resolution: " + 
      res.toExponential(2);
  }

  document.body.style.cursor = "auto"; 
};

MandelbrotSet.prototype.drawDefault = function() {
    this.scale = 1;
    this.x0 = 0;
    this.y0 = 0;
    this.draw(-(this.xrange-1)*canvas.width/this.xrange , -canvas.height/2, 1);
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

