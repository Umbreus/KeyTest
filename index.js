/*jslint
    white:true, plusplus: true
*/

/**
 * Initialisation of global variables
 */
var scrollpts = []; // An array of scroll intensities

/**
 * Adds listensers
 */
function initialise() {
    'use strict';
    window.addEventListener('resize', handleResize, false);
    window.addEventListener('wheel', handleWheel, false);
    window.addEventListener('mousedown', handleMouse, false);
    window.addEventListener('keydown', handleKeyboard, false);
    
    rectifyCanvas(document.getElementById("Canvas-Mouse"));
}

/**
 * Handles mouseWheel events
 * @param {WheelEvent} e
 */
function handleWheel(e) {
    'use strict';
    var dY = e.deltaY;
    if(dY !== 0){
    document.getElementById("scroll-intensity").innerHTML = dY;
    document.getElementById("scroll-direction").innerHTML = dY<0 ? "down":"up";
    
    scrollpts.push(dY);
        
    draw(document.getElementById("Canvas-Mouse"));
    }
}

/**
 * Handles resize events
 * @param {resizeEvent} e
 */
function handleResize(e) {
    rectifyCanvas(document.getElementById("Canvas-Mouse"));
    draw(document.getElementById("Canvas-Mouse"));
}

/**
 * Handles keyDown events
 * @param {KeyboardEvent} e
 */
function handleKeyboard(e){
    'use strict';
    document.getElementById("keypress").innerHTML = e.key;
}

/**
 * Handles mouseDown events
 * @param {MouseEvent} e
 */
function handleMouse(e){
    'use strict';
    var button;
    switch(e.button){
    case 0:
        button = "LMB";
        break;
    case 1:
        button = "CMB";
        break;
    case 2:
        button = "RMB";
        break;
    default:
        button = e.button;
        break;
    }
    
    document.getElementById("mouse-button").innerHTML = button;
}

function Point(x, y) {
    'use strict';
    this.x = x;
    this.y = y;
}

function Domain(minX, maxX, minY, maxY){
    'use strict';
    this.minX = minX;
    this.maxX = maxX;
    this.minY = minY;
    this.maxY = maxY;
}

/**
 * Maps a point {x,y} onto a canvas with a domain (minX -> maxX, minY -> maxY)
 * @param {Point} point The point to map
 * @param {Element} canvas The canvas to map onto
 * @param {Domain} domain The domain displayed on the canvas
 */
function map(point, canvas, domain){
    'use strict';
    var xPercent,
        yPercent;
    
    // % across the canvas: diff from min / range
    xPercent = (point.x - domain.minX) / (domain.maxX - domain.minX);
    yPercent = (point.y - domain.minY) / (domain.maxY - domain.minY);
    
    return new Point(xPercent*canvas.width, (1.0-yPercent)*canvas.height);
}

/**
 * Draws the graph on the canvas
 * @param {Element} canvas The canvas to draw on
 */
function draw(canvas){
    'use strict';
    var domain,
        currX,
        canvas_2d,
        point1,
        point2,
        grd,
        start,
        i; // The first data point to plot from
    
    //TODO - Set start ERROR, still drawing from x=0 but ignoring datapoints
    if(document.getElementById("range-abs").checked){
        start = parseInt(document.getElementById("range").value,10);
    }
    else{
        start = scrollpts.length - 1 - parseInt(document.getElementById("range").value,10);
    }
    
    domain = new Domain(start,scrollpts.length-1,null,null);
    
    // Populate the domain
    for(i = start; i < scrollpts.length; i++){
        if(domain.minY === null || scrollpts[i] < domain.minY){
            domain.minY = scrollpts[i];
        }
        if(domain.maxY === null || scrollpts[i] > domain.maxY){
            domain.maxY = scrollpts[i];
        }
    }
    
    if (domain.minY === null) {domain.minY = 0;}
    if (domain.maxY === null) {domain.maxY = 0;}
    
    if(document.getElementById("x-fixed").checked){
        var maxrange = Math.max( Math.abs(domain.maxY) , Math.abs(domain.minY) );
        domain.minY = -maxrange;
        domain.maxY = maxrange;
    }
    
    //Draw the graph
    canvas_2d = canvas.getContext("2d");
    //Clear
    canvas_2d.clearRect(0,0,canvas_2d.canvas.width,canvas_2d.canvas.height);
    
    
    //TEST
    /*
    document.getElementById("Header").innerHTML = ("Domain X:("+domain.minX+","+domain.maxX+") Y:("+domain.minY+","+domain.maxY+") Last Y:"+scrollpts[scrollpts.length-1] );
    
    var lwr = map(new Point(domain.minX,domain.minY),canvas,domain);
    document.getElementById("Header").innerHTML += ("lower pt"+lwr.x+""+lwr.y);
    var upr = map(new Point(domain.maxX,domain.maxY),canvas,domain);
    document.getElementById("Header").innerHTML += ("upr point"+upr.x+""+upr.y);
    canvas_2d.fillRect(
        lwr.x+10,
        lwr.y-10,
        Math.abs(upr.x-lwr.x)-20,
        -Math.abs(upr.y-lwr.y)+20
    );//x0,y0,w,h
    
    document.getElementById("Header").innerHTML += ("canvas size:" +canvas.width+" "+canvas.height);
    
    document.getElementById("Header").innerHTML += "START: "+start;
    */
    
    
    //Sets Brush
    var midpoint = map(new Point(0,0),canvas,domain);
    grd = canvas_2d.createLinearGradient(
        midpoint.x,//x0
        midpoint.y-1,//y0
        midpoint.x,//x1
        midpoint.y+1//y1
    );
    grd.addColorStop(0.000, 'rgba(0, 255, 0, 1.000)');
    grd.addColorStop(0.500, 'rgba(0, 255, 0, 1.000)');
    grd.addColorStop(0.500, 'rgba(255, 0, 0, 1.000)');
    grd.addColorStop(1.000, 'rgba(255, 0, 0, 1.000)');
    
    canvas_2d.strokeStyle = grd;
    canvas_2d.lineWidth="5";
    
    //Plots lines
    canvas_2d.beginPath();
    point1 = new Point(start,scrollpts[start]);
    point1 = map(point1,canvas,domain);
    canvas_2d.moveTo(point1.x,point1.y);
    
    for(i = start+1; i < scrollpts.length; i++){
        /*FOR TESTING
        document.getElementById("Header").innerHTML += "|"+i;
        */
        point2 = new Point(i,scrollpts[i]);
        point2 = map(point2,canvas,domain);
        canvas_2d.lineTo(point2.x,point2.y);
    }
    canvas_2d.stroke();
    
    //Draws y=0 line
    canvas_2d.beginPath();
    canvas_2d.strokeStyle = "black";
    point1 = map(new Point(domain.minX,0),canvas,domain);
    point2 = map(new Point(domain.maxX,0),canvas,domain);
    canvas_2d.moveTo(point1.x,point1.y);
    canvas_2d.lineTo(point2.x,point2.y);
    canvas_2d.stroke();
}

// Gets & sets width and height properly
function rectifyCanvas(canvas){
    var compStyle,
        w,
        h;
    
    canvas.width = null;
    canvas.height = null;
    
    var compStyle = getComputedStyle(canvas);
    var w = parseInt(compStyle.getPropertyValue("width"), 10);
    var h = parseInt(compStyle.getPropertyValue("height"), 10);
    
    canvas.width = w;
    canvas.height = h;
}

