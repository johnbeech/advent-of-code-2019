const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const compute = require('./intcode')

const NESW = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
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
  for (let j = dimensions.top - 1; j < dimensions.bottom + 1; j++) {
    const line = []
    for (let i = dimensions.left - 1; i < dimensions.right + 1; i++) {
      const position = index[`${i},${j}`]
      const symbol = position ? '#' : ' '
      line.push(symbol)
    }
    map.push(line)
  }
  const output = map.map(n => n.join(' ')).join('\n')
  await write(fromHere(filename), output, 'utf8')
  return output
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
    }
  }

  function inputSignal (inputs) {
    const key = `${position.x},${position.y}`
    inputs.push(paintedPanels[key] || 0)
  }

  report('Solving part 1...', '[computing]')

  await compute({ instructions, inputs: [], outputs: [], outputSignal, inputSignal })

  const solution = Object.values(paintedPanels).length
  report('Input:', instructions)
  report('Solution 1:', solution)
}

async function solveForSecondStar (instructions) {
  const paintedPanels = { '0,0': 1 }
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
    }
  }

  function inputSignal (inputs) {
    const key = `${position.x},${position.y}`
    inputs.push(paintedPanels[key] || 0)
  }

  await compute({ instructions, inputs: [], outputs: [], outputSignal, inputSignal })

  report('Solving part 2...', '[computing]')

  const solution = await outputPaintMap('output.txt', paintedPanels)
  report('Solution 2:', '\n', solution)
}

run()
