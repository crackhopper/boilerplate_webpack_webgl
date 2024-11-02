#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 position;
uniform mat4 worldViewProjection;
uniform float time;
uniform vec2 resolution;

void main() {
    gl_Position = worldViewProjection * position;
}
