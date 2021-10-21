import * as UTILS from '../../libs/utils.js';
import * as MV from '../../libs/MV.js';

/** @type {WebGLRenderingContext} */

let gl;
let canvas;
let program;
let chargesProgram;

const TABLE_WIDTH = 3.0;
let table_height;

const GRID_SPACING = 0.05;
let grid = [];
let isMoving = [];

const MAX_CHARGES = 200;
let protons = [];
let eletrons = [];

const PROTONS_ANGLE_INCREMENT = 0.005;
const ELETRONS_ANGLE_INCREMENT = -0.005;

let hidden = false;

function animate(time)
{
    window.requestAnimationFrame(animate);    
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    gl.useProgram(program);

    const isEletronsEmpty = gl.getUniformLocation(program, "isEletronPosEmpty");
    const isProtonsEmpty = gl.getUniformLocation(program, "isProtonPosEmpty");

    if (protons.length == 0)
        gl.uniform1f(isProtonsEmpty, 1.0);
    else gl.uniform1f(isProtonsEmpty, 0.0);

    if (eletrons.length == 0)
        gl.uniform1f(isEletronsEmpty, 1.0);
    else gl.uniform1f(isEletronsEmpty, 0.0);

    gl.drawArrays(gl.LINES, 0, grid.length);

    if (!hidden) {    

        gl.useProgram(chargesProgram);
        const colorC = gl.getUniformLocation(chargesProgram, "fColor2"); 
        gl.uniform4f(colorC, 0.0, 1.0, 0.0, 1.0); // green: positive charges


        gl.bufferSubData(gl.ARRAY_BUFFER, (MV.sizeof['vec2']) * grid.length*2, MV.flatten(protons));
        gl.bufferSubData(gl.ARRAY_BUFFER, MV.sizeof['vec2'] * (grid.length*2 + MAX_CHARGES/2), MV.flatten(eletrons));

        gl.useProgram(program);
        for(let i=0; i<protons.length; i++) {           
            const protonPos = gl.getUniformLocation(program, "protonPos[" + i + "]");
            gl.uniform2fv(protonPos, MV.flatten(protons[i]));
        }

        for(let i=0; i<eletrons.length; i++) {           
            const eletronPos = gl.getUniformLocation(program, "eletronPos[" + i + "]");
            gl.uniform2fv(eletronPos, MV.flatten(eletrons[i]));
        }

    

        gl.useProgram(chargesProgram);
        gl.drawArrays(gl.POINTS, grid.length*2, protons.length);
        gl.uniform4f(colorC, 1.0, 0.0, 0.0, 1.0); // red: negative charges    
        gl.drawArrays(gl.POINTS, grid.length*2 + MAX_CHARGES / 2, eletrons.length);

        updateChargesPosition();
    }
}




function setup(shaders)
{
    canvas = document.getElementById("gl-canvas");
    gl = UTILS.setupWebGL(canvas);

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 


    program = UTILS.buildProgramFromSources(gl, shaders["shader1.vert"], shaders["shader1.frag"]);
    chargesProgram = UTILS.buildProgramFromSources(gl, shaders["charge.vert"], shaders["charge.frag"]);

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    
    table_height = TABLE_WIDTH/ (canvas.width/canvas.height);

    for(let x = -TABLE_WIDTH/2; x <= TABLE_WIDTH/2; x += GRID_SPACING) {
        for(let y = -table_height/2; y <= table_height/2; y += GRID_SPACING) {
            grid.push(MV.vec2(x, y));
            grid.push(MV.vec2(x, y));
        }
    }

    for(let i = 0; i < grid.length; i++)
        isMoving[i] = (i % 2 == 0)? 0.0 : 1.0;



    const aBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, aBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, (grid.length*2 + MAX_CHARGES) * MV.sizeof['vec2'], gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, MV.flatten(grid));
    gl.bufferSubData(gl.ARRAY_BUFFER, grid.length*MV.sizeof['vec2'], MV.flatten(isMoving));

    

    const vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);


    const vIsMoving = gl.getAttribLocation(program, "isMoving");
    gl.vertexAttribPointer(vIsMoving, 1, gl.FLOAT, false, 0, grid.length*MV.sizeof['vec2']);
    gl.enableVertexAttribArray(vIsMoving);


    const vPositionC = gl.getAttribLocation(chargesProgram, "vPosition");
    gl.vertexAttribPointer(vPositionC, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPositionC);


    window.addEventListener("resize", function (event) {
        resizeCanvas();
    });

    canvas.addEventListener("click", function(event) {
        (event.shiftKey)? addEletrons(event) : addProtons(event);
    });

    window.addEventListener('keydown', function(event) {
        if (event.key === " ")
            (hidden)? hidden = false : hidden = true;                
    })

    resizeCanvas();

    window.requestAnimationFrame(animate);


}

function resizeCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;  
    gl.viewport(0, 0, canvas.width, canvas.height);
    table_height = TABLE_WIDTH / (canvas.width/canvas.height); 
    
    gl.useProgram(program);
    const w = gl.getUniformLocation(program, "table_width");
    const h = gl.getUniformLocation(program, "table_height");
    gl.uniform1f(w, TABLE_WIDTH);
    gl.uniform1f(h, table_height);


    gl.useProgram(chargesProgram);
    const wP = gl.getUniformLocation(chargesProgram, "table_width");
    const hP = gl.getUniformLocation(chargesProgram, "table_height");
    gl.uniform1f(wP, TABLE_WIDTH);
    gl.uniform1f(hP, table_height);
}


function addProtons(event){
    // Start by getting x and y coordinates inside the canvas element
    const x = event.offsetX;
    const y = event.offsetY;
    
    console.log("Click at (" + x + ", " + y + ")");

    let table_x = (x - canvas.width/2) / canvas.width * TABLE_WIDTH;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;

    protons.push(MV.vec2(table_x, table_y));
}



function addEletrons(event){
    // Start by getting x and y coordinates inside the canvas element
    const x = event.offsetX;
    const y = event.offsetY;

    console.log("Click at (" + x + ", " + y + ") - SHIFT");

    let table_x = (x - canvas.width/2) / canvas.width * TABLE_WIDTH;
    let table_y = -(y - canvas.height/2) / canvas.height * table_height;
    eletrons.push(MV.vec2(table_x, table_y));
 }


function updateChargesPosition(){
    for(let i = 0; i < protons.length; i++){
        let oldX = protons[i][0];
        protons[i][0] = Math.cos(PROTONS_ANGLE_INCREMENT) * protons[i][0] - Math.sin(PROTONS_ANGLE_INCREMENT) * protons[i][1];
        protons[i][1] = Math.sin(PROTONS_ANGLE_INCREMENT) * oldX + Math.cos(PROTONS_ANGLE_INCREMENT) * protons[i][1];
    }

    for(let i = 0; i < eletrons.length; i++){
        let oldX = eletrons[i][0];
        eletrons[i][0] = Math.cos(ELETRONS_ANGLE_INCREMENT) * eletrons[i][0] - Math.sin(ELETRONS_ANGLE_INCREMENT) * eletrons[i][1];
        eletrons[i][1] = Math.sin(ELETRONS_ANGLE_INCREMENT) * oldX + Math.cos(ELETRONS_ANGLE_INCREMENT) * eletrons[i][1];
    }
}


let allShaders = ["shader1.vert", "shader1.frag", "charge.vert", "charge.frag"];
UTILS.loadShadersFromURLS(allShaders).then(s => setup(s));
