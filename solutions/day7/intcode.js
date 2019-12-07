const path = require('path')
const { position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()} / intcode]`, ...messages)

const IMMEDIATE = 1

const opcodes = {
  1: addValues,
  2: multiplyValues,
  3: saveInputToPosition,
  4: outputValue,
  5: jumpIfTrue,
  6: jumpIfFalse,
  7: lessThan,
  8: equals,
  99: endProgram
}

function getParameter ({ memory, mode, parameter }) {
  return mode === IMMEDIATE ? parameter : memory[parameter]
}

function addValues ({ memory, position, mode1, mode2 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  memory[parameter3] = parameter1 + parameter2
  return position + 4
}

function multiplyValues ({ memory, position, mode1, mode2 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  memory[parameter3] = parameter1 * parameter2
  return position + 4
}

function saveInputToPosition ({ memory, position, inputs }) {
  const parameter1 = memory[position + 1]
  memory[parameter1] = inputs.shift() || 0
  return position + 2
}

function outputValue ({ memory, position, outputs, mode1, outputSignal }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  outputs.push(parameter1)
  outputSignal(parameter1)
  return position + 2
}

function jumpIfTrue ({ memory, position, mode1, mode2 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  if (parameter1 !== 0) {
    return parameter2
  }
  return position + 3
}

function jumpIfFalse ({ memory, position, mode1, mode2 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  if (parameter1 === 0) {
    return parameter2
  }
  return position + 3
}

function lessThan ({ memory, position, mode1, mode2, mode3 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  if (parameter1 < parameter2) {
    memory[parameter3] = 1
  } else {
    memory[parameter3] = 0
  }
  return position + 4
}

function equals ({ memory, position, mode1, mode2 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  if (parameter1 === parameter2) {
    memory[parameter3] = 1
  } else {
    memory[parameter3] = 0
  }
  return position + 4
}

function endProgram ({ memory, position }) {
  return -1
}

function executeProgram ({ memory, position, inputs, outputs, callback }) {
  const instruction = (memory[position] + '').split('')
  const opcode = Number.parseInt([instruction.pop(), instruction.pop()].reverse().join(''))
  const mode1 = Number.parseInt(instruction.pop() || 0)
  const mode2 = Number.parseInt(instruction.pop() || 0)
  const mode3 = Number.parseInt(instruction.pop() || 0)

  try {
    return opcodes[opcode]({ memory, position, inputs, outputs, mode1, mode2, mode3 })
  } catch (ex) {
    report('Unable to execute instruction at', position, `(Opcode: ${opcode}, Modes: 1:${mode1}, 2:${mode2}, 3:${mode3})`, `[${memory[position]}]`, 'memory dump:', memory.join(' '))
    return -1
  }
}

async function compute (instructions, inputs = [], outputSignal) {
  const memory = instructions.split(',').map(n => Number.parseInt(n))
  const outputs = []
  outputSignal = outputSignal || function () {}
  // report('Computing', memory, inputs)

  let programComplete
  const promise = new Promise((resolve, reject) => {
    programComplete = resolve
  })

  let position = 0
  if (position !== -1) {
    setTimeout(() => {
      report('Execute program', position, inputs, outputs)
      position = executeProgram({ memory, position, inputs, outputs, outputSignal })
    }, 0)
  } else {
    report('Program complete', position, inputs, outputs)
    programComplete({
      memory,
      inputs,
      outputs
    })
  }

  return promise
}

module.exports = compute
