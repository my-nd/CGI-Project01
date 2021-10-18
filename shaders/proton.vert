attribute vec4 vPosition;
uniform float uTheta;


void main()
{
    gl_PointSize = 4.0;

    float s = sin(uTheta);
    float c = cos(uTheta);

    gl_Position.x = -s * vPosition.y + c * vPosition.x;
    gl_Position.y = s * vPosition.x + c * vPosition.y;    
    gl_Position.z = 0.0;
    gl_Position.w = 1.0;

}
