import * as twgl from 'twgl.js';
import * as webglLessonsUI from '../lib/webgl-lessons-ui';
import * as _ from 'lodash';
const vert = require('../shaders/shader.vert');
const frag = require('../shaders/shader.frag');

export function main() {
  const gl = (document.getElementById("c") as HTMLCanvasElement).getContext("webgl");
  const programInfo = twgl.createProgramInfo(gl, [vert.sourceCode, frag.sourceCode]);

  const arrays = {
    // position: [
    //   -1, -1, 0,
    //   1, -1, 0,
    //   -1, 1, 0,
    //   -1, 1, 0,
    //   1, -1, 0,
    //   1, 1, 0
    // ],

    position: [
      0, -100, 0,
      150,  125, 0,
     -175,  100, 0,
    ],    
  };

  // ui
  let translation = [10, 10];
  function updatePosition(index: number) {
    return function (event: InputEvent, ui: { value: number }) {
      translation[index] = ui.value;
      updateMatrix();
    };
  }

  let angleInRadians = 0;
  function updateAngle(event: InputEvent, ui: { value: number }) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    updateMatrix();
  }

  let scale = [1, 1];
  function updateScale(index: number) {
    return function (event: InputEvent, ui: { value: number }) {
      scale[index] = ui.value;
      updateMatrix();
    };
  }

  webglLessonsUI.setupSlider("#x", {
    value: translation[0],
    slide: updatePosition(0),
    min: -gl.canvas.width,
    max: gl.canvas.width
  });
  webglLessonsUI.setupSlider("#y", {
    value: translation[1],
    slide: updatePosition(1),
    min: -gl.canvas.height,
    max: gl.canvas.height
  });
  webglLessonsUI.setupSlider("#angle", {
    slide: updateAngle,
    max: 360
  });
  webglLessonsUI.setupSlider("#scaleX", {
    value: scale[0],
    slide: updateScale(0),
    min: -5, max: 5, step: 0.01, precision: 2
  });
  webglLessonsUI.setupSlider("#scaleY", {
    value: scale[1],
    slide: updateScale(1),
    min: -5, max: 5, step: 0.01, precision: 2
  });

  const libMat = twgl.m4;
  const libVec = twgl.v3;

  function getObjectMatrix(){
    let objectMatrix = libMat.identity();
    objectMatrix = libMat.translate(objectMatrix, libVec.create(...translation));
    objectMatrix = libMat.rotateZ(objectMatrix, angleInRadians);
    objectMatrix = libMat.scale(objectMatrix, libVec.create(...scale));
    return objectMatrix;
  }

  console.log('getObjectMatrix:', getObjectMatrix());



  const worldView = libMat.lookAt([0, 0, -300], [0, 0, 0], [0, -1, 0]);
  const projection = libMat.perspective(Math.PI / 3, gl.canvas.width / gl.canvas.height, 1, 1000);
  let matCamera = libMat.multiply(projection, worldView);
  let worldViewProjection = libMat.multiply(matCamera, getObjectMatrix());

  let uniforms = {
    [vert.uniforms.worldViewProjection.variableName]: worldViewProjection,
    [frag.uniforms.time.variableName]: 0,
    [frag.uniforms.resolution.variableName]: [gl.canvas.width, gl.canvas.height],
  };

  // 创建变换矩阵
  function updateMatrix() {
    // const points = _.clone(arrays.position);
    // const testpt1 = _.clone(points.splice(0, 3));
    // console.log('updateMatrix..');
    worldViewProjection = libMat.multiply(matCamera, getObjectMatrix());
    uniforms[vert.uniforms.worldViewProjection.variableName] = worldViewProjection;
    twgl.setUniforms(programInfo, uniforms);
  }


  const bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

  function render(time: number) {
    twgl.resizeCanvasToDisplaySize(gl.canvas as HTMLCanvasElement);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    uniforms[frag.uniforms.time.variableName]= time * 0.001;
    uniforms[frag.uniforms.resolution.variableName] = [gl.canvas.width, gl.canvas.height];

    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    twgl.drawBufferInfo(gl, bufferInfo);

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}