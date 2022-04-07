/*
    include file for robot.html
*/ 

function initCanvas()
{
    // console log for succesful call
    console.log('initCanvas() was called');

    var canvas = document.getElementById('robot-home');
    var gl = WebGLUtils.setupWebGL(canvas);

    if (!gl) 
    { 
        alert("WebGL isn't available on your browser");
    }
    
    // set viewing window
    gl.viewport(0, 0, canvas.width, canvas.height);
    
    // set color of canvas (R, G, B, alpha "for opacity")
    gl.clearColor(0.50, 0.75, 0.75, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}


