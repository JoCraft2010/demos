const c = document.getElementById("canvas");
const ctx = c.getContext("2d");

class P {
    constructor(x, y, cat) {
        this.x = x;
        this.y = y;
        this.cat = cat;
    }
};

let data = [];
const colors = ["#ef231b", "#12da20", "#124aef", "#ddca2c", "#12d5e2"];
let mouseX = 0, mouseY = 0;
let k = 5;

// biome-ignore lint/correctness/noUnusedVariables: html listener
const setK = (v) => {
    k = v;
    document.getElementById("k-label").innerText = v;
};

document.getElementById("k-label").innerText = k;
document.getElementById("k").value = k;

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
                Math.max(Math.min(y, 1), 0),
                cat
            ));
        }
    }
    for (let i = 0; i < Math.random() * 16 + 8; i++) {
        data.push(new P(Math.random(), Math.random(), Math.floor(Math.random() * 5)))
    }
};

const f = () => {
    ctx.clearRect(0, 0, c.width, c.height);

    const sorted = [...data].sort((a, b) => Math.sqrt((a.x - mouseX) ** 2 + (a.y - mouseY) ** 2) - Math.sqrt((b.x - mouseX) ** 2 + (b.y - mouseY) ** 2));

    for (let i = 0; i < data.length; i++) {
        ctx.save();
        ctx.translate(data[i].x * canvas.width, data[i].y * canvas.height);
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.strokeStyle = colors[data[i].cat];
        ctx.lineWidth = 3;
        ctx.moveTo(-5, -5);
        ctx.lineTo(5, 5);
        ctx.moveTo(-5, 5);
        ctx.lineTo(5, -5);
        ctx.stroke();
        ctx.restore();
    }

    const count = {};
    for (let i = 0; i < k; i++) {
        if (!count[sorted[i].cat]) count[sorted[i].cat] = 1;
        else count[sorted[i].cat]++;
    }
    const cat = Object.keys(count).reduce((a, b) => count[a] > count[b] ? a : b);

    for (let i = 0; i < k; i++) {
        ctx.beginPath();
        ctx.moveTo(mouseX * canvas.width, mouseY * canvas.height);
        ctx.lineTo(sorted[i].x * canvas.width, sorted[i].y * canvas.height)
        ctx.strokeStyle = `${colors[sorted[i].cat]}af`;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(mouseX * canvas.width, mouseY * canvas.height, 12, 0, 2 * Math.PI);
    ctx.fillStyle = `${colors[cat]}8f`;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000cf";
    ctx.stroke();

    const plot = document.getElementById("plot");
    const countSorted = Object.entries(count).sort(([, a], [, b]) => b - a).map(([cat, count]) => ({ cat, count }));
    for (let c = 0; c < countSorted.length; c++) {
        const style = `width: ${countSorted[c].count * 100}%; background-color: ${colors[countSorted[c].cat]};`;
        if (c < plot.childElementCount) {
            plot.children[c].style = style;
            plot.children[c].innerText = countSorted[c].count;
        } else {
            const div = document.createElement("div");
            div.style = style;
            div.innerText = countSorted[c].count;
            plot.appendChild(div);
        }
    }
    while (plot.childElementCount > countSorted.length) {
        plot.removeChild(plot.lastElementChild);
    }

    requestAnimationFrame(f);
};

canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / canvas.width;
    mouseY = (e.clientY - rect.top) / canvas.height;
})

const onResize = () => {
    const size = Math.min(window.innerWidth, window.innerHeight) / 2.5;

    canvas.width = size;
    canvas.height = size;
};
window.addEventListener("resize", onResize);
onResize();

requestAnimationFrame(f);
generateData();
