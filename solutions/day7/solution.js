const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)
const compute = require('./intcode')

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForExamples()
  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForExamples () {
  const input = (await read(fromHere('examples.txt'), 'utf8')).trim()
  const lines = input.split('\n')
  const tests = lines.map(line => {
    let [expected, phaseSettings, instructions] = line.split('::')
    expected = Number.parseInt(expected)
    phaseSettings = phaseSettings.split(',').map(n => Number.parseInt(n))
    return {
      expected,
      phaseSettings,
      instructions
    }
  })

  tests.forEach((test, index) => {
    const phases = [test.phaseSettings.concat([])]
    const { maxSignal } = computeMaxSignal(test.instructions, phases)
    const passOrFail = test.expected === maxSignal ? '✔' : '❌'
    report('Test', index, 'Expected', test.expected, 'using phase setting', test.phaseSettings, 'Result:', maxSignal, passOrFail, ' Instructions:', test.instructions)
  })
}

function computeMaxSignal (instructions, phases) {
  let maxSignal = 0
  let maxPhaseSettings = []
  while (phases.length > 0) {
    let signal = 0
    const phaseSettings = phases.pop()
    const currentSettings = phaseSettings.concat([])
    while (phaseSettings.length) {
      const phaseSetting = phaseSettings.shift()
      const amplification = compute(instructions, [phaseSetting, signal])
      signal = amplification.outputs[0]
    }
    if (signal > maxSignal) {
      report(currentSettings, 'New max found', signal, '>', maxSignal)
      maxPhaseSettings = currentSettings
      maxSignal = signal
    }
  }

  return { maxSignal, phaseSettings: maxPhaseSettings }
}

function calculatePhaseSettings () {
  const totalCombinations = Math.pow(5, 5)
  const phases = []
  while (phases.length < totalCombinations) {
    const phaseSettings = phases.length.toString(5).split('').map(n => Number.parseInt(n))
    while (phaseSettings.length < 5) {
      phaseSettings.unshift(0)
    }
    phases.push(phaseSettings)
  }

  function validPhaseSettings (settings) {
    const set = new Set(settings)
    return set.size === 5
  }

  return phases.filter(validPhaseSettings)
}

async function solveForFirstStar (instructions) {
  const phases = calculatePhaseSettings()

  report('Phase combination count', phases.length)

  const { maxSignal, phaseSettings } = computeMaxSignal(instructions, phases)

  const incorrectAnswer = 14955788
  const passOrFail = incorrectAnswer !== maxSignal ? '?' : '❌'
  report('Solution 1', 'Expected', '(unknown)', 'used phase setting', phaseSettings, 'Result:', maxSignal, passOrFail, ' Instructions:', instructions)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
