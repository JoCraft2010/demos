const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

class Q {
    constructor(u, d, l, r) {
        this.u = u;
        this.d = d;
        this.l = l;
        this.r = r;
        this.barrier = false;
    }

    makeBarrier() {
        this.barrier = true;
    }

    min() {
        return Math.min(this.u, this.d, this.l, this.r);
    }

    max() {
        return Math.max(this.u, this.d, this.l, this.r);
    }

    maxDir() {
        let currentMax = this.u;
        let action = "u";
        if (this.d > currentMax) {
            currentMax = this.d;
            action = "d";
        }
        if (this.l > currentMax) {
            currentMax = this.l;
            action = "l";
        }
        if (this.r > currentMax) {
            currentMax = this.r;
            action = "r";
        }
        return action;
    }
}

const grid = [];
let agentX = 0, agentY = 0;
const goalX = 11, goalY = 11;
let speed = 1;

let alpha = 0.2, gamma = 0.97, epsilon = 0.1;
const stepReward = -0.5, barrierReward = -5, goalReward = 10;
let skipping = false;
let steps = 0, epochs = 0;

const numFormat = new Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    });

for (let i = 0; i < 12; i++) {
    const a = [];
    for (let j = 0; j < 12; j++) {
        a.push(new Q(0, 0, 0, 0));
    }
    grid.push(a);
}

grid[0][3].makeBarrier()
grid[1][3].makeBarrier()
grid[2][3].makeBarrier()
grid[3][3].makeBarrier()
grid[4][3].makeBarrier()
grid[5][3].makeBarrier()
grid[6][3].makeBarrier()
grid[9][3].makeBarrier()
grid[10][3].makeBarrier()
grid[11][3].makeBarrier()
grid[3][5].makeBarrier()
grid[4][5].makeBarrier()
grid[5][5].makeBarrier()
grid[6][5].makeBarrier()
grid[7][5].makeBarrier()
grid[8][5].makeBarrier()
grid[9][5].makeBarrier()
grid[1][7].makeBarrier()
grid[2][7].makeBarrier()
grid[3][7].makeBarrier()
grid[4][7].makeBarrier()
grid[5][7].makeBarrier()
grid[6][7].makeBarrier()
grid[7][7].makeBarrier()
grid[8][7].makeBarrier()
grid[9][7].makeBarrier()
grid[10][7].makeBarrier()
grid[11][7].makeBarrier()
grid[1][8].makeBarrier()
grid[1][9].makeBarrier()
grid[1][10].makeBarrier()
grid[4][9].makeBarrier()
grid[4][10].makeBarrier()
grid[4][11].makeBarrier()
grid[7][8].makeBarrier()
grid[7][9].makeBarrier()
grid[7][10].makeBarrier()

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setAlpha = (v) => {
    alpha = v;
    document.getElementById("alpha-label").innerText = v;
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setGamma = (v) => {
    gamma = v;
    document.getElementById("gamma-label").innerText = v;
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setEpsilon = (v) => {
    epsilon = v;
    document.getElementById("epsilon-label").innerText = v;
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setSpeed = (v) => {
    speed = v;
    document.getElementById("speed-label").innerText = v;
};

document.getElementById("alpha").value = alpha;
document.getElementById("alpha-label").innerText = alpha;
document.getElementById("gamma").value = gamma;
document.getElementById("gamma-label").innerText = gamma;
document.getElementById("epsilon").value = epsilon;
document.getElementById("epsilon-label").innerText = epsilon;
document.getElementById("speed").value = speed;
document.getElementById("speed-label").innerText = speed;

const step = () => {
    const q = grid[agentY][agentX];
    let action = q.maxDir();

    if (Math.random() < epsilon) {
        action = ["u", "d", "l", "r"][Math.floor(Math.random() * 4)];
    }

    let qn = 0;
    let r = 0;
    let newX = agentX, newY = agentY;

    switch (action) {
    case "u":
        if (agentY === 0 || grid[agentY - 1][agentX].barrier) {
            r = barrierReward;
        } else if (agentY - 1 === goalY && agentX === goalX) {
            newY -= 1;
            r = goalReward;
        } else {
            newY -= 1;
            r = stepReward;
        }
        qn = q.u;
        break;
    case "d":
        if (agentY === grid.length - 1 || grid[agentY + 1][agentX].barrier) {
            r = barrierReward;
        } else if (agentY + 1 === goalY && agentX === goalX) {
            newY += 1;
            r = goalReward;
        } else {
            newY += 1;
            r = stepReward;
        }
        qn = q.d;
        break;
    case "l":
        if (agentX === 0 || grid[agentY][agentX - 1].barrier) {
            r = barrierReward;
        } else if (agentY === goalY && agentX - 1 === goalX) {
            newX -= 1;
            r = goalReward;
        } else {
            newX -= 1;
            r = stepReward;
        }
        qn = q.l;
        break;
    case "r":
        if (agentX === grid[agentY].length - 1 || grid[agentY][agentX + 1].barrier) {
            r = barrierReward;
        } else if (agentY === goalY && agentX + 1 === goalX) {
            newX += 1;
            r = goalReward;
        } else {
            newX += 1;
            r = stepReward;
        }
        qn = q.r;
        break;
    }

    qn += alpha * (r + gamma * grid[newY][newX].max() - qn);

    switch (action) {
    case "u":
        grid[agentY][agentX].u = qn;
        break;
    case "d":
        grid[agentY][agentX].d = qn;
        break;
    case "l":
        grid[agentY][agentX].l = qn;
        break;
    case "r":
        grid[agentY][agentX].r = qn;
        break;
    }

    agentX = newX;
    agentY = newY;
    steps++;

    if (agentX === goalX && agentY === goalY) {
        agentX = 0;
        agentY = 0;
        epochs++;
        return true;
    }
    return false;
};

const scheduleStep = () => {
    step();
    setTimeout(scheduleStep, 1000 / Math.exp(speed));
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const skipEpochs = (num) => {
    if (skipping) return;
    skipping = true;
    let epochs = 0;
    const fn = () => {
        let res = false;
        let steps = 0;
        while (!res && steps < 5000) {
            res = step();
            steps++;
        }
        epochs++;
        if (epochs < num) setTimeout(fn, Math.max(-4.2 * Math.log(num) + 26, 1));
        else skipping = false;
    };
    setTimeout(fn);
};

const f = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            const minQ = grid[y][x].min();
            const maxQ = grid[y][x].max();
            if (grid[y][x].barrier) {
                ctx.fillStyle = "#ff00ff";
            } else if (x === agentX && y === agentY && !skipping) {
                ctx.fillStyle = "#ffff00";
            } else if (x === goalX && y === goalY) {
                ctx.fillStyle = "#0000ff";
            } else {
                ctx.fillStyle = `rgb(${-maxQ * 20}, ${maxQ * 20}, 0)`;
            }
            const absX = Math.floor(x * canvas.width / grid[y].length - 0.5);
            const absY = Math.floor(y * canvas.height / grid.length - 0.5);
            const wid = Math.ceil(canvas.width / grid[y].length + 0.5);
            const hei = Math.ceil(canvas.height / grid.length + 0.5);
            ctx.fillRect(absX, absY, wid, hei);
            ctx.save();
            ctx.translate(absX + wid / 2, absY + hei / 2);
            ctx.rotate({"u": -Math.PI / 2, "d": Math.PI / 2, "l": Math.PI, "r": 0}[grid[y][x].maxDir()]);
            ctx.beginPath();
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            const dif = Math.min(Math.max(Math.max(maxQ - minQ, 0) * 0.3, Math.abs(maxQ) * 0.8), 1) ** 0.8;
            const size = 0.4 * wid * dif;
            ctx.strokeStyle = `rgba(248, 221, 40, ${dif ** 1.8})`;
            ctx.lineWidth = 3;
            ctx.moveTo(-size * 0.5, 0);
            ctx.lineTo(size * 0.5, 0);
            ctx.moveTo(size * 0.25, -size * 0.2);
            ctx.lineTo(size * 0.5, 0);
            ctx.lineTo(size * 0.25, size * 0.2);
            ctx.stroke();
            ctx.restore();
        }
    }

    document.getElementById("steps").innerText = numFormat.format(steps);
    document.getElementById("epochs").innerText = numFormat.format(epochs);
    requestAnimationFrame(f);
};

const onResize = () => {
    const size = Math.min(window.innerWidth, window.innerHeight) / 2.5;

    canvas.width = size;
    canvas.height = size;
};
window.addEventListener("resize", onResize);
onResize();

requestAnimationFrame(f);
scheduleStep();
