/*
 *
 * 1. Randomised movement
 * 2. Reaction to bullet
 *
 *
*/
const canvas = document.getElementById("invade")
const context = canvas.getContext("2d")

context.scale(6, 6)
const arenaSize = {w:83, h:117}


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

function addToArena(e) {
  [m, o] = [e.matrix, e.offset]
  m.forEach((row, y) => {
    row.forEach((value, x) => {
      let target = arena[y + o.y][x + o.x] 
      if (e.type === 3 && target === 2) {
        harmBody(e)
        destroyBullet(y + o.y, x + o.x)
      }
      if (value !== 0) {
        arena[y + o.y][x + o.x] = m[y][x] * e.type
      }
    })
  })
}

function harmBody(body) {
    body.health -= 1
    body.stateCounter = 24
}

function recoil(body) {
  if (body.stateCounter % 4){
    body.matrix.reverse()
  }
  body.stateCounter -= 1
  if (body.health < 1) {
    body.velocity = 0
    if (!body.stateCounter) {
      body.destroy = true
    }
  }
}

function destroyBullet(y, x){
  for (let i = 0; i < nextBullets.length; i++) {
    let bullet = nextBullets[i]
    if (bullet.offset.y === y && bullet.offset.x === x) {
      bullet.destroy = true
    }
  }
}


// Collision logic

function handleCollision (e, axis) {
  if (e.type === 1) return

  if (axis === "x") {
    if (e.direction.x < 0) {
      var side = "left"
    } else {
      var side = "right"
    }
  } else {
    if (e.direction.y < 0) {
      var side = "bottom"
    } else {
      var side = "top"
    }
  }

  if (e.type === 2) {
    e.destroy = true
  }

  if (e.type === 3) {
    if (side === "bottom") {
      // Game Over
    } else if (side === "left" || side === "right") {
      e.direction.x = e.direction.x * -1
    }
  }
}

function atEdge(e) {
  let [m, o] = [e.matrix, e.offset]
  if (o.x + m[0].length >= arenaSize.w) {
    o.x -= 1
    if (e.type === 3) {
      e.direction.x *= -1
    }
  }
  if (o.x <= 1) {
    o.x += 1
    if (e.type === 3) {
      e.direction.x *= -1
    }
  }
  if (o.y + m.length >= arenaSize.w) {
    // Logic for the bottom
  }
  if (o.y <= 0) {
    e.destroy = true
  }
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

function move(e, axis, amount) {
  let offset = e.offset[axis]
  e.offset[axis] += amount
  atEdge(e)
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

  nextBullets.push(bullet)

  gunEnabled = false
  setTimeout(() => {
    gunEnabled = true
  }, 100)
}

function Alien (name, offset, direction={x: 1, y: 0}) {
  this.type = 3
  this.matrix = shapes[name].slice()
  this.destroy = false
  this.offset = offset
  this.direction = direction
  this.health = 4
  this.stateCounter = 0
  this.velocity = 1
}

function createAlien (name, offset) {
  nextBodies.push(new Alien(name, offset)
  )
}

let gunEnabled = true
let currentBodies = []
let nextBodies = []
let currentBullets = []
let nextBullets = []


function advanceElements (current, next) {
  let len = current.length

  for (let i = 0; i < len; i++) {
    let e = current[i]
    if (!(frameCount % 2 && e.type === 3)) {
      e.offset.y += e.direction.y * e.velocity
      e.offset.x += e.direction.x * e.velocity
    }

    atEdge(e)
    if (e.stateCounter) {
      recoil(e)
    }
    if (!e.destroy) {
      next.push(e)
    }
  }
}

function assembleArena() {
  addToArena(player)
  atEdge(player)
  advanceElements(currentBullets, nextBullets)
  for (let i = 0; i < nextBullets.length; i++) {
    addToArena(nextBullets[i])
  }
  advanceElements(currentBodies, nextBodies)
  for (let i = 0; i < nextBodies.length; i++) {
    addToArena(nextBodies[i])
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

let frameCount = 0

function updateCanvas() {
  frameCount += 1

  if (frameCount > 200) {
    // createAlien('fighter', {x: 40, y: 0})
    frameCount = 0
  }

  context.fillStyle = "#000"
  context.fillRect(0, 0, canvas.width, canvas.height)
  arena = createArena(arenaSize.w, arenaSize.h)
  checkKeys()
  assembleArena()
  drawMatrix(arena, {x: 0, y: 0})
  resetElements()
  requestAnimationFrame(updateCanvas)
}

function resetElements() {
  currentBodies = nextBodies
  nextBodies = []
  currentBullets = nextBullets
  nextBullets = []
}

let player = {
  type: 1,
  matrix: shapes.player,
  offset: {x: 40, y: 111},
  destroy: false
}

let arena = createArena(arenaSize.w, arenaSize.h)
updateCanvas()
