const path = require('path')
const { read, position } = require('promise-path')
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

async function solveForFirstStar (instructions) {
  const paintedPanels = {}
  const position = { x: 0, y: 0 }
  let facing = 0

  function outputSignal (value, outputs) {
    if (outputs.length >= 2) {
      const color = outputs.shift()
      const turn = outputs.shift()

      const key = `${position.x},${position.y}`
      paintedPanels[key] = color

      facing = (facing + turn + NESW.length) % NESW.length
      const direction = NESW[facing]
      position.x = position.x + direction.x
      position.y = position.y + direction.y
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
