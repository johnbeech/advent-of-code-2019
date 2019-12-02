const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function calculateFuelRequiredForModule (n) {
  return Math.floor(n / 3) - 2
}

async function solveForFirstStar (input) {
  const lines = input.split('\n').map(n => Number.parseInt(n)).map(n => n)
  const fuel = lines.map(calculateFuelRequiredForModule)
  const totalFuel = fuel.reduce((acc, item) => {
    return acc + item
  }, 0)

  const solution = totalFuel
  report('Input:', input)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
