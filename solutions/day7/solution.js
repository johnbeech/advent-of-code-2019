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

  await Promise.all(tests.map(async (test, index) => {
    const phases = [test.phaseSettings.concat([])]
    const { maxSignal } = await computeMaxSignal(test.instructions, phases)
    const passOrFail = test.expected === maxSignal ? '✔' : '❌'
    report('Test', index, 'Expected', test.expected, 'using phase setting', test.phaseSettings, 'Result:', maxSignal, passOrFail, ' Instructions:', test.instructions)
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

  report('Solution 1', 'used phase setting', phaseSettings, 'Answer:', maxSignal)
}

async function computeMaxFeedbackSignal (instructions, phases) {
  let maxSignal = 0
  let maxPhaseSettings = []
  let phaseSettings

  function outputE (signal) {
    if (signal > maxSignal) {
      report(phaseSettings, 'New max found', signal, '>', maxSignal)
      maxSignal = signal
      maxPhaseSettings = phaseSettings
    }
  }

  while (phases.length > 0) {
    phaseSettings = phases.pop()

    const a = {
      phase: phaseSettings[0],
      memory: instructions,
      outputs: []
    }
    const b = {
      phase: phaseSettings[1],
      memory: instructions,
      outputs: []
    }
    const c = {
      phase: phaseSettings[2],
      memory: instructions,
      outputs: []
    }
    const d = {
      phase: phaseSettings[3],
      memory: instructions,
      outputs: []
    }
    const e = {
      phase: phaseSettings[4],
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
      compute(instructions, a.inputs, a.outputs),
      compute(instructions, b.inputs, b.outputs),
      compute(instructions, c.inputs, c.outputs),
      compute(instructions, d.inputs, d.outputs),
      compute(instructions, e.inputs, e.outputs, outputE, 'E')
    ]

    await Promise.all(amplifiers)
  }

  return { maxSignal, phaseSettings: maxPhaseSettings }
}

async function solveForSecondStar (instructions, phases) {
  phases = phases || calculatePhaseSettings(5)
  report('Phase combination count', phases.length)

  const { maxSignal, phaseSettings } = await computeMaxFeedbackSignal(instructions, phases)
  report('Solution 2', 'used phase setting', phaseSettings, 'Answer:', maxSignal)
}

run()
