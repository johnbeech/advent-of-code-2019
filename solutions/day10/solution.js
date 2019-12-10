const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()
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
    while (positions.length > 0) {
      const x = width - positions.length
      const value = positions.shift()
      if (value === '#') {
        const asteroid = {}
        asteroid.x = x
        asteroid.y = y
        asteroids.push(asteroid)
      }
    }
  }
  return asteroids
}

function mapAsteroidsFrom (asteroids, start) {
  const locations = [].concat(asteroids).filter(n => !(n.x === start.x && n.y === start.y))
  const vectors = locations.map(location => {
    const x = location.x
    const y = location.y
    const dx = location.x - start.x
    const dy = location.y - start.y
    const d = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    const v = dx / dy
    const vx = dx > 0 ? 1 : -1
    const vy = dy > 0 ? 1 : -1
    const vector = { x, y, dx, dy, d, v, vx, vy }
    return vector
  })

  const visibleAsteroids = new Set(vectors.filter(start => {
    const searchSpace = [].concat(vectors)
      .filter(n => n.vx === start.vx && n.vy === start.vy && n.v === start.v)
      .filter(n => !(n.x === start.x && n.y === start.y))
      .sort((a, b) => {
        return b.d - a.d
      })
    report('Start', start.x, start.y, ':', JSON.stringify(searchSpace))
    return searchSpace[0]
  }))

  start.vectors = vectors
  start.visibleAsteroids = Array.from(visibleAsteroids)

  const dimensions = {
    left: Math.min(...start.visibleAsteroids.map(n => n.x)),
    right: Math.max(...start.visibleAsteroids.map(n => n.x)),
    top: Math.min(...start.visibleAsteroids.map(n => n.y)),
    bottom: Math.max(...start.visibleAsteroids.map(n => n.y))
  }
  report('Dimensions:', dimensions)
  const index = {}
  asteroids.map((a) => {
    index[`${a.x},${a.y}`] = a
  })
  start.visibleAsteroids.map((a) => {
    index[`${a.x},${a.y}`] = a
  })
  index[`${start.x},${start.y}`] = start
  const map = []
  for (let j = dimensions.top; j < dimensions.bottom; j++) {
    const line = []
    for (let i = dimensions.left; i < dimensions.right; i++) {
      const asteroid = index[`${i},${j}`] || false
      let symbol = asteroid ? 'x' : '.'
      if (asteroid === start) { symbol = 'R' }
      if (start.visibleAsteroids.includes(asteroid)) { symbol = 'o' }
      line.push(symbol)
    }
    map.push(line)
  }
  report(start.visibleAsteroids)
  console.log(map.map(n => n.join('')).join('\n'))

  return start
}

async function solveForFirstStar (input) {
  const asteroids = parseAsteroidMap(input)
  // const research = asteroids.map(position => mapAsteroidsFrom(asteroids, position))

  const research = [mapAsteroidsFrom(asteroids, asteroids.filter(n => n.x === 11 && n.y === 13)[0])]

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
