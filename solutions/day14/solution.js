const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseQuantityPair (input) {
  const [amount, type] = input.trim().split(' ')
  return {
    amount: Number.parseInt(amount),
    type
  }
}

function buildNanoFactory (setup) {
  const lines = setup.split('\n').map(n => n.trim())
  const processes = lines.map(line => {
    const [left, right] = line.split(' => ')
    const inputs = left.split(', ').map(parseQuantityPair)
    const output = parseQuantityPair(right)
    return {
      inputs,
      output,
      process
    }
  })

  const outputMap = processes.reduce((acc, item) => {
    acc[item.output.type] = item
    return acc
  }, {})

  const inputMap = processes.reduce((acc, item) => {
    item.inputs.forEach(input => {
      input.parent = item
      acc[input.type] = acc[input.type] || []
      acc[input.type].push(input)
    })
    return acc
  }, {})

  const factory = {
    processes,
    outputMap,
    inputMap
  }
  return factory
}

async function solveForFirstStar (input) {
  const factory = buildNanoFactory(input)

  report('Factory', factory)

  const solution = 'UNSOLVED'
  report('Input:', input)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
