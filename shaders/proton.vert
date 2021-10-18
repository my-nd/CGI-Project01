attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;
uniform float uTheta;


void main()
{
    gl_PointSize = 10.0;

    float s = sin(uTheta);
    float c = cos(uTheta);

    //gl_Position.x = -s * vPosition.y + c * vPosition.x;
    //gl_Position.y = s * vPosition.x + c * vPosition.y; 

    gl_Position.x = (vPosition.x / (table_width/2.0)) * c - (vPosition.y / (table_height/2.0)) * s;
    gl_Position.y = (vPosition.x / (table_width/2.0)) * s + (vPosition.y / (table_height/2.0)) * c;


    gl_Position.z = 0.0;    
    gl_Position.w = 1.0;

}
