const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)
const compute = require('./intcode')

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (instructions) {
  const phaseSettings = '1,0,4,3,2'.split(',').map(n => Number.parseInt(n))

  let signal = 0
  while (phaseSettings.length) {
    const phaseSetting = phaseSettings.shift()
    const amplification = compute(instructions, [phaseSetting, signal])
    report('Phase setting', phaseSetting, 'amplifies', signal, 'to', amplification.outputs[0])
    signal = amplification.outputs[0]
  }

  const solution = signal
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
