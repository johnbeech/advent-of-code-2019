const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

function parseOrbits (input) {
  const matcher = /<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/
  return input.split('\n')
    .map(n => n.trim())
    .map(n => {
      const [, values] = n.match(matcher).map(n => Number.parseInt(n))
      const [x, y, z] = values
      return { x, y, z }
    })
}

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const orbits = parseOrbits(input)

  const solution = 'UNSOLVED'
  report('Input:', orbits)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
