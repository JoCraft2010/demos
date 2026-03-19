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

    max() {
        return Math.max(this.u, this.d, this.l, this.r);
    }
}

const grid = [];
let agentX = 0, agentY = 0;
const goalX = 9, goalY = 9;
let speed = 1;

let alpha = 0.2, gamma = 0.9, epsilon = 0.1;

for (let i = 0; i < 10; i++) {
    const a = [];
    for (let j = 0; j < 10; j++) {
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
grid[4][5].makeBarrier()
grid[5][5].makeBarrier()
grid[6][5].makeBarrier()
grid[7][5].makeBarrier()
grid[8][5].makeBarrier()
grid[9][5].makeBarrier()

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
    let currentMax = q.u;
    let action = "u";
    if (q.d > currentMax) {
        currentMax = q.d;
        action = "d";
    }
    if (q.l > currentMax) {
        currentMax = q.l;
        action = "l";
    }
    if (q.r > currentMax) {
        currentMax = q.r;
        action = "r";
    }

    if (Math.random() < epsilon) {
        action = ["u", "d", "l", "r"][Math.floor(Math.random() * 4)];
    }

    let qn = 0;
    let r = 0;
    let newX = agentX, newY = agentY;

    switch (action) {
    case "u":
        if (agentY === 0 || grid[agentY - 1][agentX].barrier) {
            r = -5;
        } else if (agentY - 1 === goalY && agentX === goalX) {
            newY -= 1;
            r = 10;
        } else {
            newY -= 1;
            r = -1;
        }
        qn = q.u;
        break;
    case "d":
        if (agentY === grid.length - 1 || grid[agentY + 1][agentX].barrier) {
            r = -5;
        } else if (agentY + 1 === goalY && agentX === goalX) {
            newY += 1;
            r = 10;
        } else {
            newY += 1;
            r = -1;
        }
        qn = q.d;
        break;
    case "l":
        if (agentX === 0 || grid[agentY][agentX - 1].barrier) {
            r = -5;
        } else if (agentY === goalY && agentX - 1 === goalX) {
            newX -= 1;
            r = 10;
        } else {
            newX -= 1;
            r = -1;
        }
        qn = q.l;
        break;
    case "r":
        if (agentX === grid[agentY].length - 1 || grid[agentY][agentX + 1].barrier) {
            r = -5;
        } else if (agentY === goalY && agentX + 1 === goalX) {
            newX += 1;
            r = 10;
        } else {
            newX += 1;
            r = -1;
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

    if (agentX === goalX && agentY === goalY) {
        agentX = 0;
        agentY = 0;
    }

    setTimeout(step, 1000 / Math.exp(speed));
};

const f = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[y].length; x++) {
            if (grid[y][x].barrier) {
                ctx.fillStyle = "#ff00ff";
            } else if (x === agentX && y === agentY) {
                ctx.fillStyle = "#ffff00";
            } else if (x === goalX && y === goalY) {
                ctx.fillStyle = "#0000ff";
            } else {
                ctx.fillStyle = `rgb(${-grid[y][x].max() * 20}, ${grid[y][x].max() * 20}, 0)`;
            }
            ctx.fillRect(x * 50 + 2, y * 50 + 2, 46, 46);
        }
    }

    requestAnimationFrame(f);
};

requestAnimationFrame(f);
step();
