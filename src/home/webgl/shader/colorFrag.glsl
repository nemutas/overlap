struct TextureData {
  sampler2D texture;
  vec2 uvScale;
};

uniform sampler2D tDiffuse;
uniform sampler2D tOverlap;
uniform TextureData u_background;
varying vec2 v_uv;

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

  // float f = step(0.1, fwidth(overlap.a));
  // color.rgb += f;

  gl_FragColor = color;
}