
var canvas = document.querySelector("canvas");
canvas.width = document.querySelector(".container").clientWidth-36;
if(canvas.width>800) canvas.width=800;
canvas.height = canvas.width;

var xaxis  = document.querySelector("#xaxis");
var xleft  = document.querySelector("#xleft");
var xright = document.querySelector("#xright");
xaxis.style.width = canvas.width + "px";
var divPrec = document.querySelector("#msetscale");

function JuliaSet(canvas) {

  this.canvas = canvas;
  this.cx     = canvas.getContext("2d");

  this.height = canvas.height;
  this.width  = canvas.width;
  
  this.step    = 1;
  this.maxIter = parseFloat(canvas.getAttribute('maxiter'));
 
  this.scale = 1;
  this.x0 = 0;
  this.y0 = 0;

  this.cr = parseFloat(canvas.getAttribute('cr'));
  this.ci = parseFloat(canvas.getAttribute('ci'));

  this.xrange = parseFloat(canvas.getAttribute('xrange'));
  this.yrange = parseFloat(canvas.getAttribute('yrange'));

  this.palette = [];
  this.load_palette();
};

JuliaSet.prototype.load_palette = function() {
  var k, r, g, b;
  this.palette = [];
  for (k = 0; k < this.maxIter; k++) {
    r = 205 * Math.abs(Math.sin(3 * (k+0) / (this.maxIter)));
    g = 205 * Math.abs(Math.sin(3 * (k+0) / (this.maxIter)));
    b = 255 * Math.abs(Math.sin(3 * (k+5) / (this.maxIter)));
    this.palette.push("rgb(" + r.toString() + "," + 
                               g.toString() + "," + 
                               b.toString() + ")");
  }
};

JuliaSet.prototype.iterate2 = function(x, y, x0, y0, k, n) {
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

JuliaSet.prototype.draw = function(x0, y0, scale) {
 
 var i, j, k, x, y, col, res;

  if (this.scale * scale < 1e-10) {
    return;
  }

  document.body.style.cursor = "wait";

  this.x0 += this.xrange*this.scale*x0/this.width;
  this.y0 += this.yrange*this.scale*y0/this.height;
  this.scale *= scale;

  res = Math.floor(this.x0 * 1e6)/1e6;
  xleft.textContent = "[" + res.toString();
  res = this.x0 + this.xrange*this.scale;
  res = Math.floor(res * 1e6)/1e6;
  xright.textContent = res.toString() + "]";
  
  for (i = 0; i < this.width; i += this.step) {
    x = this.x0 + this.xrange*this.scale*i/this.width;
    for (j = 0; j < this.height; j += this.step) {  
      y = this.y0 + this.scale*this.yrange*j/this.height;
      k = this.iterate2(x, y, this.cr, this.ci, 0, this.maxIter);
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
  divPrec.textContent = "Pixel resolution: " + 
      res.toExponential(2);

  document.body.style.cursor = "auto";
};

JuliaSet.prototype.drawDefault = function() {
    this.scale = 1;
    this.x0 = 0;
    this.y0 = 0;
    this.draw(-2*canvas.width/4, -canvas.height/2, 1);
}

var mset = new JuliaSet(canvas);
mset.drawDefault();

var xdown   = 0;
var xlength = 0;
var ydown   = 0; 
var ylength = 0;
var divRect = document.createElement("div");

function mouseup(event) {
  
  canvas.removeEventListener("mousemove", moved);
  
  divRect.setAttribute("style", "");
  document.body.removeChild(divRect);

  if (xlength < 8 || ylength < 8)
    return;

  var scale = Math.min(ylength / canvas.height, 
                       xlength / canvas.width);
  if (scale < 1e-14) scale = 1e-14;

  mset.load_palette(scale);
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
  
console.log(event.which);
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

