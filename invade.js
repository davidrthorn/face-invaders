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
  ],
  player: [
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1],
  ],
  bullet: [
    [1]
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
      let arenaPos = arena[y + piece.offset.y][x + piece.offset.x]
      if (value !== 0) {
        arena[y + piece.offset.y][x + piece.offset.x] = piece.matrix[y][x] * piece.type
      }
    })
  })
}



// Collision logic

function handleCollision (piece, axis, target = 1) {
  if (piece.type === 1) return

  if (axis === "x") {
    if (piece.direction.x < 0) {
      var side = "left"
    } else {
      var side = "right"
    }
  } else {
    if (piece.direction.y < 0) {
      var side = "bottom"
    } else {
      var side = "top"
    }
  }

  if (piece.type === 2) {
    piece.destroy = true
  }

  if (piece.type === 3) {
    if (side === "bottom") {
      // Game Over
    } else if (side === "left" || side === "right") {
      piece.direction.x = piece.direction.x * -1
    }
  }
}


function collides (piece) {
  let [m, o] = [piece.matrix, piece.offset]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (!arena[o.y + y]) {
        handleCollision(piece, 'y', target)
        return true
      }
      if (arena[o.y + y][o.x + x] !== 0) {
        handleCollision(piece, 'x', target)
        return true
      }
    }
  }
  return false
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
  let offset = piece.offset[axis]
  piece.offset[axis] += amount
  if (collides(piece)) {
    piece.offset[axis] = offset
  }
}

function shoot(piece) {
  if (!gunEnabled) return
  let x = piece.offset.x + 2
  let y = piece.offset.y
  let bullet = {
    type: 2,
    destroy: false,
    matrix: shapes.bullet,
    offset: {x: x, y: y},
    direction: {x: 0, y: -1},
    velocity: 1
  }

  nextElements.push(bullet)

  gunEnabled = false
  setTimeout(() => {
    gunEnabled = true
  }, 100)
}

function createAlien (name, offset) {
  nextElements.push({
    type: 3,
    destroy: false,
    matrix: shapes[name],
    offset: offset,
    direction: {x: 1, y: 0},
    velocity: 1
  })
}

let gunEnabled = true
let currentElements = []
let nextElements = []


function advanceElements () {
  let len = currentElements.length

  for (let i = 0; i < len; i++) {
    let e = currentElements[i]
    e.offset.y += e.direction.y * e.velocity
    e.offset.x += e.direction.x * e.velocity

    collides(e)

    if (!e.destroy) {
      nextElements.push(e)
    }
  }
}

function assembleArena() {
  addToArena(player)
  advanceElements()
  for (let i = 0; i < nextElements.length; i++) {
    addToArena(nextElements[i])
  }
}

// Key handling
function checkKeys() {
  if (keyStates[37]) {
    move(player, "x", -1)
  }
  if (keyStates[39]) {
    move(player, "x", 1)
  }
  if (keyStates[38]) {
    shoot(player)
  }
}

let keyStates = {
}

window.onkeydown = e => {
  keyStates[e.keyCode] = true
}
window.onkeyup = e => {
  keyStates[e.keyCode] = false
}

function updateCanvas() {
  context.fillStyle = "#000"
  context.fillRect(0, 0, canvas.width, canvas.height)

  arena = createArena(83, 117)
  checkKeys()
  assembleArena()
  drawMatrix(arena, {x: 0, y: 0})
  currentElements = nextElements
  nextElements = []
  requestAnimationFrame(updateCanvas)
}

let player = {
  type: 1,
  matrix: shapes.player,
  offset: {x: 40, y: 111},
  destroy: false
}

let arena = createArena(83, 117)
updateCanvas()
