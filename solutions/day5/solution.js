const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const IMMEDIATE = 1

const opcodes = {
  1: addValues,
  2: multiplyValues,
  3: saveInputToPosition,
  4: outputValue,
  99: endProgram
}

function getParameter ({ memory, mode, parameter }) {
  return mode === IMMEDIATE ? parameter : memory[parameter]
}

function addValues ({ memory, position, mode1, mode2, mode3 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  memory[parameter3] = parameter1 + parameter2
  return position + 4
}

function multiplyValues ({ memory, position, mode1, mode2, mode3 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  const parameter2 = getParameter({ memory, mode: mode2, parameter: memory[position + 2] })
  const parameter3 = memory[position + 3]
  memory[parameter3] = parameter1 * parameter2
  return position + 4
}

function saveInputToPosition ({ memory, position, inputs, mode1, mode2, mode3 }) {
  const parameter1 = memory[position + 1]
  memory[parameter1] = inputs[0]
  return position + 2
}

function outputValue ({ memory, position, outputs, mode1, mode2, mode3 }) {
  const parameter1 = getParameter({ memory, mode: mode1, parameter: memory[position + 1] })
  outputs[0] = parameter1
  return position + 2
}

function endProgram ({ memory, position }) {
  // report('Reached the end of the program at position', position)
  return -1
}

function executeProgram ({ memory, position, inputs, outputs }) {
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

async function solveForFirstStar (input) {
  const memory = input.split(',').map(n => Number.parseInt(n))
  const inputs = { 0: 1 }
  const outputs = {}

  let position = 0
  do {
    position = executeProgram({ memory, position, inputs, outputs })
    console.log(memory.join(','))
  }
  while (position !== -1)

  const solution = outputs
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const memory = input.split(',').map(n => Number.parseInt(n))
  const solution = memory[0]
  report('Solution 2:', solution)
}

run()
