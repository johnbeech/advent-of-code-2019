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

function saveInputToPosition ({ id, memory, position, inputs, outputs }) {
  const parameter1 = memory[position + 1]
  const input = inputs.shift()
  if (input !== undefined) {
    // report(id, 'Read input', input, inputs, outputs)
    memory[parameter1] = input
    return position + 2
  } else {
    // report(id, 'Waiting for input', inputs, outputs)
    return position
  }
}

function outputValue ({ id, memory, position, inputs, outputs, mode1, outputSignal }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  outputs.push(parameter1)
  // report(id, 'Output value', parameter1, inputs, outputs)
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

function endProgram () {
  return -1
}

function executeProgram ({ id, memory, position, inputs, outputs, outputSignal }) {
  const instruction = (memory[position] + '').split('')
  const opcode = Number.parseInt([instruction.pop(), instruction.pop()].reverse().join(''))
  const mode1 = Number.parseInt(instruction.pop() || 0)
  const mode2 = Number.parseInt(instruction.pop() || 0)
  const mode3 = Number.parseInt(instruction.pop() || 0)

  try {
    return opcodes[opcode]({ id, memory, position, inputs, outputs, mode1, mode2, mode3, outputSignal })
  } catch (ex) {
    report('Unable to execute instruction at', position, `(Opcode: ${opcode}, Modes: 1:${mode1}, 2:${mode2}, 3:${mode3})`, `[${memory[position]}]`, 'memory dump:', memory.join(' '))
    report(ex.message)
    return -1
  }
}

async function compute (instructions, inputs = [], outputs = [], outputSignal, id) {
  const memory = instructions.split(',').map(n => Number.parseInt(n))
  outputSignal = outputSignal || function () {}

  let programComplete
  const promise = new Promise((resolve, reject) => {
    programComplete = resolve
  })

  function stepProgram () {
    do {
      position = newPosition
      newPosition = executeProgram({ id, memory, position, inputs, outputs, outputSignal })
      if (newPosition === position) {
        setTimeout(stepProgram, 0)
      } else if (newPosition === -1) {
        programComplete({
          memory,
          inputs,
          outputs,
          position
        })
        return
      }
    } while (newPosition !== position)
  }

  let position = 0; let newPosition = 0
  stepProgram()

  return promise
}

module.exports = compute
