import { WebGLUtility } from "./webgl.js";

window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
  app.load()
  .then(() => {
    app.setupLeftGeometry();  // 重複したジオメトリ
    app.setupRightGeometry(); // IBOを使用したジオメトリ
    app.start();
  });
}, false);

class App{
  constructor(){
    this.canvas          = null;
    this.gl              = null;
    this.program         = null;
    this.uniformLocation = null;  
    this.startTime       = null;
    this.isRender        = false;
    this.setupArray      = [];    // 複数のジオメトリ情報を格納する配列 @@@
    this.render          = this.render.bind(this);
  }
  init(){
    this.canvas = document.getElementById('webgl-canvas');
    this.gl = WebGLUtility.createWebGLContext(this.canvas);
    const size = Math.min(window.innerWidth, window.innerHeight);
    this.canvas.width = size;
    this.canvas.height = size;
  }

  load(){
    return new Promise((resolve) => {
      const gl = this.gl;
      let vs = null;
      let fs = null;
      WebGLUtility.loadFile('./shader/main.vert')
      .then((vertexShaderSource) => { 
        vs = WebGLUtility.createShaderObject(gl, vertexShaderSource, gl.VERTEX_SHADER);
        return WebGLUtility.loadFile('./shader/main.frag');
      })
      .then((fragmentShaderSource) => {
        fs = WebGLUtility.createShaderObject(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        this.program = WebGLUtility.createProgramObject(gl, vs, fs);
        resolve();
      });
    });
  }

  setupLeftGeometry(){
    const gl = this.gl;
    // 頂点属性 position を定義
    const position = [
      // 中央のポリゴン
      -0.5, 0.2, 0.0,
      -0.4, -0.1, 0.0,
      -0.6, -0.1, 0.0,
      // 右側のポリゴン
      -0.5, 0.2, 0.0,
      -0.35, 0.08, 0.0,
      -0.4, -0.1, 0.0,
      // 左側のポリゴン
      -0.5, 0.2, 0.0,
      -0.6, -0.1, 0.0,
      -0.65, 0.08, 0.0,
    ];

    const positionStride = 3;
    const positionVBO = WebGLUtility.createVBO(gl, position);

    // 頂点属性 color を定義
    const color = [
      1.0, 0.8, 0.8, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,

      1.0, 0.8, 0.8, 1.0,
      1.0, 0.8, 0.8, 1.0,
      1.0, 1.0, 1.0, 1.0,

      1.0, 0.8, 0.8, 1.0,
      1.0, 1.0, 1.0, 1.0,
      1.0, 1.0, 1.0, 1.0,
    ];
    const colorStride = 4;
    const colorVBO = WebGLUtility.createVBO(gl, color);

    // ジオメトリに関する情報を this.setupArray 配列に纏める // @@@
    this.setupArray.push({
      name: {
        position: 'position',
        color: 'color',
      },
      attribute: {
        position: position,
        color: color
      },
      stride: {
        position: positionStride,
        color: colorStride,
      },
      vbo: {
        position: positionVBO,
        color: colorVBO,
      },
      index: {
        position: null,
        // color: null,
      },
      ibo: {
        position: null,
        // color: null,
      },
    });
  }

  setupRightGeometry(){
    const gl = this.gl;
    const position = [
      0.5, 0.2, 0.0,   // 0
      0.4, -0.1, 0.0,  // 1
      0.6, -0.1, 0.0,  // 2
      0.35, 0.08, 0.0, // 3
      0.65, 0.08, 0.0, // 4
    ];
    const positionIndex = [
      0, 1, 2,
      0, 1, 3,
      0, 4, 2,
    ];
    const positionStride = 3;
    const positionVBO = WebGLUtility.createVBO(gl, position);
    const positionIBO = WebGLUtility.createIBO(gl, positionIndex);
    

    const color = [
      1.0, 0.8, 0.8, 1.0, // 頂点0の色
      1.0, 1.0, 1.0, 1.0, // 頂点1の色
      1.0, 1.0, 1.0, 1.0, // 頂点2の色
      1.0, 0.8, 0.8, 1.0, // 頂点3の色
      1.0, 0.8, 0.8, 1.0, // 頂点4の色
    ];
    // const colorIndex = [
    //   0,1,1,
    //   0,0,1,
    //   0,1,1,
    // ];
    const colorStride = 4;
    const colorVBO = WebGLUtility.createVBO(gl, color);
    // const colorIBO = WebGLUtility.createIBO(gl, colorIndex)

    // ジオメトリに関する情報を this.setupArray 配列に纏める // @@@
    this.setupArray.push({
      name: {
        position: 'position',
        color: 'color',
      },
      attribute: {
        position: position,
        color: color
      },
      stride: {
        position: positionStride,
        color: colorStride,
      },
      vbo: {
        position: positionVBO,
        color: colorVBO,
      },
      index: {
        position: positionIndex,
        // color: colorIndex,
      },
      ibo: {
        position: positionIBO,
        // color: colorIBO,
      },
    });
  }

  setupLocation(array){
    const gl = this.gl;
    for (let i = 0; i < array.length; i++) {
      // シェーダーのエントリーポイント内に(main)、引数で渡した変数名があるか確認する。確認できれば 0 ~ n の 整数値を返却して、確認できない場合は -1 が返却される
      let attPosition = gl.getAttribLocation(this.program, array[i].name.position);
      let attColor = gl.getAttribLocation(this.program, array[i].name.color);
      WebGLUtility.enableAttribute(
        gl,
        array[i].vbo.position,
        attPosition,
        array[i].stride.position
      );  
      WebGLUtility.enableAttribute(
        gl,
        array[i].vbo.color,
        attColor,
        array[i].stride.color
      );
      
      // プログラムオブジェクトを選択
      gl.useProgram(this.program);
      
      // 描画時にインデックスバッファを使用して描画するか否か判定
      if(array[i].index.position !== null){
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, array[i].ibo.position);
        // this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, array[i].ibo.color);
        // インデックスバッファのドローコール
        gl.drawElements(gl.TRIANGLES, array[i].index.position.length, gl.UNSIGNED_SHORT, 0);
      } else {
        // 描画
        gl.drawArrays(
          gl.TRIANGLES,
          0,
          array[i].attribute.position.length / array[i].stride.position
        );
      }
    }

    // uniform location の取得 
    this.uniformLocation = {
      time: gl.getUniformLocation(this.program, 'time'),
    };
  }

  setupRendering(){
    const gl = this.gl;
    // ビューポートを設定
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    // クリアする色を設定 RGBA で 0.0 ~ 1.0 の範囲で指定
    gl.clearColor(0.8, 0.75, 0.8, 1.0);
    // 実際にクリアする (gl.COLOR_BUFFER_BIT で色をクリアしろ、という指定になる)
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // 描画を開始する
  start(){
    // レンダリング開始時のタイムスタンプを取得しておく
    this.startTime = Date.now();
    // レンダリングを行なっているフラグを立てておく
    this.isRender = true;
    // レンダリングの開始
    this.render();
  }
  render(){
    const gl = this.gl;
    if(this.isRender === true){
      requestAnimationFrame(this.render);
    }
    // ビューポートの設定やクリア処理は毎フレーム呼び出す
    this.setupRendering();
    // 現在までの経過時間を計算し、秒単位に変換する
    const nowTime = (Date.now() - this.startTime) * 0.001;
    
    // セットアップロケーション内で予め配列で纏めたジオメトリを都度描画する @@@
    this.setupLocation(this.setupArray);
    
    // ロケーションを指定して、uniform 変数の値を更新する (GPU に送る)
    // 一つの浮動小数点 float
    gl.uniform1f(this.uniformLocation.time, nowTime);
   
  }
}