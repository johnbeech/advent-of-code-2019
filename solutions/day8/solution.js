const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function decodeImage (pixels, dimensions) {
  const layers = []
  const r = [].concat(pixels).reverse()

  const pixelsPerLayer = dimensions.width * dimensions.height

  while (r.length > 0) {
    const pixel = r.pop()
    const layerNumber = Math.ceil((pixels.length - r.length) / pixelsPerLayer)
    const layer = layers[layerNumber] || { pixels: [], zeros: 0, ones: 0, twos: 0 }
    layer.pixels.push(pixel)
    layer.zeros = pixel === '0' ? layer.zeros + 1 : layer.zeros
    layer.ones = pixel === '1' ? layer.ones + 1 : layer.ones
    layer.twos = pixel === '2' ? layer.twos + 1 : layer.twos

    layers[layerNumber] = layer
  }

  return { layers }
}

async function solveForFirstStar (input) {
  const pixels = input.split('')
  const dimensions = {
    width: 25,
    height: 6
  }

  dimensions.layers = pixels.length / dimensions.width / dimensions.height

  const image = decodeImage(pixels, dimensions)

  const zerolestLayer = image.layers.sort((a, b) => {
    return a.zeros - b.zeros
  })[0]

  report('Dimensions', dimensions)
  report('Image', image)
  report('Zerolest Layer', zerolestLayer)

  const solution = zerolestLayer.ones * zerolestLayer.twos
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
