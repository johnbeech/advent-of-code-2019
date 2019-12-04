const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function testValidPassword (passwordValue) {
  let passwordContainsDouble = false
  let passwordDigitsNeverDecrease = true

  const sequence = (passwordValue + '').split('').map(n => Number.parseInt(n))
  let previousNumber
  sequence.forEach(number => {
    if (previousNumber !== undefined) {
      if (previousNumber === number) {
        passwordContainsDouble = true
      }
      if (previousNumber > number) {
        passwordDigitsNeverDecrease = false
      }
    }
    previousNumber = number
  })

  return passwordContainsDouble && passwordDigitsNeverDecrease
}

async function solveForFirstStar (input) {
  const [, startInput, endInput] = input.match(/(\d{6})-(\d{6})/)
  report('Start Input', startInput, 'End Input', endInput)

  let password = startInput
  const validPaswords = []
  while (password <= endInput) {
    if (testValidPassword(password)) {
      validPaswords.push(password)
    }
    // do something
    password++
  }

  const solution = validPaswords.length
  report('Valid Passwords', validPaswords)
  report('Input:', input)
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
