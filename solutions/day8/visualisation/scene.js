/* global THREE, requestAnimationFrame */
// From d3-threeD.js
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var renderer, scene, camera, orbitControls

init()
animate()

//

function addCube (scene, x=0, y=0, z=0, pixel=0) {
  if (pixel === 2)
    return

  var geometry = new THREE.BoxGeometry(1, 1, 1)
  let color = pixel === 1 ? 0xffffff : 0x000000
  const material = new THREE.MeshPhongMaterial({
    color,
    opacity: (100 - Math.abs(y)) / 100,
    transparent: true
  })
  var cube = new THREE.Mesh(geometry, material)
  cube.position.set(x, y, z)
  scene.add(cube)
  return cube
}


function loadImageData(parent) {
  var loader = new THREE.FileLoader()
  loader.load('./image.json', function ( data ) {
    const image = JSON.parse(data)
  	console.log('Loaded image data:', image)

    const { dimensions } = image

    renderLayer(parent, 0, image.render, dimensions)
    image.layers.forEach((layer, index) => {
      if (layer) {
        renderLayer(parent, index - dimensions.layers, layer.pixels, dimensions)
      }
    })

    parent.position.set(-dimensions.width / 2 + 0.5, 0, -dimensions.height / 2 + 0.5)
  })
}

function renderLayer(parent, layerNumber, pixels, dimensions) {
  const area = [].concat(pixels)
  const pixelsPerLayer = dimensions.width * dimensions.height
  while (area.length > 0) {
    let i = pixelsPerLayer - area.length
    let x = i % dimensions.width
    let y = 0.5 + (1 * layerNumber)
    let z = Math.floor(i / dimensions.width)
    let pixel = area.pop()
    let cube = addCube(parent, x, y, z, pixel)
  }
}

//

function init () {
  var container = document.getElementById('container')

  //

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xb0b0b0)

  //

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 5000)
  camera.position.set(40, 40, 40)

  //

  var group = new THREE.Group()
  scene.add(group)

  //

  var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6)
  directionalLight.position.set(0.75, 0.75, 1.0).normalize()
  scene.add(directionalLight)

  var ambientLight = new THREE.AmbientLight(0xcccccc, 0.2)
  scene.add(ambientLight)

  //

  var helper = new THREE.GridHelper(25, 10)
  scene.add(helper)

  //

  loadImageData(group)

  //

  renderer = new THREE.WebGLRenderer({
    antialias: true
  })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(window.innerWidth, window.innerHeight)
  container.appendChild(renderer.domElement)

  //

  orbitControls = new THREE.OrbitControls(camera, renderer.domElement)
  console.log('Created control orbit helper', orbitControls)

  //

  window.addEventListener('resize', onWindowResize, false)
}

function onWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()

  renderer.setSize(window.innerWidth, window.innerHeight)
}

function animate () {
  requestAnimationFrame(animate)

  render()
}

function render () {
  renderer.render(scene, camera)
}
