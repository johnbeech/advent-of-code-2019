const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const separator = ')'
  const orbits = input.split('\n').map(n => n.trim().split(separator))
  const orbitMap = orbits.reduce((acc, orbit) => {
    const [a, b] = orbit
    acc[a] = acc[a] || {}
    acc[b] = acc[b] || {}
    acc[a][b] = acc[b]
    acc[b].parent = acc[a]
    return acc
  }, {})

  const orbitCount = Object.entries(orbitMap).reduce((acc, orbit) => {
    const [, value] = orbit
    let i = 0; let parent = value.parent
    while (parent) {
      i++
      parent = parent.parent
    }
    return acc + i
  }, 0)

  const solution = orbitCount
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
