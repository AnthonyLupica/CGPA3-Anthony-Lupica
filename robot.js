/*
    include file for robot.html
*/ 

"use strict";

//-- global variables --//
var canvas;
var gl;
var program;

// # number of vertices for a cube
var NumVertices = 36; //(6 faces)(2 triangles/face)(3 vertices/triangle)

// arrays for points and colors
var points = [];
var colors = [];

//--section for defining the vertices to use for constructing the faces--//
// [-1 -> 1] left to right 
// [-1 -> 1] bottom to top
// setup vertices for a unit cube
var vertices = 
[
    //  (x, y, z, w)
    vec4( -0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5,  0.5,  0.5, 1.0 ),
    vec4(  0.5, -0.5,  0.5, 1.0 ),
    vec4( -0.5, -0.5, -0.5, 1.0 ),
    vec4( -0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5,  0.5, -0.5, 1.0 ),
    vec4(  0.5, -0.5, -0.5, 1.0 )
];

// RGBA colors
var vertexColors = 
[
    vec4(0.9,  0.9,  0.3, 1.0), // yellow
    vec4(0.9, 0.65, 0.15, 1.0), // orange
    vec4(0.9,  0.9,  0.3, 1.0), 
    vec4(0.9,  0.9,  0.3, 1.0),
    vec4(0.9, 0.65, 0.15, 1.0),
    vec4(0.9,  0.9,  0.3, 1.0),
    vec4(0.9,  0.9,  0.3, 1.0),
    vec4(0.9,  0.9,  0.3, 1.0)  
];
//--------------------------------------------------


//--section for declaring values to control dimensions of Ro-bot's body parts--//
var CHEST_HEIGHT      = 5.5;
var CHEST_WIDTH       = 4.5;
var CHEST_DEPTH       = 2.0;
var LOWER_ARM_HEIGHT  = 5.0;
var LOWER_ARM_WIDTH   = 0.5;
var UPPER_ARM_HEIGHT  = 5.0;
var UPPER_ARM_WIDTH   = 0.5;
//--------------------------------------------------

// Shader transformation matrices
var modelViewMatrix, projectionMatrix;

var Chest = 0;
var LowerArm = 1;
var UpperArm = 2;

// declare array for rotation (x, y, z) in degrees. Init to 0
var theta= [ 0, 0, 0];

var angle = 0;

var modelViewMatrixLoc;

// buffers for GPU
var vBuffer, cBuffer;

//--functions for constructing the objects with given vertices--//
// construct a surface of object
function quad(  a,  b,  c,  d ) 
{
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    
    colors.push(vertexColors[a]);
    points.push(vertices[b]);
    
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    
    colors.push(vertexColors[a]);
    points.push(vertices[a]);
    
    colors.push(vertexColors[a]);
    points.push(vertices[c]);
    
    colors.push(vertexColors[a]);
    points.push(vertices[d]);
}
//--------------------------------------------------

function colorCube() 
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

//--scale--//

function scale4(a, b, c) 
{
   var result = mat4();
   result[0][0] = a;
   result[1][1] = b;
   result[2][2] = c;
   return result;
}

//--initialize canvas--//

window.onload = function initCanvas() 
{
    // console log for succesful call
    console.log('initCanvas() was called');

    canvas = document.getElementById( "robot-home" );
    gl = WebGLUtils.setupWebGL( canvas );
    
    if (!gl) 
    { 
        alert("WebGL isn't available on your browser");
    }

    //--Configure WebGL--//
    
    // set viewing window
    gl.viewport(0, 0, canvas.width, canvas.height);
    // set color of canvas (R, G, B, alpha "for opacity")
    gl.clearColor(0.50, 0.75, 0.75, 0.95);
    // for hidden surface removal
    gl.enable(gl.DEPTH_TEST);

    //  Load shaders and initialize attribute buffers
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // draw color cube
    colorCube();

    // Create and initialize  buffer objects

    // Load the vBuffer into the GPU
    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    // (index, size, type, normalized, stride, offset)
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    // (index, size, type, normalized, stride, offset)
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");

    projectionMatrix = ortho(-10, 10, -10, 10, -10, 10);
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),  false, flatten(projectionMatrix) );

    //--functions for handling user input to make transformations--//
    document.getElementById("inputBox").onkeyup = function(event)  
    {
        
        theta[0] += 15;
    }
    /*
    document.getElementById("slider2").onchange = function(event) {
         theta[1] = event.target.value;
    };
    document.getElementById("slider3").onchange = function(event) {
         theta[2] =  event.target.value;
    }; */

    render();
}

//----------------------------------------------------------------------------

function chest() 
{
    var s = scale4(CHEST_WIDTH, CHEST_HEIGHT, CHEST_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * CHEST_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function upperArm() {
    var s = scale4(UPPER_ARM_WIDTH, UPPER_ARM_HEIGHT, UPPER_ARM_WIDTH);
    var instanceMatrix = mult(translate( 0.0, 0.5 * UPPER_ARM_HEIGHT, 0.0 ),s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


function lowerArm()
{
    var s = scale4(LOWER_ARM_WIDTH, LOWER_ARM_HEIGHT, LOWER_ARM_WIDTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LOWER_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv( modelViewMatrixLoc,  false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = rotate(theta[Chest], 0, 1, 0 );
    chest();
/*
    modelViewMatrix = mult(modelViewMatrix, translate(0.0, CHEST_HEIGHT, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[LowerArm], 0, 0, 1 ));
    lowerArm();

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, LOWER_ARM_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[UpperArm], 0, 0, 1) );
    upperArm(); */

    requestAnimFrame(render);
}
