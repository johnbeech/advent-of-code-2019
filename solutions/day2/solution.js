const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const opcodes = {
  1: addValues,
  2: multiplyValues,
  99: endProgram
}

function addValues (memory, position) {
  const read1pos = memory[position + 1]
  const read2pos = memory[position + 2]
  const writepos = memory[position + 3]
  memory[writepos] = memory[read1pos] + memory[read2pos]
  return position + 4
}

function multiplyValues (memory, position) {
  const read1pos = memory[position + 1]
  const read2pos = memory[position + 2]
  const writepos = memory[position + 3]
  memory[writepos] = memory[read1pos] * memory[read2pos]
  return position + 4
}

function endProgram (memory, position) {
  report('Reached the end of the program at position', position)
  return -1
}

function executeProgram (memory, position) {
  const opcode = memory[position]
  try {
    return opcodes[opcode](memory, position)
  } catch (ex) {
    report('Unable to execute instruction at', position, `[${memory[position]}]`, 'memory dump:', memory.join(' '))
    return -1
  }
}

async function solveForFirstStar (input) {
  const memory = input.split(',').map(n => Number.parseInt(n))

  memory[1] = 12
  memory[2] = 2

  let position = 0
  do {
    position = executeProgram(memory, position)
    console.log(memory.join(','))
  }
  while (position !== -1)

  const solution = memory[0]
  report('Input:', input)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
