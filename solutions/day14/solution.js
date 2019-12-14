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

  function calculateRequirements (factory, process, amount = 1) {
    const stack = []
    report('Consume', process.inputs.map(n => `${n.amount * amount} ${n.type}`).join(', '), 'to produce', amount * process.output.amount, process.output.type)
    process.inputs.forEach(input => {
      if (input.type === 'ORE') {
        stack.push({
          type: input.type,
          amount: input.amount * amount
        })
      } else {
        const tree = calculateRequirements(factory, factory.outputMap[input.type], input.amount * amount)
        tree.forEach(t => {
          stack.push(t)
        })
      }
    })
    return stack
  }

  const requirements = calculateRequirements(factory, factory.outputMap.FUEL, 1)
  report('Requirements', requirements)

  const solution = 'UNSOLVED'
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
