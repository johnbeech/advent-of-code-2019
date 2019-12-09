const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

const compute = require('./intcode')

async function run () {
  await solveForTests()

  const input = (await read(fromHere('input.txt'), 'utf8')).trim()
  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForTests () {
  const example = (await read(fromHere('example.txt'), 'utf8')).trim()
  const tests = example.split('\n').map(async line => {
    const [code, expected] = line.split(':')
    const result = await compute(code, [])
    report('Expected', expected.split(',').map(n => Number.parseInt(n)), 'Actual', result.outputs)
  })
  await Promise.all(tests)
}

async function solveForFirstStar (input) {
  const boost = await compute(input, [1])

  const solution = boost.outputs
  report(boost)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
