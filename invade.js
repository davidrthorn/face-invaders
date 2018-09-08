const canvas = document.getElementById("invade")
const context = canvas.getContext("2d")

context.scale(6, 6)


const shapes = {
  fighter: [
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ],
  cruiser: [
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
  ]
}


function createArena (w, h) {
  let arena = []
  for (let i = 0; i < h; ++i) {
    let row = []
    for (let j = 0; j < w; ++j) {
      row.push(0)
    }
    arena.push(row)
  }
  return arena
}

function addToArena(piece) {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + piece.offset.y][x + piece.offset.x] = piece.matrix[y][x]
      }
    })
  })
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

function move(piece, axis, amount) {
  piece.offset[axis] += amount
}

window.keydown = e => {
  switch (e.keyCode) {
    case 40:
      fighter.offset.y++
      break
    case 38:
      fighter.offset.y--
      break
    case 39:
      fighter.offset.x++
      break
    case 37:
      fighter.offset.x--
      break
  }
}

function updateCanvas() {
  context.fillStyle = "#000"
  context.fillRect(0, 0, canvas.width, canvas.height)

  arena = createArena(84, 117)
  addToArena(fighter)
  drawMatrix(arena, {x: 0, y: 0})
  requestAnimationFrame(updateCanvas)
}

let fighter = {
  matrix: shapes.fighter,
  offset: {x: 5, y: 10}
}

let arena = createArena(84, 117)
updateCanvas()
