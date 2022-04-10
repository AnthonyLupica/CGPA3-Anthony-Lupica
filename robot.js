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
    vec4(0.15, 0.15,  0.0, 1.0), 
    vec4( 0.9, 0.65, 0.15, 1.0), // orange
    vec4(0.15, 0.15,  0.0, 1.0), 
    vec4(0.15, 0.15,  0.0, 1.0),
    vec4( 0.9, 0.65, 0.15, 1.0),
    vec4(0.15, 0.15,  0.0, 1.0),
    vec4(0.15, 0.15,  0.0, 1.0),
    vec4(0.15, 0.15,  0.0, 1.0)   
];
//--------------------------------------------------

//--section for declaring values to control dimensions of Ro-bot's body parts--//
var CHEST_HEIGHT      = 5.5;
var CHEST_WIDTH       = 3.5;
var CHEST_DEPTH       = 2.0;

var HEAD_HEIGHT       = 2.0;
var HEAD_WIDTH        = 2.0;
var HEAD_DEPTH        = 2.0;

var LEFT_LEG_HEIGHT   = 5.5;
var LEFT_LEG_WIDTH    = 1.0;
var LEFT_LEG_DEPTH    = 2.0;

var RIGHT_LEG_HEIGHT  = 5.5;
var RIGHT_LEG_WIDTH   = 1.0;
var RIGHT_LEG_DEPTH   = 2.0;

var LEFT_ARM_HEIGHT   = 5.0;
var LEFT_ARM_WIDTH    = 0.75;
var LEFT_ARM_DEPTH    = 2.0;

var RIGHT_ARM_HEIGHT  = 5.0;
var RIGHT_ARM_WIDTH   = 0.75;
var RIGHT_ARM_DEPTH   = 2.0;

var LEFT_EYE_HEIGHT   = 0.25;
var LEFT_EYE_WIDTH    = 0.25;
var LEFT_EYE_DEPTH    = 0.25;

var RIGHT_EYE_HEIGHT  = 0.25;
var RIGHT_EYE_WIDTH   = 0.25;
var RIGHT_EYE_DEPTH   = 0.25;

//--------------------------------------------------

// Shader transformation matrices
var modelViewMatrix, projectionMatrix, modelViewMatrixLoc;

// declare array for rotation (x, y, z) in degrees. Init to 0
var theta = [0, 0, 0];
// declare array for translation
var jump = [0, 0, 0];

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

    
    //--function for handling user input to make transformations--//

    // onkeypress is deprecated... this whole thing might break in a few years
    document.getElementById("inputBox").onkeypress = function handleControls(event)  
    {
        if (event.key == 't')
        {
            theta[0] += 15;
        }
        if (event.key == 'j')
        {
            if (jump[1] == 0)
            {
                jump[1] += 1.5;
            }
        } 
        if (event.key == 'w')
        {
            if (theta[1] == 0)
            {
                theta[1] += 75;
            }
            else if (theta[1] == 75)
            {
                theta[1] -= 75;
            }
        }
        if (event.key == 'b')
        {
            if (LEFT_EYE_HEIGHT == 0.25 && RIGHT_EYE_HEIGHT == 0.25)
            {
                LEFT_EYE_HEIGHT -= 0.15;
                RIGHT_EYE_HEIGHT -= 0.15;
            }
            else 
            {
                LEFT_EYE_HEIGHT += 0.15;
                RIGHT_EYE_HEIGHT += 0.15;

            }
        }
    }

    document.getElementById("inputBox").onkeyup = function handleDown(event) 
    {
        if (event.key == 'j')
        {
            jump[1] -= 1.5;
        }
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

    // Load the cBuffer into the GPU
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

    render();
}

//----------------------------------------------------------------------------

function chest() 
{
    var s = scale4(CHEST_WIDTH, CHEST_HEIGHT, CHEST_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * CHEST_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function head() 
{
    var s = scale4(HEAD_WIDTH, HEAD_HEIGHT, HEAD_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * HEAD_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function leftLeg() 
{
    var s = scale4(LEFT_LEG_WIDTH, LEFT_LEG_HEIGHT, LEFT_LEG_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LEFT_LEG_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function rightLeg() 
{
    var s = scale4(RIGHT_LEG_WIDTH, RIGHT_LEG_HEIGHT, RIGHT_LEG_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * RIGHT_LEG_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function leftArm() 
{
    var s = scale4(LEFT_ARM_WIDTH, LEFT_ARM_HEIGHT, LEFT_ARM_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LEFT_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function rightArm() 
{
    var s = scale4(RIGHT_ARM_WIDTH, RIGHT_ARM_HEIGHT, RIGHT_ARM_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * RIGHT_ARM_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function leftEye() 
{
    var s = scale4(LEFT_EYE_WIDTH, LEFT_EYE_HEIGHT, LEFT_EYE_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * LEFT_EYE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------

function rightEye() 
{
    var s = scale4(RIGHT_EYE_WIDTH, RIGHT_EYE_HEIGHT, RIGHT_EYE_DEPTH);
    var instanceMatrix = mult( translate( 0.0, 0.5 * RIGHT_EYE_HEIGHT, 0.0 ), s);
    var t = mult(modelViewMatrix, instanceMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(t) );
    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );
}

//----------------------------------------------------------------------------


var render = function() {

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    modelViewMatrix = translate(0.0, jump[1], 0.0, 0);
    modelViewMatrix = mult(modelViewMatrix, rotate(theta[0], 0, 1, 0));
    chest();

    modelViewMatrix = mult(modelViewMatrix, translate(0.0, CHEST_HEIGHT + 0.25, 0.0));
    modelViewMatrix = mult(modelViewMatrix, rotate(0, 0, 1, 0));
    head();

    modelViewMatrix  = mult(modelViewMatrix, translate(-CHEST_WIDTH * 0.25, (-CHEST_HEIGHT * 2) - 0.5, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 1, 0));
    leftLeg(); 

    modelViewMatrix  = mult(modelViewMatrix, translate(CHEST_WIDTH * 0.50, 0.0, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 1, 0));
    rightLeg(); 

    modelViewMatrix  = mult(modelViewMatrix, translate(-CHEST_WIDTH * 0.925, CHEST_HEIGHT, 0.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 1, 0));
    leftArm(); 

    modelViewMatrix  = mult(modelViewMatrix, translate(CHEST_WIDTH - 1.5, CHEST_HEIGHT + 1.75, 1.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(90, 0, 1, 0));
    leftEye(); 

    modelViewMatrix  = mult(modelViewMatrix, translate(0.0, 0.0, 0.80));
    modelViewMatrix  = mult(modelViewMatrix, rotate(0, 0, 1, 0));
    rightEye(); 

    modelViewMatrix  = mult(modelViewMatrix, rotate(-90, 0, 1, 0));
    modelViewMatrix  = mult(modelViewMatrix, translate(CHEST_WIDTH - 1.60, -2.25, -1.0));
    modelViewMatrix  = mult(modelViewMatrix, rotate(180, 0, 0, 1));
    modelViewMatrix  = mult(modelViewMatrix, rotate(theta[1], 0, 0, 1));
    rightArm(); 

    requestAnimFrame(render);
}
