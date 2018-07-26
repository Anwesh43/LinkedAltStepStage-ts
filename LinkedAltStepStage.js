var w = window.innerWidth, h = window.innerHeight;
var NODES = 5;
var LinkedAltStepStage = (function () {
    function LinkedAltStepStage() {
        this.canvas = document.createElement('canvas');
        this.linkedAS = new LinkedAS();
        this.animator = new Animator();
        this.initCanvas();
    }
    LinkedAltStepStage.prototype.initCanvas = function () {
        this.canvas.width = w;
        this.canvas.height = h;
        this.context = this.canvas.getContext('2d');
        document.body.appendChild(this.canvas);
    };
    LinkedAltStepStage.prototype.render = function () {
        this.context.fillStyle = w;
        this.context.fillRect(0, 0, w, h);
        this.linkedAS.draw(this.context);
    };
    LinkedAltStepStage.prototype.handleTap = function () {
        var _this = this;
        this.canvas.onmousedown = function () {
            _this.linkedAS.startUpdating(function () {
                _this.animator.start(function () {
                    _this.render();
                    _this.linkedAS.update(function () {
                        _this.animator.stop();
                    });
                });
            });
        };
    };
    LinkedAltStepStage.init = function () {
        var stage = new LinkedAltStepStage();
        stage.render();
        stage.handleTap();
    };
    return LinkedAltStepStage;
})();
var State = (function () {
    function State() {
        this.scale = 0;
        this.dir = 0;
        this.prevScale = 0;
    }
    State.prototype.update = function (cb) {
        this.scale += 0.1 * this.dir;
        if (Math.abs(this.scale - this.prevScale) > 0) {
            this.scale = this.prevScale + this.dir;
            this.dir = 0;
            this.prevScale = this.scale;
            cb();
        }
    };
    State.prototype.startUpdating = function (cb) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale;
            cb();
        }
    };
    return State;
})();
var Animator = (function () {
    function Animator() {
        this.animated = false;
    }
    Animator.prototype.start = function (cb) {
        if (!this.animated) {
            this.animated = true;
            this.interval = setInterval(function () {
                cb();
            });
        }
    };
    Animator.prototype.stop = function () {
        if (this.animated) {
            this.animated = false;
            clearInterval(this.interval);
        }
    };
    return Animator;
})();
var ASNode = (function () {
    function ASNode(i) {
        this.i = i;
        this.state = new State();
        this.dir = 1;
        this.addNeighbor();
    }
    ASNode.prototype.update = function (cb) {
        this.state.update(cb);
    };
    ASNode.prototype.startUpdating = function (cb) {
        this.state.startUpdating(cb);
    };
    ASNode.prototype.draw = function (context) {
        var gap = w / NODES;
        var sc1 = Math.min(0.5, this.state.scale) * 2;
        var sc2 = Math.min(0.5, Math.max(0, this.state.scale - 0.5)) * 2;
        context.save();
        context.translate(this.i * gap, (gap / 3) * (1 - (this.i % 2) * 2) * sc1);
        context.beginPath();
        context.moveTo(gap * sc2, 0);
        context.lineTo(gap, 0);
        context.stroke();
        context.restore();
        if (this.next) {
            this.next.draw(context);
        }
    };
    ASNode.prototype.addNeighbor = function () {
        if (this.i < NODES - 1) {
            this.next = new ASNode(this.i + 1);
            this.next.prev = this;
        }
    };
    ASNode.prototype.getNext = function (dir, cb) {
        var curr = this.prev;
        if (dir == 1) {
            curr = this.next;
        }
        if (curr) {
            return curr;
        }
        cb();
        return this;
    };
    return ASNode;
})();
var LinkedAS = (function () {
    function LinkedAS() {
        this.curr = new ASNode(0);
        this.dir = 1;
    }
    LinkedAS.prototype.update = function (cb) {
        var _this = this;
        this.curr.update(function () {
            _this.curr = _this.curr.getNext(_this.dir, function () {
                _this.dir *= -1;
            });
            cb();
        });
    };
    LinkedAS.prototype.startUpdating = function (cb) {
        this.curr.startUpdating(cb);
    };
    LinkedAS.prototype.draw = function (context) {
        context.strokeStyle = '#4CAF50';
        context.lineCap = 'round';
        context.lineWidth = Math.min(w, h) / 60;
        context.save();
        context.translate(0, h / 2);
        this.curr.draw(context);
        context.restore();
    };
    return LinkedAS;
})();
