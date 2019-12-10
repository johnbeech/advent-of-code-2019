const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()
  await solveForFirstStar(input)

  await solveForFirstStar((await read(fromHere('example.txt'), 'utf8')).trim())

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
      const x = width - positions.length
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

function mapAsteroidsFrom (asteroids, start) {
  const locations = [].concat(asteroids).filter(n => n.x !== start.x && n.y !== start.y)
  const vectors = []

  locations.forEach(location => {
    const x = location.x
    const y = location.y
    const dx = location.x - start.x
    const dy = location.y - start.y
    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    const v = dx / dy
    const vx = dx > 0 ? 1 : -1
    const vy = dy > 0 ? 1 : -1
    vectors.push({ x, y, dx, dy, d, v, vx, vy })
  })

  const visibleAsteroids = new Set(vectors.filter(start => {
    const searchSpace = [].concat(vectors)
      .filter(n => n.v === start.v)
      .filter(n => n.x !== start.x && n.y !== start.y)
      .sort((a, b) => {
        return a.d - b.d
      })
    return searchSpace[0]
  }))

  start.vectors = vectors
  start.visibleAsteroids = Array.from(visibleAsteroids)
  return start
}

async function solveForFirstStar (input) {
  const asteroids = parseAsteroidMap(input)
  const research = asteroids.map(position => mapAsteroidsFrom(asteroids, position))

  const bestLocation = research.sort((a, b) => {
    return b.visibleAsteroids.length - a.visibleAsteroids.length
  })[0]

  const solution = bestLocation.visibleAsteroids.length
  report('Solution 1:', solution, { x: bestLocation.x, y: bestLocation.y })
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
