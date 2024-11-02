#ifdef GL_ES
precision mediump float;
#endif

uniform mat4 worldViewProjection;
uniform float time;
uniform vec2 resolution; 

void main()
{
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(uv.x, uv.y, abs(cos(time/2.)), 1.);
}