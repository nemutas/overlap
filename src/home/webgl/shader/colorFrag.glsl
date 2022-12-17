struct TextureData {
  sampler2D texture;
  vec2 uvScale;
};

uniform sampler2D tDiffuse;
uniform sampler2D tOverlap;
uniform TextureData u_background;
uniform vec2 u_resolution;
varying vec2 v_uv;

#include '../glsl/sobel.glsl'

vec4 getTexture(TextureData data) {
  vec2 uv = (v_uv - 0.5) * data.uvScale + 0.5;
  return texture2D(data.texture, uv);
}

void main() {
  vec4 tex = texture2D(tDiffuse, v_uv);
  vec4 overlap = texture2D(tOverlap, v_uv);
  vec4 background = getTexture(u_background);

  float gray = (background.r + background.g + background.b) / 3.0;
  background = vec4(vec3(gray), background.a); 
  vec4 color = mix(tex, background, overlap.r);

  color.rgb += sobel(tOverlap, v_uv, u_resolution);

  gl_FragColor = color;
}