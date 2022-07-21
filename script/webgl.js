export class WebGLUtility {

  static loadFile(path){
    return new Promise((resolve, reject) => {
      fetch(path)
      .then((res) => {
        return res.text();
      })
      .then((text) => {
        resolve(text);
      })
      .catch((err) => {
        reject(err);
      });
    });
  }

  static createWebGLContext(canvas){
    const gl = canvas.getContext('webgl');

    if(gl === null){
      throw new Error('webgl not supported');
    } else {
      return gl;
    }
  }

  static createShaderObject(gl, source, type){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      return shader;
    } else{
      throw new Error(gl.getShaderInfoLog(shader));
    }
  }

  static createProgramObject(gl, vs, fs){
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if(gl.getProgramParameter(program, gl.LINK_STATUS)){
      gl.useProgram(program);
      return program;
    } else {
      throw new Error(gl.getProgramInfoLog(program));
    }
  }

  static createVBO(gl, vertexArray){
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    return vbo;    
  }

  static createIBO(gl, indexArray){
    const ibo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(indexArray), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    return ibo;
  }

  static enableAttribute(gl, vbo, attLocation, attStride){
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(attLocation);
    gl.vertexAttribPointer(attLocation, attStride, gl.FLOAT, false, 0, 0);
  }
}