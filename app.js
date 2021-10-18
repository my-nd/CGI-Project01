import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js';

/** @type {WebGLRenderingContext} */
let gl;
let canvas;
let program;
let protronsProgram;
let eletronsProgram;


const table_width = 3.0;
let table_height;
const grid_spacing = 0.05;
const grid = [];

const protons = [];
const MAX_CHARGES = 200;
const eletrons = [];
let theta = 0;


function animate(time)
{
    window.requestAnimationFrame(animate);
    
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    const w = gl.getUniformLocation(program, "table_width");
    const h = gl.getUniformLocation(program, "table_height");
    
    gl.uniform1f(w, table_width);
    gl.uniform1f(h, table_height);

    let color = gl.getUniformLocation(program, "color");

    gl.uniform4f(color, 1.0, 1.0, 1.0, 1.0); //white
    gl.drawArrays(gl.POINTS, 0, grid.length);



    gl.useProgram(protronsProgram);

    const color2 = gl.getUniformLocation(protronsProgram, "color"); 
    gl.uniform4f(color2, 0.0, 0.0, 1.0, 1.0); // green

    const w2 = gl.getUniformLocation(protronsProgram, "table_width");
    const h2 = gl.getUniformLocation(protronsProgram, "table_height");
    gl.uniform1f(w2, table_width);
    gl.uniform1f(h2, table_height);

    const uTheta1 =  gl.getUniformLocation(protronsProgram, "uTheta");
    theta += 0.1;
    gl.uniform1f(uTheta1, theta);

    gl.drawArrays(gl.POINTS, grid.length+100, eletrons.length);





    gl.useProgram(eletronsProgram);

    const color1 = gl.getUniformLocation(eletronsProgram, "color"); 
    gl.uniform4f(color1, 0.0, 1.0, 0.0, 1.0); // green

    const w1 = gl.getUniformLocation(eletronsProgram, "table_width");
    const h1 = gl.getUniformLocation(eletronsProgram, "table_height");
    gl.uniform1f(w1, table_width);
    gl.uniform1f(h1, table_height);

    const uTheta =  gl.getUniformLocation(eletronsProgram, "uTheta");
    theta += 0.1;
    gl.uniform1f(uTheta, theta);

    gl.drawArrays(gl.POINTS, grid.length, protons.length);




}



function setup(shaders)
{
    canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 


    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    protronsProgram = UTILS.buildProgramFromSources(gl, shaders["proton.vert"], shaders["shader1.frag"]);
    eletronsProgram = UTILS.buildProgramFromSources(gl, shaders["eletron.vert"], shaders["shader1.frag"]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    table_height = table_width / (canvas.width/canvas.height);

    for(let x = -table_width/2; x <= table_width/2; x += grid_spacing) {
        for(let y = -table_height/2; y <= table_height/2; y += grid_spacing) {
            grid.push(MV.vec2(x, y));
        }
    }

    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, (grid.length + MAX_CHARGES) * MV.sizeof['vec2'], gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(grid));

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    const vPositionP = gl.getAttribLocation(protronsProgram, "vPosition");
    gl.vertexAttribPointer(vPositionP, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionP);

    const vPositionE = gl.getAttribLocation(eletronsProgram, "vPosition");
    gl.vertexAttribPointer(vPositionE, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionE);



    window.addEventListener("resize", function (event) {
        resizeCanvas();
    });

    canvas.addEventListener("click", function(event) {
        if (event.shiftKey) {
            addEletrons(event);
        }
        else {
            addProtons(event);
        }
    });


    window.requestAnimationFrame(animate);


}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;  
    gl.viewport(0, 0, canvas.width, canvas.height);
    table_height = table_width / (canvas.width/canvas.height);    
}


function addProtons(event){

    // Start by getting x and y coordinates inside the canvas element
    const x = event.offsetX;
    const y = event.offsetY;
    
    console.log("Click at (" + x + ", " + y + ")");

    let table_x = (x - canvas.width/2) / canvas.width * table_width;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;

    protons.push(MV.vec2(table_x, table_y));

    gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2']*grid.length, MV.flatten(protons));
}



function addEletrons(event){
    const x = event.offsetX;
    const y = event.offsetY;

    console.log("Click at (" + x + ", " + y + ") - SHIFT");

    let table_x = (x - canvas.width/2) / canvas.width * table_width;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;

    eletrons.push(MV.vec2(table_x, table_y));

    gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2']*(grid.length + 100) , MV.flatten(eletrons));
}


let allShaders = ["shader1.vert", "proton.vert", "eletron.vert", "shader1.frag"];
UTILS.loadShadersFromURLS(allShaders).then(s => setup(s));
