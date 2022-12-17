import * as THREE from 'three'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import fragmentShader from '../shader/overlapFrag.glsl'
import vertexShader from '../shader/overlapVert.glsl'
import { gui } from '../utils/gui'

class Overlap {
  public pass: ShaderPass

  constructor() {
    this.pass = this.createPass()
    this.setGui()
  }

  private createPass() {
    const shader: THREE.Shader = {
      uniforms: {
        tDiffuse: { value: null },
        u_level: { value: 1 },
      },
      vertexShader,
      fragmentShader,
    }
    return new ShaderPass(shader)
  }

  private setGui() {
    gui.add(this.pass.uniforms.u_level, 'value', 1, 5, 1).name('level')
  }
}

export const overlap = new Overlap()
