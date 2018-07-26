const w : number = window.innerWidth, h : number = window.innerHeight
const NODES : number = 5
class LinkedAltStepStage {

    canvas : HTMLCanvasElement = document.createElement('canvas')

    context : CanvasRenderingContext2D

    constructor() {
        this.initCanvas()
    }

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = w
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }
}

class State {

    scale : number = 0

    dir : number = 0

    prevScale : number = 0

    update(cb : Function) {
        this.scale += 0.1 * this.dir
        if (Math.abs(this.scale - this.prevScale) > 0) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }

}

class Animator {

    animated : boolean = false

    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(() => {
                cb()
            })
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class ASNode {

    state : State = new State()

    dir : number = 1

    next : ASNode

    prev : ASNode

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = w / NODES
        const sc1 : number = Math.min(0.5, this.state.scale) * 2
        const sc2 : number = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2
        context.save()
        context.translate(this.i * gap,(gap / 3) * (1 - (this.i % 2) * 2) * sc1)
        context.beginPath()
        context.moveTo(gap * sc2, 0)
        context.lineTo(gap, 0)
        context.stroke()
        context.restore()
    }

    addNeighbor() {
        if (this.i < NODES - 1) {
            this.next = new ASNode(this.i + 1)
            this.next.prev = this
        }
    }

    constructor(private i : number) {
        this.addNeighbor()
    }

    getNext(dir : number, cb : Function) : ASNode {
        var curr : ASNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class LinkedAS {

    curr : ASNode = new ASNode(0)

    dir : number = 1

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }

    draw(context : CanvasRenderingContext2D) {
        context.strokeStyle = '#4CAF50'
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / 60
        this.curr.draw(context)
    }
}
