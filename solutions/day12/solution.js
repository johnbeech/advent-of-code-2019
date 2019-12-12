const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

function parseOrbits (input) {
  const matcher = /<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/
  return input.split('\n')
    .map(n => n.trim())
    .map(n => {
      const [, ...values] = n.match(matcher).map(n => Number.parseInt(n))
      const [x, y, z] = values
      return { x, y, z, dx: 0, dy: 0, dz: 0, kinetic: 0, potential: 0, total: 0 }
    })
}

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function sum (list) {
  return list.reduce((acc, n) => {
    return acc + n
  }, 0)
}

function stepOrbits (startOrbits) {
  const resultOrbits = JSON.parse(JSON.stringify(startOrbits))

  resultOrbits.forEach((orbit, index) => {
    function calculateDX (prop) {
      return (n) => {
        if (n[prop] > orbit[prop]) {
          return -1
        } else if (n[prop] < orbit[prop]) {
          return 1
        } else {
          return 0
        }
      }
    }

    const otherOrbits = resultOrbits.filter((n, i) => i !== index)
    orbit.dx += sum(otherOrbits.map(calculateDX('x')))
    orbit.dy += sum(otherOrbits.map(calculateDX('y')))
    orbit.dz += sum(otherOrbits.map(calculateDX('z')))
  })

  resultOrbits.forEach((orbit, index) => {
    orbit.x += orbit.dx
    orbit.y += orbit.dy
    orbit.z += orbit.dz

    orbit.kinetic = orbit.dx + orbit.dy + orbit.dz
    orbit.potential = orbit.x + orbit.y + orbit.z
    orbit.total = orbit.kinetic * orbit.potential
  })

  return resultOrbits
}

async function solveForFirstStar (input) {
  const orbits = parseOrbits(input)

  const steps = []
  let lastStep = orbits
  while (steps.length < 1000) {
    lastStep = stepOrbits(lastStep)
    steps.push(lastStep)
  }

  const solution = sum(lastStep.map(n => n.total))

  report('Input:', orbits)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
