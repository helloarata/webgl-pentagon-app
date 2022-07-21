precision mediump float;

uniform float time;

varying vec4 vColor;

void main(){
  vec3 rgb = vColor.rbg * abs(sin(time * 0.5));
  gl_FragColor = vec4(rgb, vColor.a);
}