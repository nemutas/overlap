import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { gl } from '../core/WebGL'
import fragmentShader from '../shader/colorFrag.glsl'
import vertexShader from '../shader/colorVert.glsl'
import { calcCoveredTextureScale } from '../utils/coveredTexture'

class Color {
  public pass: ShaderPass

  constructor() {
    this.pass = this.createPass()
  }

  private createPass() {
    const shader: THREE.Shader = {
      uniforms: {
        tDiffuse: { value: null },
        tOverlap: { value: null },
        u_background: { value: { texture: null, uvScale: new THREE.Vector2() } },
        u_resolution: { value: new THREE.Vector2(gl.size.width, gl.size.height) },
      },
      vertexShader,
      fragmentShader,
    }
    return new ShaderPass(shader)
  }

  setup(overlapTexture: THREE.Texture) {
    this.pass.uniforms.tOverlap.value = overlapTexture
  }

  setBackgroundTexture(texture: THREE.Texture) {
    calcCoveredTextureScale(texture, gl.size.aspect, this.pass.uniforms.u_background.value.uvScale)
    this.pass.uniforms.u_background.value.texture = texture
  }

  resize() {
    const { texture, uvScale } = this.pass.uniforms.u_background.value
    calcCoveredTextureScale(texture, gl.size.aspect, uvScale)
    this.pass.uniforms.u_resolution.value.set(gl.size.width, gl.size.height)
  }
}

export const color = new Color()
