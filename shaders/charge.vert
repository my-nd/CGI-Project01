attribute vec4 vPosition;

uniform float table_width;
uniform float table_height;

void main()
{
    gl_PointSize = 20.0;

    gl_Position.x = (vPosition.x / (table_width/2.0));
    gl_Position.y = (vPosition.y / (table_height/2.0));
    gl_Position.z = 0.0;    
    gl_Position.w = 1.0;

}
