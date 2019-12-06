const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  const orbitMap = await solveForFirstStar(input)
  await solveForSecondStar(orbitMap)
}

async function solveForFirstStar (input) {
  const separator = ')'
  const orbits = input.split('\n').map(n => n.trim().split(separator))
  const orbitMap = orbits.reduce((acc, orbit) => {
    const [a, b] = orbit
    acc[a] = acc[a] || {
      id: a
    }
    acc[b] = acc[b] || {
      id: b
    }
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

  return orbitMap
}

function findParents (node) {
  const parents = []
  let parent = node.parent
  while (parent) {
    parents.push(parent)
    parent = parent.parent
  }
  return parents
}

async function solveForSecondStar (orbitMap) {
  const YOU = orbitMap.YOU
  const SAN = orbitMap.SAN

  const youParents = findParents(YOU)
  const sanParents = findParents(SAN)
  const difference = youParents.filter(n => !sanParents.includes(n))

  report(youParents.map(n => n.id))
  report(sanParents.map(n => n.id))
  report(difference.map(n => n.id))

  const solution = difference.length + 1
  report('Solution 2:', solution)
}

run()
