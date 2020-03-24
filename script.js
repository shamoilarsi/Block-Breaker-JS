function constrain(number, low, high) {
    return (number < low ? low : (number > high ? high : number))
}

function distanceBetweenPoints(p1, p2) {
    return (Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2))
}

const cvs = document.getElementById('canvas')
const ctx = cvs.getContext('2d')

let started = false

let game = {
    score: 0,
    win: 0,
    lost: 0,
    draw: function (text) {
        ctx.font = "20px Retro";
        ctx.fillStyle = '#FFF'
        ctx.fillText(text, 10, 20);
        ctx.stroke()
    }
}

window.addEventListener('keypress', (e) => {
    if (!(game.win || game.lost))
        paddle.update(e.key)
    else if (e.key == 'r')
        location.reload()
})

let audio_won = new Audio()
audio_won.src = 'assets/won.wav'

let audio_lost = new Audio()
audio_lost.src = 'assets/lost.wav'

let audio_hit = new Audio()
audio_hit.src = 'assets/hit.wav'


let background = {
    draw: function () {
        ctx.beginPath()
        ctx.fillStyle = '#000'
        ctx.rect(0, 0, cvs.width, cvs.height)
        ctx.fill()
        ctx.stroke()
    }
}

class brick {
    constructor(coordinates, color) {
        this.coordinates = coordinates
        this.color = color
    }

    body = {
        width: 40,
        height: 10
    }

    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.rect(this.coordinates.x, this.coordinates.y, this.body.width, this.body.height)
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = '#ffffff'
        ctx.stroke()
    }
}

let ball = {
    radius: 4,
    coordinates: {
        x: cvs.width / 2 - 2,
        y: cvs.height - 70
    },
    speed: {
        x: 0,
        y: 0
    },
    draw: function () {
        this.update()
        ctx.beginPath();
        ctx.arc(this.coordinates.x, this.coordinates.y, this.radius, 0, 2 * Math.PI)
        ctx.fillStyle = '#F00'
        ctx.fill()
        ctx.lineWidth = 2
        ctx.strokeStyle = '#F00'
        ctx.stroke()
    },
    update: function () {
        if (!started) {
            this.speed.x = Math.ceil(Math.random() * 3) + 3
            this.speed.y = 8 - this.speed.x //Math.ceil(Math.random() * 5) + 3

            if (Math.floor(Math.random() * 10 >= 5))
                this.speed.x = -this.speed.x
            started = true
        }

        this.coordinates.x += this.speed.x
        this.coordinates.y -= this.speed.y;
        this.checkCollision()
    },
    checkCollision: function () {
        if (this.coordinates.y - this.radius <= 0) {
            this.speed.y *= -1
        }

        if (this.coordinates.x - this.radius <= 0 || this.coordinates.x + this.radius >= cvs.width) {
            this.speed.x *= -1
        }

        if (this.coordinates.y + this.radius >= cvs.height) {
            console.log('Game Over')
            game.lost = 1
        }

        //CHECK PADDLE COLLISION
        pointsOnPaddle = {
            x: constrain(this.coordinates.x, paddle.coordinates.x, paddle.coordinates.x + paddle.body.width),
            y: constrain(this.coordinates.y, paddle.coordinates.y, paddle.coordinates.y + paddle.body.height)
        }

        if (distanceBetweenPoints(this.coordinates, pointsOnPaddle) <= this.radius) {
            if (this.coordinates.x >= paddle.coordinates.x && this.coordinates.x <= paddle.coordinates.x + paddle.body.width) axis = 1
            else if (this.coordinates.y >= paddle.coordinates.y && this.coordinates.y <= paddle.coordinates.y + paddle.body.height) axis = 0

            if (axis == 0) this.speed.x *= -1
            else this.speed.y *= -1

            audio_hit.play()
        }

        //CHECK BRICK COLLISION
        bricks.brick.forEach((bri, index, obj) => {
            let axis = 0
            pointOnRect = {
                x: constrain(this.coordinates.x, bri.coordinates.x, bri.coordinates.x + bri.body.width),
                y: constrain(this.coordinates.y, bri.coordinates.y, bri.coordinates.y + bri.body.height)
            }

            if (distanceBetweenPoints(this.coordinates, pointOnRect) <= this.radius) {
                if (this.coordinates.x >= bri.coordinates.x && this.coordinates.x <= bri.coordinates.x + bri.body.width) axis = 1
                else if (this.coordinates.y >= bri.coordinates.y && this.coordinates.y <= bri.coordinates.y + bri.body.height) axis = 0

                if (axis == 0) this.speed.x *= -1
                else this.speed.y *= -1

                game.score++
                audio_hit.play()
                obj.splice(index, 1)
                if (obj.length == 0)
                    game.win = 1;
            }
        });
    }
}

let paddle = {
    body: {
        width: 160,
        height: 5
    },
    coordinates: {
        x: cvs.width / 2 - 160 / 2,
        y: cvs.height - 30
    },
    draw: function () {
        ctx.beginPath()
        ctx.fillStyle = '#C0C0C0'
        ctx.lineWidth = 3.5
        ctx.arc(this.coordinates.x, this.coordinates.y + this.body.height / 2, this.body.height / 2, 0 * Math.PI, 2 * Math.PI)
        ctx.arc(this.coordinates.x + this.body.width, this.coordinates.y + this.body.height / 2, this.body.height / 2, 0 * Math.PI, 2 * Math.PI)
        ctx.strokeStyle = '#C0C0C0'
        ctx.stroke()

        ctx.beginPath()
        ctx.fillStyle = '#0000ff'
        ctx.lineWidth = 3
        ctx.rect(this.coordinates.x, this.coordinates.y, this.body.width, this.body.height)
        ctx.fill()
        ctx.strokeStyle = '#C0C0C0'
        ctx.stroke()
    },
    update: function (c) {
        if (c == 'a') {
            this.coordinates.x = constrain(this.coordinates.x -= 10, 0, cvs.width)
        }
        else if (c == 'd') {
            this.coordinates.x = constrain(this.coordinates.x += 10, 0, cvs.width - this.body.width)
        }
    }
}

let bricks = {
    brick: [],
    draw: function () {
        this.brick.forEach(bri => {
            bri.draw();
        });
    },
    reset: function () {
        this.brick = []
        for (let i = 40; i < cvs.width - 50; i += 45)
            for (let j = 50; j <= cvs.height - 350; j += 15)
                this.brick.push(new brick(
                    { x: i, y: j }, '#FFFFFF'
                ))
    }
}

function draw() {
    background.draw();
    bricks.draw();
    ball.draw();
    paddle.draw();

    if (!(game.win || game.lost)) {
        game.draw("Score : " + game.score);
        requestAnimationFrame(draw)
    }
    else if (game.win) {
        audio_won.play()
        game.draw("You Won!")
    }
    else if (game.lost) {
        audio_lost.play()
        game.draw("You Lost! Score : " + game.score)
    }
}

bricks.reset();
draw();