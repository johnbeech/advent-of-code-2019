const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)
const compute = require('./intcode')

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (instructions) {
  const totalCombinations = Math.pow(5, 5)
  const phases = []
  while (phases.length < totalCombinations) {
    const phaseSettings = phases.length.toString(5).split('').map(n => Number.parseInt(n))
    while (phaseSettings.length < 5) {
      phaseSettings.unshift(0)
    }
    phases.push(phaseSettings)
  }

  report('Phase combination count', phases.length)

  let maxSignal = 0
  while (phases.length > 0) {
    let signal = 0
    const phaseSettings = phases.pop()
    const currentSettings = phaseSettings.join(', ')
    while (phaseSettings.length) {
      const phaseSetting = phaseSettings.shift()
      const amplification = compute(instructions, [phaseSetting, signal])
      // report('Phase setting', phaseSetting, 'amplifies', signal, 'to', amplification.outputs[0])
      signal = amplification.outputs[0]
    }
    if (signal > maxSignal) {
      report(currentSettings, 'New max found', signal, '>', maxSignal)
    }
    maxSignal = Math.max(maxSignal, signal)
  }

  const solution = maxSignal
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
