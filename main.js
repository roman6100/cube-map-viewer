const ROOM_SIZE = 3.0
const HALF_RS = ROOM_SIZE / 2
const SRC_PATH = '/res/'
const FOV = 95

let container
let camera, scene, renderer
let minimapCamera
let navHelper
let stats

let controls
let navigation


let rooms;
let currentRoom;

let windowHalfX, windowHalfY
let insetWidth, insetHeight

const debugPane = document.querySelector('#debugpane')
const cubeGeometry = new CubeGeometry(ROOM_SIZE);
const textureManager = new TextureManager(SRC_PATH, '#loading', '.progressbar');

function makeRoomFromSS(fname, position) {
  const map = textureManager.load(fname)  
  map.minFilter = THREE.NearestFilter;
  map.magFilter = THREE.NearestFilter;
  const mat = new THREE.MeshBasicMaterial({map, side: THREE.BackSide, color: 0xffffff, transparent: true});
  const cube = new THREE.Mesh(cubeGeometry, mat)
  cube.scale.x = -1
  cube.position.copy(position)
  cube.layers.enable(1) // all rooms in two layers by default
  cube.layers.disable(0)
  rooms.add(cube)
}

function initRooms() {
  rooms = new THREE.Group()
  scene.add(rooms)
  fetch('/res/point.txt')
  .then((d) => d.text())
  .then(t => {
    t.split('\n').forEach((m) => {
      let matches = m.match(/^(\d+) X=([0-9.-]+) Y=([0-9.-]+) Z=([0-9.-]+)$/i)
      if(!matches) return
      let name = 'render_light'+('000'+matches[1]).slice(-4) + '.jpg'
      let position = new THREE.Vector3(+matches[2], HALF_RS, +matches[3])
      makeRoomFromSS(name, position)
      navigation.setRoom(rooms.children[0])
    })
  })
}



function initCamera () {
  camera = new THREE.PerspectiveCamera(FOV, window.innerWidth / window.innerHeight, 0.1, 400)
  camera.position.set(0, 0, -0.01)
  // camera.lookAt(200, HALF_RS, 0)
}

function initMinimap () {
  let mmSize = 9
  minimapCamera = new THREE.OrthographicCamera(-mmSize, mmSize, mmSize, -mmSize, 0.01, 1000)
  scene.add(minimapCamera)

  minimapCamera.position.y = 20
  minimapCamera.lookAt(camera.position)
  minimapCamera.layers.enable(1)
  minimapCamera.layers.disable(0)
}

function initScene() {
  scene = new THREE.Scene()

  initRooms()
  initCamera()
  initMinimap()
  
  navigation = new Navigation(scene, rooms, camera, minimapCamera)
}

function initRenderer() {
  renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.alpha = true
  container.appendChild(renderer.domElement)
}

function init() {
  THREE.Cache.enabled = true
  stats = new Stats()
  debugPane.appendChild(stats.domElement)
  container = document.createElement('div')
  document.body.appendChild(container)

  initRenderer()
  initScene()

  window.addEventListener('resize', onWindowResize, false)
  onWindowResize()

  controls = new PanControls(camera, container, (mouse) => navigation.handleClick(mouse))
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2
  windowHalfY = window.innerHeight / 2
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)

  insetWidth = window.innerHeight / 4
  insetHeight = window.innerHeight / 4

  minimapCamera.aspect = insetWidth / insetHeight
  minimapCamera.updateProjectionMatrix()
}

function animate() {
  stats.begin()
  TWEEN.update()
  requestAnimationFrame(animate)

  navigation.update()

  render()
  stats.end()
}

function render() {
  renderer.setClearColor(0x00aaee)
  renderer.setViewport(0, 0, window.innerWidth, window.innerHeight)
  renderer.render(scene, camera)

  renderer.setClearColor(0x333333)
  renderer.clearDepth()
  renderer.setScissorTest(true)
  renderer.setScissor(16, 16, insetWidth, insetHeight)
  renderer.setViewport(16, 16, insetWidth, insetHeight)
  renderer.render(scene, minimapCamera)
  renderer.setScissorTest(false)
}

init()
animate()
