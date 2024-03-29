const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()
  const { asteroids, visibleAsteroids, researchStation } = await solveForFirstStar(input)
  await solveForSecondStar({ asteroids, visibleAsteroids, researchStation })
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
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    const vx = dx > 0 ? 1 : -1
    const vy = dy > 0 ? 1 : -1
    const vector = { x, y, dx, dy, d, angle, vx, vy }
    return vector
  })

  const angles = Array.from(new Set(vectors.map(v => v.angle)))

  const visibleAsteroids = angles.map(angle => {
    const searchSpace = [].concat(vectors)
      .filter(n => n.angle === angle)
      .sort((a, b) => {
        return a.d - b.d
      })
    return searchSpace[0]
  })

  start.vectors = vectors
  start.visibleAsteroids = Array.from(visibleAsteroids)

  return start
}

async function outputAsteroidMap (filename, asteroids, visibleAsteroids, start) {
  const dimensions = {
    left: Math.min(...asteroids.map(n => n.x)),
    right: Math.max(...asteroids.map(n => n.x)),
    top: Math.min(...asteroids.map(n => n.y)),
    bottom: Math.max(...asteroids.map(n => n.y))
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
      if (asteroid.destroyed) { symbol = ' ' }
      line.push(symbol)
    }
    map.push(line)
  }
  const output = map.map(n => n.join(' ')).join('\n')
  console.log(output)
  return write(fromHere(filename), output, 'utf8')
}

async function solveForFirstStar (input) {
  const asteroids = parseAsteroidMap(input)
  const research = asteroids.map(position => mapAsteroidsFrom(asteroids, position))

  const bestLocation = research.sort((a, b) => {
    return b.visibleAsteroids.length - a.visibleAsteroids.length
  })[0]

  await outputAsteroidMap('output1.txt', asteroids, bestLocation.visibleAsteroids, bestLocation)

  const solution = bestLocation.visibleAsteroids.length
  report('Solution 1:', solution, { x: bestLocation.x, y: bestLocation.y })

  return {
    asteroids,
    visibleAsteroids: bestLocation.visibleAsteroids,
    researchStation: bestLocation
  }
}

async function solveForSecondStar ({ asteroids, visibleAsteroids, researchStation }) {
  const { vectors } = researchStation
  const angles = Array.from(new Set(
    vectors.filter(n => n !== researchStation)
      .map(v => v.angle))
  ).sort((a, b) => {
    const aa = (a + 360 + 90) % 360
    const ab = (b + 360 + 90) % 360
    return aa - ab
  })

  const destroyedAsteroids = []
  while (destroyedAsteroids.length < 200) {
    const i = destroyedAsteroids.length
    const angle = angles[i % angles.length]
    const searchSpace = [].concat(vectors)
      .filter(n => n.angle === angle)
      .filter(n => !n.destroyed)
      .sort((a, b) => {
        return a.d - b.d
      })

    const nearestAsteroid = searchSpace[0]
    if (nearestAsteroid) {
      report('Found asteroid at', angle, { x: nearestAsteroid.x, y: nearestAsteroid.y })
      nearestAsteroid.destroyed = true
      destroyedAsteroids.push(nearestAsteroid)
    }
  }

  await outputAsteroidMap('output2.txt', asteroids, researchStation.visibleAsteroids, researchStation)

  const asteroid = destroyedAsteroids[200 - 1]
  const solution = (asteroid.x * 100) + asteroid.y
  report('Solution 2:', solution, asteroid)
}

run()
