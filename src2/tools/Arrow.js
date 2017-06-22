export default function ParallelSegment(ctx, colors, context) {
    this.ctx = ctx;
    this.colors = colors;
    this.step = 0;
    this.context = context;
    this.index = [];
    this.price = [];
    this.moving = false;
}

ParallelSegment.prototype.draw = function() {
    if (this.index.length === 0) {
        return;
    }
    const ctx = this.ctx;
    const [point1, point2] = this.getPos();

    const linePath = this.getLine();
    const arrowPath = this.getArrow();
    if (this.isInPath(this.context.mousePos, linePath)) {
        ctx.lineWidth = this.context.dpr;
        if (this.step === 2) {
            ctx.strokeStyle = this.colors.lineHilightColor;
        } else {
            ctx.strokeStyle = this.colors.lineColor;
        }
        ctx.stroke(linePath);
        ctx.stroke(arrowPath);
        this.drawPoint();
    } else {
        ctx.lineWidth = this.context.dpr;
        ctx.strokeStyle = this.colors.lineColor;
        ctx.stroke(linePath);
        ctx.stroke(arrowPath);
    }


    if (this.step !== 2) {
        this.drawPoint();
    }
};

ParallelSegment.prototype.next = function() {
    if (this.step === 0) {
        this.step = 1;
    } else if (this.step === 1) {
        this.step = 2;
        return true;
    }
};

ParallelSegment.prototype.isInPath = function(pos, path) {
    const ctx = this.ctx;
    ctx.lineWidth = this.context.dpr * 10;
    if (!path) {
        path = this.getLine();
    }
    if (ctx.isPointInStroke(path, pos.x, pos.y)) {
        return true;
    }
    return false;
};

ParallelSegment.prototype.getArrow = function() {
    const [point1, point2] = this.getPos();

    const k = (point2.y - point1.y) / (point2.x - point1.x);
    const k1 = Math.tan(Math.atan(k) + Math.PI / 5);
    const k2 = Math.tan(Math.atan(k) - Math.PI / 5);

    let x1;
    let y1;
    let x2;
    let y2;
    if (point2.x > point1.x) {
        x1 = point2.x - Math.cos(Math.atan(k1)) * 12;
        y1 = point2.y - Math.sin(Math.atan(k1)) * 12;
        x2 = point2.x - Math.cos(Math.atan(k2)) * 12;
        y2 = point2.y - Math.sin(Math.atan(k2)) * 12;
    } else if (point2.x < point1.x) {
        x1 = point2.x + Math.cos(Math.atan(k1)) * 12;
        y1 = point2.y + Math.sin(Math.atan(k1)) * 12;
        x2 = point2.x + Math.cos(Math.atan(k2)) * 12;
        y2 = point2.y + Math.sin(Math.atan(k2)) * 12;
    } else {
        if (point2.y > point1.y) {
            x1 = point2.x + Math.cos(Math.atan(k1)) * 12;
            y1 = point2.y + Math.sin(Math.atan(k1)) * 12;
            x2 = point2.x - Math.cos(Math.atan(k2)) * 12;
            y2 = point2.y - Math.sin(Math.atan(k2)) * 12;
        } else {
            x1 = point2.x - Math.cos(Math.atan(k1)) * 12;
            y1 = point2.y - Math.sin(Math.atan(k1)) * 12;
            x2 = point2.x + Math.cos(Math.atan(k2)) * 12;
            y2 = point2.y + Math.sin(Math.atan(k2)) * 12;
        }
    }

    const arrow = new Path2D();
    arrow.moveTo(x1, y1);
    arrow.lineTo(point2.x, point2.y);
    arrow.lineTo(x2, y2);

    return arrow;
};

ParallelSegment.prototype.getCircle = function() {
    const ctx = this.ctx;
    const [point1, point2] = this.getPos();

    const circle1 = new Path2D();
    circle1.arc(point1.x, point1.y, 5 * this.context.dpr, 0, Math.PI * 2);

    const circle2 = new Path2D();
    circle2.arc(point2.x, point2.y, 5 * this.context.dpr, 0, Math.PI * 2);

    return [circle1, circle2];
};

ParallelSegment.prototype.getLine = function() {
    const ctx = this.ctx;
    const [point1, point2] = this.getPos();

    const path = new Path2D();
    path.moveTo(point1.x, point1.y);
    path.lineTo(point2.x, point2.y);

    return path;
};

ParallelSegment.prototype.drawPoint = function() {
    const ctx = this.ctx;
    const [point1, point2] = this.getPos();
    const [circle1, circle2] = this.getCircle();

    ctx.lineWidth = this.context.dpr;
    ctx.fillStyle = this.colors.background;

    ctx.fill(circle1);
    ctx.stroke(circle1);

    ctx.fill(circle2);
    ctx.stroke(circle2);
};

ParallelSegment.prototype.setPosition = function(index, price) {
    if (this.step === 0) {
        this.index = [index, index];
        this.price = [price, price];
    } else if (this.step === 1) {
        this.index = [this.index[0], index];
        this.price = [this.price[0], price];
    }
};

/**
 * index 沿x轴移动的距离
 * price 当前价格
 */
ParallelSegment.prototype.move = function(index, price) {
    this.index = [this.index[0] + index, this.index[1] + index];
    this.price = [this.price[0] + price, this.price[1] + price];
};

ParallelSegment.prototype.getPos = function() {
    const { mainView } = this.context;
    const [startIndex, endIndex] = this.context.state.range;
    const verticalRectNumber = endIndex - startIndex;
    const { max, min } = this.context.computAxis();

    const pos = [];
    this.index.forEach((el, i) => {
        const x = (el - startIndex) * mainView.w / verticalRectNumber + mainView.w / verticalRectNumber * 0.5 + mainView.x;
        const y = mainView.y + (max - this.price[i]) / (max - min) * mainView.h;
        pos.push({ x, y });
    });
    return pos;
};
