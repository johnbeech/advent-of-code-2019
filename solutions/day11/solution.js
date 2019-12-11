const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const compute = require('./intcode')

const NESW = [
  { x: 0, y: 1 },
  { x: 1, y: 0 },
  { x: 0, y: -1 },
  { x: -1, y: 0 }
]

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function outputPaintMap (filename, index) {
  const points = Object.keys(index)
    .map(k => k.split(',').map(n => Number.parseInt(n)))
    .map(k => {
      return { x: k[0], y: k[1] }
    })

  const dimensions = {
    left: Math.min(...points.map(n => n.x)),
    right: Math.max(...points.map(n => n.x)),
    top: Math.min(...points.map(n => n.y)),
    bottom: Math.max(...points.map(n => n.y))
  }

  report('Dimensions:', dimensions)
  const map = []
  for (let j = dimensions.top; j < dimensions.bottom; j++) {
    const line = []
    for (let i = dimensions.left; i < dimensions.right; i++) {
      const position = index[`${i},${j}`]
      const symbol = position !== undefined ? position : '.'
      line.push(symbol)
    }
    map.push(line)
  }
  const output = map.map(n => n.join('')).join('\n')
  return write(fromHere(filename), output, 'utf8')
}

async function solveForFirstStar (instructions) {
  const paintedPanels = { '0,0': 0 }
  const position = { x: 0, y: 0 }
  let rotation = 0

  function outputSignal (value, outputs) {
    if (outputs.length >= 2) {
      const color = outputs.shift()
      const turn = outputs.shift() ? 1 : -1

      const key = `${position.x},${position.y}`
      paintedPanels[key] = color

      rotation = (rotation + turn)
      const facing = ((rotation % NESW.length) + NESW.length) % NESW.length
      const direction = NESW[facing]
      position.x = position.x + direction.x
      position.y = position.y + direction.y

      // report('Paint', color ? 'W' : 'B', 'Turn', turn ? 'R' : 'L', 'to', 'NESW'.charAt(facing))

      if (Object.keys(paintedPanels).length === 200) {
        outputPaintMap('output.txt', paintedPanels)
      }
    }
  }

  function inputSignal (inputs) {
    const key = `${position.x},${position.y}`
    inputs.push(paintedPanels[key] || 0)
  }

  await compute({ instructions, inputs: [], outputs: [], outputSignal, inputSignal })

  const solution = Object.values(paintedPanels).length
  report('Input:', instructions)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
