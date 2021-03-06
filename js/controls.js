/**
 * @file Pan controls for mouse/touch dragging camera rotation
 * @copyright Mikhail Yudin aka fagci
 * @author fagci / https://github.com/fagci https://mikhail-yudin.ru
 */

class PanControls {

  constructor (camera, container, cbClick) {
    this.camera = camera
    this.container = container
    this.mouseDown = false
    this.mouseX = 0
    this.mouseY = 0
    this.mouseMoved = false
    this.mouse = new THREE.Vector2()
    this.cbClick = cbClick

    this.lat = 0
    this.lon = 0
    this.phi = 0
    this.theta = 0

    this.target = new THREE.Vector3(0, 0, 0)

    this.verticalMin = 0
    this.verticalMax = Math.PI

    this.init()
  }

  onMouseMove (e) {
    let posX = e.touches ? e.touches[0].pageX : e.clientX
    let posY = e.touches ? e.touches[0].pageY : e.clientY

    this.mouse.x = posX / window.innerWidth * 2 - 1
    this.mouse.y = -(posY / window.innerHeight) * 2 + 1
    if (!this.mouseDown) return

    if (e.cancelable) {
      e.preventDefault()
    }

    let deltaX = posX - this.mouseX
    let deltaY = posY - this.mouseY
    this.mouseX = posX
    this.mouseY = posY
    if (Math.abs(deltaX) + Math.abs(deltaY) > 5) this.mouseMoved = true

    this.lon -= deltaX / 5
    this.lat += deltaY / 5

    this.lat = Math.max(-85, Math.min(85, this.lat))
    this.phi = THREE.Math.degToRad(90 - this.lat)

    this.theta = THREE.Math.degToRad(this.lon)

    if (this.constrainVertical) {
      this.phi = THREE.Math.mapLinear(this.phi, 0, Math.PI, this.verticalMin, this.verticalMax)
    }

    let targetPosition = this.target,
      position = this.camera.position

    targetPosition.x = position.x + 100 * Math.sin(this.phi) * Math.cos(this.theta)
    targetPosition.y = position.y + 100 * Math.cos(this.phi)
    targetPosition.z = position.z + 100 * Math.sin(this.phi) * Math.sin(this.theta)

    this.camera.lookAt(targetPosition)

  }

  onMouseDown (e) {
    // if (e.cancelable) {
    //   e.preventDefault()
    // }

    this.mouseDown = true
    this.mouseX = e.touches ? e.touches[0].pageX : e.clientX
    this.mouseY = e.touches ? e.touches[0].pageY : e.clientY
    this.mouseMoved = false
  }

  onMouseUp (e) {
    // if (e.cancelable) {
    //   e.preventDefault()
    // }
    this.mouseDown = false
    if (!this.mouseMoved && this.cbClick) this.cbClick(this.mouse)
  }

  addMouseHandler () {
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e), { passive: false })
    this.container.addEventListener('touchmove', (e) => this.onMouseMove(e), { passive: false })

    this.container.addEventListener('mousedown', (e) => this.onMouseDown(e), { passive: false })
    this.container.addEventListener('touchstart', (e) => this.onMouseDown(e), { passive: false })

    this.container.addEventListener('mouseup', (e) => this.onMouseUp(e), { passive: false })
    this.container.addEventListener('touchend', (e) => this.onMouseUp(e), { passive: false })
  }

  init () {
    this.addMouseHandler()
  }
}