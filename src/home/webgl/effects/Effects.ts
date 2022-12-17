import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { gl } from '../core/WebGL'
import { color } from './Color'
import { fxaa } from './FXAA'
import { overlap } from './Overlap'

class Effects {
  private composer!: EffectComposer
  private composer2!: EffectComposer

  constructor() {
    this.init()
  }

  private init() {
    this.composer = new EffectComposer(gl.renderer)
    this.composer.addPass(new RenderPass(gl.scene, gl.camera))

    const renderTarget = new THREE.WebGLRenderTarget(gl.size.width, gl.size.height)
    this.composer2 = new EffectComposer(gl.renderer, renderTarget)
    this.composer2.renderToScreen = false
    this.composer2.addPass(new RenderPass(gl.scene, gl.camera))

    this.composer2.addPass(overlap.pass)
    overlap.pass.needsSwap = false

    this.composer.addPass(color.pass)
    color.setup(renderTarget.texture)

    this.composer.addPass(fxaa.pass)
  }

  setBackgroundTexture(texture: THREE.Texture) {
    color.setBackgroundTexture(texture)
  }

  resize() {
    const { width, height } = gl.size
    color.resize()
    fxaa.update()
    this.composer.setSize(width, height)
    this.composer2.setSize(width, height)
  }

  render(dt: number) {
    color.update(dt)

    gl.scene.traverse((child) => {
      child instanceof THREE.Mesh && (child.material = gl.scene.userData.alphaMaterial)
    })
    this.composer2.render()

    gl.scene.traverse((child) => {
      child instanceof THREE.Mesh && (child.material = child.userData.material)
    })
    this.composer.render()
  }
}

export const effects = new Effects()
