const path = require('path')
const { read, write, clean, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const compute = require('./intcode')

async function run () {
  await clean(fromHere('./steps'))
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const tileTypes = {
  0: { id: 'wall', symbol: '#', traversable: false },
  1: { id: 'empty', symbol: '.', traversable: true },
  2: { id: 'oxygen', symbol: 'o', traversable: true },
  3: { id: 'robot', symbol: '@' },
  99: { id: 'unknown', symbol: ' ' }
}
const tileIndex = {
  wall: tileTypes[0],
  empty: tileTypes[1],
  oxygen: tileTypes[2],
  robot: tileTypes[3],
  unknown: tileTypes[99]
}

const directions = {
  N: { x: 0, y: -1, input: 1, index: 0 },
  E: { x: 1, y: 0, input: 4, index: 1 },
  S: { x: 0, y: 1, input: 2, index: 2 },
  W: { x: -1, y: 0, input: 3, index: 3 }
}
const directionList = Object.values(directions)

async function ouputPoints (filename, index, robot) {
  index = JSON.parse(JSON.stringify(index))
  index[`${robot.x},${robot.y}`] = robot.tileType
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
      const { symbol } = position || tileIndex.unknown
      line.push(symbol)
    }
    map.push(line)
  }
  const output = map.map(n => n.join(' ')).join('\n')
  await write(fromHere(filename), output, 'utf8')
  return output
}

async function solveForFirstStar (instructions) {
  const hallways = {}
  const robot = { x: 0, y: 0, facing: directions.W, steps: [], tileType: tileTypes[3] }

  function exits () {
    return directionList.map(direction => {
      const target = {
        x: robot.x + direction.x,
        y: robot.y + direction.y,
        direction
      }
      target.tileType = hallways[`${target.x},${target.y}`] || tileIndex.unknown
      return target
    })
  }

  function unexplored () {
    return exits().filter(n => n.tileType === tileIndex.unknown)
  }

  function outputSignal (value, outputs) {
    // report('Output', value, outputs)
    const tileInfo = outputs.pop()
    const target = {
      x: robot.x + robot.facing.x,
      y: robot.y + robot.facing.y
    }
    target.tile = tileTypes[tileInfo]
    hallways[`${target.x},${target.y}`] = tileTypes[tileInfo]
    if (target.tile.traversable) {
      robot.x = target.x
      robot.y = target.y
      robot.steps.push(robot.x, robot.y)
    }
    let newFacing
    const unexploredExits = unexplored()
    if (unexploredExits.length > 0) {
      // consider other directions
      newFacing = unexploredExits[0].direction
    } else {
      // turn right by default
      newFacing = directionList[(robot.facing.index + 1) % 4]
    }
    // report('Turning from ', robot.facing, 'to', newFacing)
    robot.facing = newFacing

    if (robot.steps.length % 1000 === 0) {
      ouputPoints(`steps/output-${(robot.steps.length + '').padStart(5, '0')}.txt`, hallways, robot)
    }
  }

  function inputSignal (inputs) {
    // report('Try and move from', robot.x, ',', robot.y, 'to', robot.facing)
    inputs.push(robot.facing.input)
  }

  await compute({ instructions, outputSignal, inputSignal })

  const solution = 'UNSOLVED'
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
