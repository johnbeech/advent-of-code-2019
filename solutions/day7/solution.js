const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)
const compute = require('./intcode')

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForExamples()
  await solveForFirstStar(input)

  const example = '3,26,1001,26,-4,26,3,27,1002,27,2,27,1,27,26,27,4,27,1001,28,-1,28,1005,28,6,99,0,0,5'
  await solveForSecondStar(example, [[9, 8, 7, 6, 5]])
}

async function solveForExamples () {
  const input = (await read(fromHere('examples.txt'), 'utf8')).trim()
  report('Read example input:', input)
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

  report('Example tests', tests)

  await Promise.all(tests.map((test, index) => {
    return async () => {
      const phases = [test.phaseSettings.concat([])]
      const { maxSignal } = await computeMaxSignal(test.instructions, phases)
      const passOrFail = test.expected === maxSignal ? '✔' : '❌'
      report('Test', index, 'Expected', test.expected, 'using phase setting', test.phaseSettings, 'Result:', maxSignal, passOrFail, ' Instructions:', test.instructions)
    }
  }))

  report('Solved for examples')
}

async function computeMaxSignal (instructions, phases) {
  let maxSignal = 0
  let maxPhaseSettings = []
  while (phases.length > 0) {
    let signal = 0
    const phaseSettings = phases.pop()
    const currentSettings = phaseSettings.concat([])
    while (phaseSettings.length) {
      const phaseSetting = phaseSettings.shift()
      const amplification = await compute(instructions, [phaseSetting, signal])
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

function calculatePhaseSettings (offset = 0) {
  const totalCombinations = Math.pow(5, 5)
  const phases = []
  while (phases.length < totalCombinations) {
    const phaseSettings = phases.length.toString(5).split('').map(n => Number.parseInt(n) + offset)
    while (phaseSettings.length < 5) {
      phaseSettings.unshift(offset)
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

  const { maxSignal, phaseSettings } = await computeMaxSignal(instructions, phases)

  const incorrectAnswer = 14955788
  const passOrFail = incorrectAnswer !== maxSignal ? '?' : '❌'
  report('Solution 1', 'Expected', '(unknown)', 'used phase setting', phaseSettings, 'Result:', maxSignal, passOrFail)
}

async function computeMaxFeedbackSignal (instructions, phases) {
  let maxSignal = 0
  let maxPhaseSettings = []

  const a = {
    phase: phases[0],
    memory: instructions,
    outputs: []
  }
  const b = {
    phase: phases[1],
    memory: instructions,
    outputs: []
  }
  const c = {
    phase: phases[2],
    memory: instructions,
    outputs: []
  }
  const d = {
    phase: phases[3],
    memory: instructions,
    outputs: []
  }
  const e = {
    phase: phases[4],
    memory: instructions,
    outputs: []
  }

  a.inputs = e.outputs
  b.inputs = a.outputs
  c.inputs = b.outputs
  d.inputs = c.outputs
  e.inputs = d.outputs

  e.outputs.push(a.phase, 0)
  a.outputs.push(b.phase)
  b.outputs.push(c.phase)
  c.outputs.push(d.phase)
  d.outputs.push(e.phase)

  const amplifiers = [
    compute(instructions, a.inputs),
    compute(instructions, b.inputs),
    compute(instructions, c.inputs),
    compute(instructions, d.inputs),
    compute(instructions, e.inputs, outputE)
  ]

  function outputE (signal) {
    report('Signal at E', signal)
    if (signal > maxSignal) {
      report(phases, 'New max found', signal, '>', maxSignal)
      maxSignal = signal
      maxPhaseSettings = phases
    }
  }

  await Promise.all(amplifiers)

  return { maxSignal, phaseSettings: maxPhaseSettings }
}

async function solveForSecondStar (instructions, phases) {
  phases = phases || calculatePhaseSettings(5)
  report('Phase combination count', phases.length)

  const { maxSignal, phaseSettings } = await computeMaxFeedbackSignal(instructions, phases)
  report('Solution 1', 'used phase setting', phaseSettings, 'Result:', maxSignal)

  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
