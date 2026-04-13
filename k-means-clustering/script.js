const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

class P {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};

let data = [];
const colors = ["#ef231b", "#12da20", "#124aef", "#ddca2c", "#12d5e2"];
let k = 2;
let speed = 1;
let clusters = [];

const adjustClusters = () => {
    while (clusters.length < k)
        clusters.push(data[Math.floor(Math.random() * data.length)])
    while (clusters.length > k)
        clusters.pop()
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setK = (v) => {
    k = v;
    document.getElementById("k-label").innerText = v;
    adjustClusters();
};

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setSpeed = (v) => {
    speed = v;
    document.getElementById("speed-label").innerText = v;
};

document.getElementById("k-label").innerText = k;
document.getElementById("k").value = k;
document.getElementById("speed-label").innerText = speed;
document.getElementById("speed").value = speed;

const randomNormal = (mean, std) => {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return num * std + mean;
};

const generateData = () => {
    data = [];
    const centers = [];
    for (let cat = 0; cat < 5; cat++) {
        let cX = Math.random() * 0.6 + 0.2;
        let cY = Math.random() * 0.6 + 0.2;
        let minDst = Math.SQRT2;
        let atts = 0;
        for (let i = 0; i < centers.length; i++) {
            const dst = Math.sqrt((cX - centers[i].x) ** 2 + (cY - centers[i].y) ** 2);
            if (dst < 0.25 + centers[i].s && atts < 10) {
                cX = Math.random() * 0.7 + 0.15;
                cY = Math.random() * 0.7 + 0.15;
                minDst = Math.SQRT2;
                i = 0;
                atts++;
            }
            minDst = Math.min(minDst, dst);
        }
        const spread = (Math.random() * 0.07 + 0.09) * ((minDst / Math.SQRT2) ** 0.3);
        centers.push({x: cX, y: cY, s: spread});
        for (let i = 0; i < Math.random() * 50 + 50; i++) {
            const x = randomNormal(cX, spread);
            const y = randomNormal(cY, spread);
            data.push(new P(
                Math.max(Math.min(x, 1), 0),
                Math.max(Math.min(y, 1), 0)
            ));
        }
    }
    for (let i = 0; i < Math.random() * 16 + 8; i++) {
        data.push(new P(Math.random(), Math.random()))
    }
    clusters = []
    adjustClusters();
};

const step = () => {
    const means = Array.from({ length: k }, () => ({ x: 0, y: 0, num: 0 }));

    for (const point of data) {
        const closest = clusters.reduce((best, cluster, i, arr) =>
            Math.hypot(cluster.x - point.x, cluster.y - point.y) <
            Math.hypot(arr[best].x - point.x, arr[best].y - point.y) ? i : best, 0);

        means[closest].x += point.x;
        means[closest].y += point.y;
        means[closest].num++;
    }

    clusters = means.map((m, i) => m.count === 0 ? clusters[i] : new P(m.x / m.num, m.y / m.num));
};

const scheduleStep = () => {
    step();
    setTimeout(scheduleStep, 1000 / Math.exp(speed));
};

const f = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    for (let i = 0; i < data.length; i++) {
        ctx.save();
        ctx.translate(data[i].x * canvas.width, data[i].y * canvas.height);
        ctx.beginPath();
        ctx.lineCap = "round";
        const closest = clusters.reduce((best, p, j, arr) => Math.hypot(p.x - data[i].x, p.y - data[i].y) < Math.hypot(arr[best].x - data[i].x, arr[best].y - data[i].y) ? j : best, 0);
        ctx.strokeStyle = colors[closest];
        ctx.lineWidth = 3;
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.moveTo(-5, 5);
        ctx.lineTo(5, -5);
        ctx.stroke();
        ctx.restore();
    }

    for (let i = 0; i < clusters.length; i++) {
        ctx.beginPath();
        ctx.arc(
            clusters[i].x * canvas.width,
            clusters[i].y * canvas.height,
            12,
            0,
            2 * Math.PI,
        );
        ctx.fillStyle = `${colors[i]}8f`;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#000000cf";
        ctx.stroke();
    }

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
generateData();
scheduleStep();
