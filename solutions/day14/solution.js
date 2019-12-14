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

  function produce (factory, process, quantityRequired = 1, stack = {}, total = {}) {
    const { inputs, output } = process
    const { type, amount } = output
    stack[type] = stack[type] || 0
    total[type] = total[type] || 0

    if (type === 'ORE') {
      stack[type] = stack[type] + quantityRequired
      total[type] = total[type] + quantityRequired
      report('Produced', quantityRequired, 'of', type, ':', JSON.stringify(stack))
    } else {
      report('Producing', amount, 'of', type)

      const usage = inputs.reduce((acc, input) => {
        acc[input.type] = input.amount
        return acc
      }, {})

      inputs.forEach(input => {
        stack[input.type] = stack[input.type] || 0
        report('Expecting', usage[input.type], 'of', input.type)
        while (usage[input.type] > 0) {
          let amountAvailable = Math.min(stack[input.type], usage[input.type])
          if (amountAvailable === 0) {
            const supportedProcess = factory.outputMap[input.type]
            produce(factory, supportedProcess, 1, stack, total)
          }
          amountAvailable = Math.min(stack[input.type], usage[input.type])
          usage[input.type] = usage[input.type] - amountAvailable
          stack[input.type] = stack[input.type] - amountAvailable
          report('Consumed ', amountAvailable, 'of', input.type, JSON.stringify(stack), JSON.stringify(usage))
        }
      })

      stack[type] = stack[type] + amount
      total[type] = total[type] + amount
      report('Produced', amount, 'of', type, ':', JSON.stringify(stack))
    }

    return {
      stack,
      total
    }
  }

  const { stack, total } = produce(factory, factory.outputMap.FUEL, 1)
  report('Stack', stack)
  report('Totals', total)

  const solution = total.ORE
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
