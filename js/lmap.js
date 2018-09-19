var canvas = document.querySelector("canvas");
canvas.width = document.querySelector(".container").clientWidth-36;
if(canvas.width>1200) canvas.width=1200;
canvas.height = canvas.width;

var xaxis  = document.querySelector("#xaxis");
var xleft  = document.querySelector("#xleft");
var xright = document.querySelector("#xright");
xaxis.style.width = canvas.width + "px";

var XRANGE=4-2.8;
var YRANGE=1;

var xdown   = 0;
var xlength = 0;
var divRect = document.createElement("div");
var divPrec = document.querySelector("#msetscale");

function LogisticSet(canvas) {

  this.canvas = canvas;
  this.cx     = canvas.getContext("2d");

  this.height = canvas.height;
  this.width  = canvas.width;
  
  this.step    = 1;
  this.maxIter = 40;
 
  this.scale = 1;
  this.x0 = 0;
  this.y0 = 0;

  this.palette = [];
  this.load_palette();
};

LogisticSet.prototype.load_palette = function() {
  var k, r, g, b;
  this.palette = [];
  for (k = 0; k < this.maxIter; k++) {
    r = 205 * Math.abs(Math.sin(2 * k / this.maxIter));
    g = 205 * Math.abs(Math.sin(2 * k / this.maxIter));
    b = 255 * Math.abs(Math.sin(2 * (k+5) / this.maxIter));
    this.palette.push("rgb(" + r.toString() + "," + 
                               g.toString() + "," + 
                               b.toString() + ")");
  }
};

LogisticSet.prototype.draw = function(x0, y0, scale) {
  
  var i, j, k, x, y, maxiter, res;

  if (this.scale * scale < 1e-4) {
    return;
  }
  
  this.x0 += XRANGE*this.scale*x0/this.width;
  this.y0 += YRANGE*this.scale*y0/this.height;
  this.scale *= scale;
  
  res = Math.floor(this.x0 * 1e6)/1e6;
  xleft.textContent = "[" + res.toString();
  res = this.x0 + XRANGE*this.scale;
  res = Math.floor(res * 1e6)/1e6;
  xright.textContent = res.toString() + "]";
  
  for (i = 0; i < this.width; i += this.step) {
    x = this.x0 + XRANGE*this.scale*i/this.width;
    
    var colbuff = [];
    for (j = 0; j < this.height; j += this.step) {  
    	colbuff.push(0);
    }

    maxiter = this.height*(1-0.5*Math.log(this.scale));
    for (j = 0; j < maxiter; j += this.step) {
    	y = YRANGE*(j+Math.random())/(maxiter+1);
    	for (k = 0; k < this.maxIter; k++) {
    		y = x*y*(1-y);
    	}
    	y = Math.floor((y-this.y0)*this.height/(this.scale*this.step));
      if (y >= 0) 
    	  colbuff[y] += 1;
    }
    for (j = 0; j < this.height; j += this.step) { 
    	this.cx.fillStyle = this.palette[(colbuff[j/this.step])%this.maxIter];
    	this.cx.fillRect(i, this.height-this.step-j, this.step, this.step);
    }
  }
  
  res = XRANGE*mset.scale/mset.width;
  divPrec.textContent = "Pixel resolution: " + 
      res.toExponential(2);
    
};

LogisticSet.prototype.drawDefault = function() {
    this.scale = 1;
    this.x0 = 4-XRANGE;
    this.y0 = 0;
    this.draw(0, 0, 1);
}

var mset = new LogisticSet(canvas, 1);
mset.drawDefault();

function mouseup(event) {
  
  canvas.removeEventListener("mousemove", moved);
  
  divRect.setAttribute("style", "");
  document.body.removeChild(divRect);

  if (xlength < 8 || ylength < 8)
    return;

  var scale = Math.min(ylength / canvas.height, 
                       xlength / canvas.width);

  mset.draw(xdown, canvas.height-ydown-ylength, scale);
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

