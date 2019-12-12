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
        if (n[prop] < orbit[prop]) {
          return -1
        } else if (n[prop] > orbit[prop]) {
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

    orbit.kinetic = Math.abs(orbit.dx) + Math.abs(orbit.dy) + Math.abs(orbit.dz)
    orbit.potential = Math.abs(orbit.x) + Math.abs(orbit.y) + Math.abs(orbit.z)
    orbit.total = orbit.kinetic * orbit.potential
  })

  return resultOrbits
}

async function solveForFirstStar (input, stepCount = 1000) {
  const orbits = parseOrbits(input)

  const steps = []
  let lastStep = orbits
  while (steps.length < stepCount) {
    lastStep = stepOrbits(lastStep)
    steps.push(lastStep)
  }

  const solution = sum(lastStep.map(n => n.total))

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const orbits = parseOrbits(input)

  let universe = orbits
  let xCycle = 0
  do {
    universe = stepOrbits(universe)
    xCycle++
  } while (
    orbits[0].x !== universe[0].x ||
    orbits[1].x !== universe[1].x ||
    orbits[2].x !== universe[2].x ||
    orbits[3].x !== universe[3].x ||
    orbits[0].dx !== universe[0].dx ||
    orbits[1].dx !== universe[1].dx ||
    orbits[2].dx !== universe[2].dx ||
    orbits[3].dx !== universe[3].dx
  )
  report('X repeats after ', xCycle, 'cycles')

  universe = orbits
  let yCycle = 0
  do {
    universe = stepOrbits(universe)
    yCycle++
  } while (
    orbits[0].y !== universe[0].y ||
    orbits[1].y !== universe[1].y ||
    orbits[2].y !== universe[2].y ||
    orbits[3].y !== universe[3].y ||
    orbits[0].dy !== universe[0].dy ||
    orbits[1].dy !== universe[1].dy ||
    orbits[2].dy !== universe[2].dy ||
    orbits[3].dy !== universe[3].dy
  )
  report('Y repeats after ', yCycle, 'cycles')

  universe = orbits
  let zCycle = 0
  do {
    universe = stepOrbits(universe)
    zCycle++
  } while (
    orbits[0].z !== universe[0].z ||
    orbits[1].z !== universe[1].z ||
    orbits[2].z !== universe[2].z ||
    orbits[3].z !== universe[3].z ||
    orbits[0].dz !== universe[0].dz ||
    orbits[1].dz !== universe[1].dz ||
    orbits[2].dz !== universe[2].dz ||
    orbits[3].dz !== universe[3].dz
  )
  report('Z repeats after', zCycle, 'cycles')

  const solution = [xCycle, yCycle, zCycle].reduce(lcm)
  report('Solution 2:', solution)
}

/* Found on: https://stackoverflow.com/questions/47047682/least-common-multiple-of-an-array-values-using-euclidean-algorithm */
const gcd = (a, b) => a ? gcd(b % a, a) : b
const lcm = (a, b) => a * b / gcd(a, b)

run()
