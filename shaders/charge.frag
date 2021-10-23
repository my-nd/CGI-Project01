precision highp float;

uniform vec4 color;


bool paintEletron(float x, float y){
    return pow(x-0.5, 2.0) + pow(y-0.5, 2.0) <= 0.25 && (y <= 0.4 || y >= 0.6 || x <= 0.15 || x >= 0.85); 
}


bool paintProton(float x, float y){
    return pow(x-0.5, 2.0) + pow(y-0.5, 2.0) <= 0.25 && (y <= 0.4 || y >= 0.6 || x <= 0.15 || x >= 0.85) 
            && (x <= 0.4 || x >= 0.6 || y <= 0.15 || y >= 0.85);
}


void main()
{

    if( color == vec4(1.0, 0.0, 0.0, 1.0) ){
        if( paintEletron(gl_PointCoord.x, gl_PointCoord.y) ) gl_FragColor = color;
    }
        
    else {
        if( paintProton(gl_PointCoord.x, gl_PointCoord.y) ) gl_FragColor = color;
    }
    
}