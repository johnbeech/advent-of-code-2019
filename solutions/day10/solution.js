const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseAsteroidMap (input) {
  const asteroids = []
  const lines = input.split('\n')
  const height = lines.length
  while (lines.length > 0) {
    const y = height - lines.length
    const line = lines.shift()
    const width = line.length
    const positions = line.trim().split('')
    const asteroid = {}
    while (positions.length > 0) {
      const x = width - line.length
      const value = positions.shift()
      if (value === '#') {
        asteroid.x = x
        asteroid.y = y
        asteroids.push(asteroid)
      }
    }
  }
  return asteroids
}

async function solveForFirstStar (input) {
  const asteroids = parseAsteroidMap(input)

  const solution = 'UNSOLVED'
  report('Asteroids:', asteroids)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
