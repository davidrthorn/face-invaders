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
        arena[y + piece.offset.y][x + piece.offset.x] = piece.matrix[y][x]
      }
    })
  })
}

function collides (piece) {
  let [m, o] = [piece.matrix, piece.offset]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (arena[o.y + y][o.x + x] !== 0) {
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
    offset: {x: x, y: y}
  }

  activeBullets.push(bullet)
  gunEnabled = false
  setTimeout(() => {
    gunEnabled = true
  }, 100)
}

let gunEnabled = true
let activeBullets = []

function advanceBullets () {
  let len = activeBullets.length
  let deactivate = []
  for (let i = 0; i < len; i++) {
    let bullet = activeBullets[i]
    bullet.offset.y -= 1
    if (arena[bullet.offset.y] && arena[bullet.offset.y][bullet.offset.x] === 0) {
      drawBullet(bullet)
    } else {
      deactivate.push(i)
    }
  }
  for (let i = 0; i < deactivate.length; i++) {
    activeBullets.splice(i, 1)
  }
}


function drawBullet (bullet) {
  arena[bullet.offset.y][bullet.offset.x] = 1
}

// Key handling
function checkKeys() {
  if (keyStates[37]) {
    move(player, 'x', -1)
  }
  if (keyStates[39]) {
    move(player, 'x', 1)
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
  addToArena(player)
  advanceBullets()
  drawMatrix(arena, {x: 0, y: 0})
  requestAnimationFrame(updateCanvas)
}

let fighter = {
  matrix: shapes.fighter,
  offset: {x: 5, y: 10}
}

let player = {
  matrix: shapes.player,
  offset: {x: 40, y: 111}
}

let arena = createArena(83, 117)
updateCanvas()
