uniform sampler2D tDiffuse;
uniform int u_level;
varying vec2 v_uv;

void main() {
  vec4 tex = texture2D(tDiffuse, v_uv);
  float color = step(1.0 - pow(2.0, -float(u_level)) + 0.01, tex.a);
  gl_FragColor = vec4(vec3(color), color);
}