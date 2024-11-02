import * as twgl from 'twgl.js';
import webglLessonsUI from '../lib/webgl-lessons-ui';
const vert = require('../shaders/shader.vert');
const frag = require('../shaders/shader.frag');

export function main() {
  const gl = (document.getElementById("c") as HTMLCanvasElement).getContext("webgl");
  const programInfo = twgl.createProgramInfo(gl, [vert.sourceCode, frag.sourceCode]);
 
  const arrays = {
    position: [
      -1, -1, 0, 
      1, -1, 0, 
      -1, 1, 0, 
      -1, 1, 0, 
      1, -1, 0, 
      1, 1, 0
    ],
  };

  // ui
  let translation = [200, 150];
  let angleInRadians = 0;
  let scale = [1, 1];
  webglLessonsUI.setupSlider("#x", {value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
  webglLessonsUI.setupSlider("#y", {value: translation[1], slide: updatePosition(1), max: gl.canvas.height});
  webglLessonsUI.setupSlider("#angle", {slide: updateAngle, max: 360});
  webglLessonsUI.setupSlider("#scaleX", {value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2});
  webglLessonsUI.setupSlider("#scaleY", {value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2});

  function updatePosition(index: number) {
    return function(event: any, ui: any) {
      translation[index] = ui.value;
      console.log('translation', translation);
    };
  }

  function updateAngle(event: any, ui: any) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    console.log('angleInRadians', angleInRadians);
  }

  function updateScale(index: number) {
    return function(event: any, ui: any) {
      scale[index] = ui.value;
      console.log('scale', scale);
    };
  }  


  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);
 
  function render(time: number) {
    twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
 
    const uniforms = {
      [frag.uniforms.time.variableName]: time * 0.001,
      [frag.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
    };
 
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);
 
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}