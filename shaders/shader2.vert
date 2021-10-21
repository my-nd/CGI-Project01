attribute vec4 vPosition;
attribute float isMoving;

uniform float table_width;
uniform float table_height;


const int MAX_CHARGES = 100;
uniform vec2 eletronPos[MAX_CHARGES];
uniform vec2 protonPos[MAX_CHARGES];

const float charge = 0.00000001;
const float COULOUMB_CONSTANT = 8.99 * pow(10.0, 9.0);



vec4 calculate(){
    float radiusP, radiusE, eE, eP;
    vec4 curr;
    vec4 total = vec4(0.0, 0.0, 0.0, 1.0);


    for(int i = 0; i < MAX_CHARGES; i++){
        radiusP = distance(vec2(protonPos[i].x, protonPos[i].y), vec2(vPosition.x, vPosition.y));
        radiusE = distance(vec2(eletronPos[i].x, eletronPos[i].y), vec2(vPosition.x, vPosition.y));
        eP = COULOUMB_CONSTANT * charge / (radiusP*radiusP);
        eE = COULOUMB_CONSTANT * (-charge) / (radiusE*radiusE);
        
        curr = vec4( eP * (protonPos[i].x - vPosition.x)/radiusP, eP * (protonPos[i].y - vPosition.y) / radiusP, 0.0, 0.0);
        total += curr;
        
        curr = vec4( eE * (eletronPos[i].x - vPosition.x)/radiusE, eE * (eletronPos[i].y - vPosition.y) / radiusE, 0.0, 0.0);
        total += curr;
    }
    return total;
}



void main()
{
    gl_PointSize = 4.0;
    if(isMoving == 0.0)
        gl_Position = vPosition;
    else
        gl_Position = vPosition + calculate();
}

