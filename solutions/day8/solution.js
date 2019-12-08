const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  const image = await solveForFirstStar(input)
  await solveForSecondStar(image)
  await write(fromHere('./visualisation/image.json'), JSON.stringify(image), 'utf8')
}

function decodeImage (pixels, dimensions) {
  const layers = []
  const render = []
  const r = [].concat(pixels).reverse()

  const pixelsPerLayer = dimensions.width * dimensions.height

  while (r.length > 0) {
    const pixel = Number.parseInt(r.pop())
    const layerNumber = Math.ceil((pixels.length - r.length) / pixelsPerLayer)
    const layer = layers[layerNumber] || { pixels: [], zeros: 0, ones: 0, twos: 0 }
    layer.pixels.push(pixel)
    layer.zeros = pixel === 0 ? layer.zeros + 1 : layer.zeros
    layer.ones = pixel === 1 ? layer.ones + 1 : layer.ones
    layer.twos = pixel === 2 ? layer.twos + 1 : layer.twos

    layers[layerNumber] = layer
  }

  while (render.length < pixelsPerLayer) {
    const pixelOffset = (pixelsPerLayer - render.length - 1)
    const renderedPixel = layers.reduce((acc, layer) => {
      const pixel = layer.pixels[pixelOffset]
      if (acc < 2) {
        return acc
      }
      return pixel
    }, 2)
    render.push(renderedPixel)
  }

  return { layers, render, dimensions }
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

  return image
}

async function solveForSecondStar (image) {
  const r = [].concat(image.render)
  const lines = []
  let line = []
  while (r.length > 0) {
    if (r.length % image.dimensions.width === 0) {
      lines.push(line)
      line = []
    }
    line.push(r.pop() === 1 ? '▮' : ' ')
  }
  lines.push(line)

  report('Pixels', image.render)
  const solution = lines.map(line => line.join('')).join('\n')
  report('Solution 2:', solution)
}

run()
