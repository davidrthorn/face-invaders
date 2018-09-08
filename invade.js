const canvas = document.getElementById("invade")
const context = canvas.getContext("2d")

context.scale(6, 6)
context.fillStyle = "#000"
context.fillRect(0, 0, canvas.width, canvas.height)

const matrix = [
  [0, 0, 1, 0, 0],
  [0, 1, 1, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
]

function draw(piece) {
  drawMatrix(piece.matrix, piece.offset)
}

function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        context.fillStyle = "indianred"
        context.fillRect(offset.x + x, offset.y + y, 1, 1)
      }
    })
  })
}

function updateCanvas() {
  draw(alien)
  requestAnimationFrame(updateCanvas)
}

const alien = {
  offset: {x: 5, y: 5},
  matrix: matrix
}

updateCanvas()
