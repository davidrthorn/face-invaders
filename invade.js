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

function addToArena(element) {
  element.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      let arenaPos = arena[y + element.offset.y][x + element.offset.x]
      if (value !== 0) {
        arena[y + element.offset.y][x + element.offset.x] = element.matrix[y][x] * element.type
      }
    })
  })
}



// Collision logic

function handleCollision (element, axis, target = 1) {
  if (element.type === 1) return

  if (axis === "x") {
    if (element.direction.x < 0) {
      var side = "left"
    } else {
      var side = "right"
    }
  } else {
    if (element.direction.y < 0) {
      var side = "bottom"
    } else {
      var side = "top"
    }
  }

  if (element.type === 2) {
    element.destroy = true
  }

  if (element.type === 3) {
    if (target === 2) {
      element.health -= 1
      if (element.health < 1) {
        element.destroy = true
      }
    }
    if (side === "bottom") {
      // Game Over
    } else if (side === "left" || side === "right") {
      element.direction.x = element.direction.x * -1
    }
  }
}

function collides (element) {
  let [m, o] = [element.matrix, element.offset]
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (!arena[o.y + y]) {
        handleCollision(element, 'y')
        return true
      }
      if (arena[o.y + y][o.x + x] !== 0) {
        handleCollision(element, 'x', arena[o.y + y][o.x + x])
        return true
      }
    }
  }
  return false
}


function checkForBottomImpact (element) {
  // How?
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

function move(element, axis, amount) {
  let offset = element.offset[axis]
  element.offset[axis] += amount
  if (collides(element)) {
    element.offset[axis] = offset
  }
}

function shoot(element) {
  if (!gunEnabled) return
  let x = element.offset.x + 2
  let y = element.offset.y
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
    velocity: 0,
    health: 4
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
    if (e.type === 3) {
      checkForBottomImpact(e)
    }

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
