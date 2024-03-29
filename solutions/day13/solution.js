const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const compute = require('./intcode')

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const tileTypes = {
  0: { id: 'empty', symbol: ' ' },
  1: { id: 'wall', symbol: '#' },
  2: { id: 'block', symbol: 'o' },
  3: { id: 'paddle', symbol: '_' },
  4: { id: 'ball', symbol: '@' },
  99: { id: 'unknown', symbol: '.' }
}

async function ouputPoints (filename, index) {
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
  for (let j = dimensions.top; j <= dimensions.bottom; j++) {
    const line = []
    for (let i = dimensions.left; i <= dimensions.right; i++) {
      const position = index[`${i},${j}`]
      const { symbol } = (tileTypes[position] || tileTypes[99])
      line.push(symbol)
    }
    map.push(line)
  }
  const output = map.map(n => n.join(' ')).join('\n')
  await write(fromHere(filename), output, 'utf8')
  return output
}

async function solveForFirstStar (instructions) {
  const screen = {}
  function outputSignal (value, outputs) {
    if (outputs.length === 3) {
      const x = outputs.shift()
      const y = outputs.shift()
      const tileId = outputs.shift()
      const key = `${x},${y}`
      screen[key] = tileId
    }
  }

  await compute({ instructions, outputSignal })

  const solution = Object.values(screen).filter(n => n === 2).length

  const render = await ouputPoints('screen.txt', screen)
  console.log(render)

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const screen = {}
  let score = 0
  const ball = { x: 0, y: 0 }
  const paddle = { x: 0, y: 0 }
  function outputSignal (value, outputs) {
    if (outputs.length === 3) {
      const x = outputs.shift()
      const y = outputs.shift()
      const value = outputs.shift()

      if (x === -1 && y === 0) {
        score = value
      } else {
        if (value === 4) {
          ball.x = x
          ball.y = y
        }
        if (value === 3) {
          paddle.x = x
          paddle.y = y
        }
        const key = `${x},${y}`
        screen[key] = value
      }
    }
  }

  function inputSignal () {
    if (paddle.x < ball.x) {
      inputs.push(1)
    } else if (paddle.x > ball.x) {
      inputs.push(-1)
    } else {
      inputs.push(0)
    }
  }

  const inputs = []
  const instructions = input.split(',')
  instructions[0] = 2
  await compute({ instructions: instructions.join(','), inputs, outputSignal, inputSignal })

  const render = await ouputPoints('screen.txt', screen)
  console.log(render)

  const solution = score

  report('Solution 2:', solution)
}

run()
