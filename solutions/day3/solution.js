const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const directions = {
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 },
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 }
}

function parseInstruction (string) {
  const pattern = /([LRUD])(\d+)/
  const [, direction, value] = string.match(pattern)
  return { direction, value }
}

function mark (map, position, index) {
  const key = `${position.x},${position.y}`
  map[key] = (map[key] === undefined || map[key] === index) ? index : 'X'
}

function highlight (map, position, wireIndex, stepCount) {
  const key = `${position.x},${position.y}`
  if (!map[key]) {
    map[key] = {
      x: position.x,
      y: position.y,
      wires: {}
    }
  }

  map[key].wires[wireIndex] = map[key].wires[wireIndex] || []
  map[key].wires[wireIndex].push(stepCount)
}

function parseKey (key) {
  const values = key.split(',').map(n => Number.parseInt(n))
  return { x: values[0], y: values[1] }
}

async function renderMap (map, filename) {
  const boundary = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0
  }

  Object.keys(map)
    .map(parseKey)
    .forEach(key => {
      boundary.left = Math.min(boundary.left, key.x)
      boundary.right = Math.max(boundary.right, key.x)
      boundary.top = Math.max(boundary.top, key.y)
      boundary.bottom = Math.min(boundary.bottom, key.y)
    })

  report('Boundary', boundary)
  if (Math.abs(boundary.left) + Math.abs(boundary.right) > 1000 && Math.abs(boundary.top) + Math.abs(boundary.bottom) > 1000) {
    return report('Boundary too big to contemplate rendering.')
  }

  const lines = []

  for (let j = boundary.bottom; j <= boundary.top; j++) {
    const line = []
    for (let i = boundary.left; i <= boundary.right; i++) {
      const code = map[`${i},${j}`]
      line.push(code === undefined ? '.' : code)
    }
    lines.push(line)
  }

  const output = lines.map(line => line.join('')).join('\n')
  await write(fromHere(filename), output)
}

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const wires = input.split('\n')
  const map = {}

  wires.forEach((wireInput, index) => {
    const instructions = wireInput.split(',').filter(n => n).map(parseInstruction)
    report('Wire Instructions', instructions)

    const position = { x: 0, y: 0 }
    mark(map, position, 'O')
    instructions.forEach(instruction => {
      const direction = directions[instruction.direction]
      let distance = 0
      while (distance < instruction.value) {
        position.x = position.x + direction.x
        position.y = position.y + direction.y
        mark(map, position, index)
        distance = distance + 1
      }
    })
  })

  map['0,0'] = 'O'

  renderMap(map, 'output.txt')

  const intersections = Object.entries(map)
    .filter(x => x[1] === 'X')
    .map(x => parseKey(x[0]))
    .map(key => {
      const distance = Math.abs(key.x) + Math.abs(key.y)
      return {
        key,
        distance
      }
    })
    .sort((a, b) => {
      return a.distance - b.distance
    })

  report('Intersections', intersections)

  const solution = intersections[0].distance
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const wires = input.split('\n')
  const map = {}

  wires.forEach((wireInput, index) => {
    const instructions = wireInput.split(',').filter(n => n).map(parseInstruction)
    report('Wire Instructions', instructions)

    const position = { x: 0, y: 0 }
    let stepCount = 0
    highlight(map, position, 'O', stepCount)
    instructions.forEach(instruction => {
      const direction = directions[instruction.direction]
      let distance = 0
      while (distance < instruction.value) {
        stepCount = stepCount + 1
        position.x = position.x + direction.x
        position.y = position.y + direction.y
        highlight(map, position, index, stepCount)
        distance = distance + 1
      }
    })
  })

  const intersections = Object.values(map)
    .filter(x => Object.keys(x.wires).length > 1)
    .map(x => {
      report(x.wires)
      x.intersectionDistance = x.wires[0][0] + x.wires[1][0]
      return x
    })
    .sort((a, b) => {
      return a.intersectionDistance - b.intersectionDistance
    })

  report('Intersections', intersections)

  const solution = intersections[0].intersectionDistance

  report('Solution 2:', solution)
}

run()
