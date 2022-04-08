/*
    include file for robot.html
*/ 

// global variables
var gl;
var points;

window.onload = function initCanvas()
{
    // console log for succesful call
    console.log('initCanvas() was called');

    // get canvas context
    var canvas = document.getElementById("robot-home");
    gl = WebGLUtils.setupWebGL( canvas );
    
    if (!gl) 
    { 
        alert("WebGL isn't available on your browser");
    }

    // [-1 -> 1] left to right 
    // [-1 -> 1] bottom to top
    // eight vertices for a cube
    var vertices = 
    [     
        //  (x, y, z, w)
        vec4( -0.5, -0.5,  0.5, 1.0),       
        vec4( -0.5,  0.5,  0.5, 1.0),  
        vec4(  0.5,  0.5,  0.5, 1.0),
        vec4(  0.5, -0.5,  0.5, 1.0),
        vec4( -0.5, -0.5, -0.5, 1.0),
        vec4( -0.5,  0.5, -0.5, 1.0),
        vec4(  0.5,  0.5, -0.5, 1.0),
        vec4(  0.5, -0.5, -0.5, 1.0)
    ];    
    
    //  Configure WebGL
    
    // set viewing window
    gl.viewport(0, 0, canvas.width, canvas.height);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
    
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );
    
    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    
    // (index, size, type, normalized, stride, offset)
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    render();
}

function render() 
{
    // set color of canvas (R, G, B, alpha "for opacity")
    gl.clearColor(0.50, 0.75, 0.75, 0.95);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}
