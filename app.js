import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js';

/** @type {WebGLRenderingContext} */

let gl;
let canvas;
let program;
let protonsProgram;
let eletronsProgram;

const TABLE_WIDTH = 3.0;
let table_height;

const GRID_SPACING = 0.05;
let grid = [];

let protons = [];
const MAX_CHARGES = 200;
let eletrons = [];

let thetaP = 0;
const PROTONS_ANGLE_INCREMENT = 0.04;
let thetaE = 0;
const ELETRONS_ANGLE_INCREMENT = -0.04;

function animate(time)
{
    window.requestAnimationFrame(animate);    
    gl.clear(gl.COLOR_BUFFER_BIT);



    gl.useProgram(program);

    const w = gl.getUniformLocation(program, "table_width");
    const h = gl.getUniformLocation(program, "table_height");
    
    gl.uniform1f(w, TABLE_WIDTH);
    gl.uniform1f(h, table_height);

    let color = gl.getUniformLocation(program, "color");

    gl.uniform4f(color, 1.0, 1.0, 1.0, 1.0); //white
    gl.drawArrays(gl.POINTS, 0, grid.length);



    gl.useProgram(protonsProgram);

    const colorP = gl.getUniformLocation(protonsProgram, "color"); 
    gl.uniform4f(colorP, 0.0, 1.0, 0.0, 1.0); // green: protons

    const wP = gl.getUniformLocation(protonsProgram, "table_width");
    const hP = gl.getUniformLocation(protonsProgram, "table_height");
    gl.uniform1f(wP, TABLE_WIDTH);
    gl.uniform1f(hP, table_height);

    const uThetaP =  gl.getUniformLocation(protonsProgram, "uTheta");
    thetaP += PROTONS_ANGLE_INCREMENT;
    gl.uniform1f(uThetaP, thetaP);

    gl.drawArrays(gl.POINTS, grid.length, protons.length);



    gl.useProgram(eletronsProgram);

    const colorE = gl.getUniformLocation(eletronsProgram, "color"); 
    gl.uniform4f(colorE, 1.0, 0.0, 0.0, 1.0); // red: eletrons

    const wE = gl.getUniformLocation(eletronsProgram, "table_width");
    const hE = gl.getUniformLocation(eletronsProgram, "table_height");
    gl.uniform1f(wE, TABLE_WIDTH);
    gl.uniform1f(hE, table_height);

    const uTheta =  gl.getUniformLocation(eletronsProgram, "uTheta");
    thetaE += ELETRONS_ANGLE_INCREMENT;
    gl.uniform1f(uTheta, thetaE);

    gl.drawArrays(gl.POINTS, grid.length+100, eletrons.length);
}



function setup(shaders)
{
    canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 


    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    protonsProgram = UTILS.buildProgramFromSources(gl, shaders["proton.vert"], shaders["shader1.frag"]);
    eletronsProgram = UTILS.buildProgramFromSources(gl, shaders["eletron.vert"], shaders["shader1.frag"]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    table_height = TABLE_WIDTH/ (canvas.width/canvas.height);

    for(let x = -TABLE_WIDTH/2; x <= TABLE_WIDTH/2; x += GRID_SPACING) {
        for(let y = -table_height/2; y <= table_height/2; y += GRID_SPACING) {
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

    const vPositionP = gl.getAttribLocation(protonsProgram, "vPosition");
    gl.vertexAttribPointer(vPositionP, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionP);

    const vPositionE = gl.getAttribLocation(eletronsProgram, "vPosition");
    gl.vertexAttribPointer(vPositionE, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionE);



    window.addEventListener("resize", function (event) {
        resizeCanvas();
    });

    canvas.addEventListener("click", function(event) {
        if (event.shiftKey) 
            addEletrons(event);
        else 
            addProtons(event);
    });


    window.requestAnimationFrame(animate);


}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;  
    gl.viewport(0, 0, canvas.width, canvas.height);
    table_height = TABLE_WIDTH / (canvas.width/canvas.height);    
}


function addProtons(event){

    // Start by getting x and y coordinates inside the canvas element
    const x = event.offsetX;
    const y = event.offsetY;
    
    console.log("Click at (" + x + ", " + y + ")");

    let table_x = (x - canvas.width/2) / canvas.width * TABLE_WIDTH;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;

    protons.push(MV.vec2(table_x, table_y));

    gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2']*grid.length, MV.flatten(protons));
}



function addEletrons(event){
    const x = event.offsetX;
    const y = event.offsetY;

    console.log("Click at (" + x + ", " + y + ") - SHIFT");

    let table_x = (x - canvas.width/2) / canvas.width * TABLE_WIDTH;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;

    eletrons.push(MV.vec2(table_x, table_y));

    gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2'] * (grid.length + 100) , MV.flatten(eletrons));
}


let allShaders = ["shader1.vert", "proton.vert", "eletron.vert", "shader1.frag"];
UTILS.loadShadersFromURLS(allShaders).then(s => setup(s));
