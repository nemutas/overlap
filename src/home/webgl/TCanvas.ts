import gsap from 'gsap'
import * as THREE from 'three'
import { resolvePath } from '../../scripts/utils'
import { gl } from './core/WebGL'
import { effects } from './effects/Effects'
import { Assets, loadAssets } from './utils/assetLoader'

export class TCanvas {
  private planeGroup = new THREE.Group()
  private animeID?: number

  private assets: Assets = {
    image1: { path: resolvePath('resources/wlop1.jpg') },
    image2: { path: resolvePath('resources/wlop2.jpg') },
    image3: { path: resolvePath('resources/wlop3.jpg') },
  }

  private bgTextureCount = 0
  private bgTextures: THREE.Texture[] = []

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.createObjects()
      this.setAnimationFrame()
      this.animate()
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.camera.position.z = 2
    gl.setResizeCallback(this.resize)

    this.bgTextures.push(this.assets.image1.data as THREE.Texture)
    this.bgTextures.push(this.assets.image2.data as THREE.Texture)
    this.bgTextures.push(this.assets.image3.data as THREE.Texture)
  }

  private rescale(min: number, max: number, val: number) {
    return val * (max - min) + min
  }

  private getRandomScale(seed: number) {
    return this.rescale(0.1, 0.5, THREE.MathUtils.seededRandom(seed))
  }

  private getRandomPosY(seed: number) {
    return this.rescale(-1, 1, THREE.MathUtils.seededRandom(seed))
  }

  private createObjects() {
    const alphaMaterial = new THREE.MeshBasicMaterial({ opacity: 0.5, transparent: true })
    gl.scene.userData.alphaMaterial = alphaMaterial

    const colors = ['#41D1FF', '#BD34FE', '#FFDD35']
    const amount = 100

    for (let i = 0; i < amount; i++) {
      const rc = THREE.MathUtils.seededRandom(i)

      const geometry = new THREE.PlaneGeometry()
      const material = new THREE.MeshBasicMaterial({ color: colors[~~(rc * 10) % colors.length] })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData.material = material

      const scale = this.getRandomScale(i * 7)
      mesh.scale.set(scale, scale, 1.0)
      mesh.position.set(this.rescale(-1.3, 1.3, i / amount), this.getRandomPosY(i * 23), i * 0.001)

      mesh.userData.position = mesh.position.clone()

      this.planeGroup.add(mesh)
    }
    gl.scene.add(this.planeGroup)
  }

  private slideOut() {
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

    this.planeGroup.children.forEach((child) => {
      tl.to(child.scale, { x: 2, duration: 1.5 }, '<')
      tl.to(child.scale, { y: 0, duration: 1 }, '<1%')
      tl.to(child.position, { x: -10, duration: 2 }, '<1%')
    })
  }

  private slideIn() {
    effects.setBackgroundTexture(this.bgTextures[this.bgTextureCount++ % this.bgTextures.length])

    const seed = ~~(Math.random() * 1000)
    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

    this.planeGroup.children.forEach((child, i) => {
      child.position.y = this.getRandomPosY(i * 17 + seed)
      const scale = this.getRandomScale(i * 23 + seed)

      tl.fromTo(child.position, { x: 10 }, { x: child.userData.position.x, duration: 1 }, '<')
      tl.fromTo(child.scale, { y: 0 }, { y: scale, ease: 'power3.in', duration: 1 }, '<1%')
      tl.fromTo(child.scale, { x: 3 }, { x: scale, duration: 1 }, '<2%')
    })
  }

  private slide() {
    const tl = gsap.timeline()
    tl.fromTo(this.planeGroup.position, { x: 0.3 }, { x: -0.3, ease: 'none', duration: 5 })
  }

  private animate() {
    const order = () => {
      this.slide()
      this.slideIn()
      setTimeout(() => this.slideOut(), 2500)
    }
    order()
    setInterval(() => order(), 6200)
  }

  private resize = () => {
    const t = THREE.MathUtils.smoothstep(gl.size.width, 768, 1400)
    const scale = THREE.MathUtils.lerp(0.5, 1, t)
    gl.scene.scale.set(scale, scale, scale)

    effects.resize()
  }

  // ----------------------------------
  // animation frame
  private setAnimationFrame() {
    const anime = () => {
      const dt = gl.time.getDelta()

      // gl.render()
      effects.render(dt)

      requestAnimationFrame(anime)
    }
    this.animeID = requestAnimationFrame(anime)
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
    this.animeID && cancelAnimationFrame(this.animeID)
  }
}
