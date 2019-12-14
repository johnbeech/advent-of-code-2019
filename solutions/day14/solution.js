const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseQuantityPair (input) {
  const [amount, type] = input.trim().split(' ')
  return {
    amount: Number.parseInt(amount),
    type
  }
}

function buildNanoFactory (setup) {
  const lines = setup.split('\n').map(n => n.trim())
  const processes = lines.map(line => {
    const [left, right] = line.split(' => ')
    const inputs = left.split(', ').map(parseQuantityPair)
    const output = parseQuantityPair(right)
    return {
      inputs,
      output
    }
  })

  processes.push({
    inputs: [],
    output: {
      type: 'ORE',
      amount: 1
    }
  })

  const outputMap = processes.reduce((acc, item) => {
    acc[item.output.type] = item
    return acc
  }, {})

  const inputMap = processes.reduce((acc, item) => {
    item.inputs.forEach(input => {
      input.parent = item
      acc[input.type] = acc[input.type] || []
      acc[input.type].push(input)
    })
    return acc
  }, {})

  const factory = {
    processes,
    outputMap,
    inputMap
  }
  return factory
}

async function solveForFirstStar (input) {
  const factory = buildNanoFactory(input)

  function produce (factory, process, quantityRequired = 1, stack = {}) {
    const { inputs, output } = process
    const { type, amount } = output
    stack[type] = stack[type] || 0

    if (type === 'ORE') {
      report('Produce', quantityRequired, 'of', type, ':', JSON.stringify(stack))
      stack[type] = stack[type] + quantityRequired
      return
    } else {
      report('Producing', amount, 'of', type)
    }

    inputs.forEach(input => {
      stack[input.type] = stack[input.type] || 0
      while (stack[input.type] < input.amount * quantityRequired) {
        const supportedProcess = factory.outputMap[input.type]
        produce(factory, supportedProcess, input.amount, stack)
      }
    })

    inputs.forEach(input => {
      report('Consume', input.amount, 'of', input.type)
      stack[input.type] = stack[input.type] - input.amount
    })

    report('Produce', amount, 'of', type, ':', JSON.stringify(stack))
    stack[type] = stack[type] + amount

    return stack
  }

  const requirements = produce(factory, factory.outputMap.FUEL, 1)
  report('Requirements', requirements)

  const solution = 'UNSOLVED'
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
