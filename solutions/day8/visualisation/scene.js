/* global THREE, requestAnimationFrame */
// From d3-threeD.js
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var renderer, scene, camera, orbitControls

init()
animate()

//

function addCube (scene) {
  var geometry = new THREE.BoxGeometry(10, 10, 10)
  const color = 0x000000
  const material = new THREE.MeshPhongMaterial({
    color,
    opacity: 0.5,
    transparent: true,
  })
  var cube = new THREE.Mesh(geometry, material)
  scene.add(cube)
  return cube
}

//

function init () {
  var container = document.getElementById('container')

  //

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xb0b0b0)

  //

  camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000)
  camera.position.set(400, 400, 400)

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

  var helper = new THREE.GridHelper(250, 10)
  // helper.rotation.x = Math.PI / 2
  group.add(helper)

  //

  addCube(scene)

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
