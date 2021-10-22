attribute vec4 vPosition;
attribute float isMoving;

uniform float table_width;
uniform float table_height;

const int MAX_CHARGES = 100;
uniform vec2 eletronPos[MAX_CHARGES];
uniform vec2 protonPos[MAX_CHARGES];
uniform float isProtonPosEmpty;
uniform float isEletronPosEmpty;
uniform int eletronPosSize;
uniform int protonPosSize;

varying vec4 fColor; // necessário?

const float charge = 0.000000000001;
const float COULOUMB_CONSTANT = 8.99 * pow(10.0, 9.0);

#define TWOPI 6.28318530718

// convert angle to hue; returns RGB
// colors corresponding to (angle mod TWOPI):
// 0=red, PI/2=yellow-green, PI=cyan, -PI/2=purple
vec3 angle_to_hue(float angle) {
  angle /= TWOPI;
  return clamp((abs(fract(angle+vec3(3.0, 2.0, 1.0)/3.0)*6.0-3.0)-1.0), 0.0, 1.0);
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec4 colorize(vec2 f)
{
    float a = atan(f.y, f.x);
    return vec4(angle_to_hue(a-TWOPI), 1.);
}



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
        if(i < protonPosSize)
            {total += curr;}
        
        curr = vec4( eE * (eletronPos[i].x - vPosition.x)/radiusE, eE * (eletronPos[i].y - vPosition.y) / radiusE, 0.0, 0.0);
        if(i < eletronPosSize){
            total += curr;}
    }

    //if( distance(total, vec4(0.0, 0.0, 0.0, 1.0) ) > 5.0*0.05)
        total = total / distance(total, vec4(0.0, 0.0, 0.0, 0.0));
   
    return total;
}



void main()
{
    gl_PointSize = 4.0;
    if(isMoving == 0.0) {
        gl_Position.x = vPosition.x / (table_width/2.0);
        gl_Position.y = vPosition.y / (table_height/2.0);
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
    }
    else {
        gl_Position.x = vPosition.x / (table_width/2.0) + calculate().x / (table_width/2.0);
        gl_Position.y = vPosition.y / (table_height/2.0) + calculate().y / (table_height/2.0);
        gl_Position.z = 0.0;
        gl_Position.w = 1.0;
    }
    
    fColor = colorize(vec2(gl_Position.x, gl_Position.y));   

    
}

