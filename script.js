// ========================================
// MidnightQuantum
// Particle in a Box - Time Evolution
// ========================================

// ---------- CANVAS ----------
const canvas = document.getElementById("simulationCanvas");
const ctx = canvas.getContext("2d");

// ---------- CONTROLS ----------
const nSlider = document.getElementById("nSlider");
const lSlider = document.getElementById("lSlider");

const nValue = document.getElementById("nValue");
const lValue = document.getElementById("lValue");

const waveButton = document.getElementById("waveButton");
const probabilityButton = document.getElementById("probabilityButton");

// ---------- RESULTS ----------
const energyValue = document.getElementById("energyValue");
const physicsN = document.getElementById("physicsN");
const physicsL = document.getElementById("physicsL");
const physicsEnergy = document.getElementById("physicsEnergy");

// ---------- VARIABLES ----------
let n = Number(nSlider.value);
let L = Number(lSlider.value);

let time = 0;
let running = true;

let displayMode = "wave";


// ========================================
// PHYSICS
// ========================================

// Energy of particle in a 1D infinite potential well
// Using dimensionless units: hbar = 1, m = 1
function energy(n, L) {
    return (n * n * Math.PI * Math.PI) / (2 * L * L);
}


// Wavefunction ψ(x,t)
function waveFunction(x, t, n, L) {

    const A = Math.sqrt(2 / L);

    const spatial =
        A * Math.sin(n * Math.PI * x / L);

    const E = energy(n, L);

    const temporal =
        Math.cos(E * t);

    return spatial * temporal;
}


// Probability density |ψ|²
function probabilityDensity(x, t, n, L) {

    const psi = waveFunction(x, t, n, L);

    return psi * psi;
}


// ========================================
// CANVAS
// ========================================

function resizeCanvas() {

    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;

    draw();
}


// ========================================
// DRAW GRAPH
// ========================================

function draw() {

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);


    // Graph margins
    const left = 60;
    const right = 25;
    const top = 30;
    const bottom = 45;

    const graphWidth = width - left - right;
    const graphHeight = height - top - bottom;


    // ----------------------------------------
    // AXIS
    // ----------------------------------------

    ctx.strokeStyle = "#d8dce8";
    ctx.lineWidth = 1;

    // x-axis
    ctx.beginPath();
    ctx.moveTo(left, height - bottom);
    ctx.lineTo(width - right, height - bottom);
    ctx.stroke();

    // y-axis
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, height - bottom);
    ctx.stroke();


    // ----------------------------------------
    // POTENTIAL WELL
    // ----------------------------------------

    ctx.strokeStyle = "#20264d";
    ctx.lineWidth = 3;

    // left wall
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, height - bottom);
    ctx.stroke();

    // right wall
    ctx.beginPath();
    ctx.moveTo(width - right, top);
    ctx.lineTo(width - right, height - bottom);
    ctx.stroke();


    // ----------------------------------------
    // WAVEFUNCTION
    // ----------------------------------------

    ctx.beginPath();

    const points = 500;

    for (let i = 0; i <= points; i++) {

        const x = (i / points) * L;

        let value;

        if (displayMode === "wave") {

            value = waveFunction(
                x,
                time,
                n,
                L
            );

        } else {

            value = probabilityDensity(
                x,
                time,
                n,
                L
            );

        }


        // Scale for visualization
        let scale;

        if (displayMode === "wave") {
            scale = graphHeight * 0.38;
        } else {
            scale = graphHeight * 0.65;
        }


        const px =
            left + (x / L) * graphWidth;

        const centerY =
            height - bottom - graphHeight * 0.45;

        const py =
            centerY - value * scale;


        if (i === 0) {
            ctx.moveTo(px, py);
        } else {
            ctx.lineTo(px, py);
        }
    }


    // ----------------------------------------
    // GRAPH STYLE
    // ----------------------------------------

    ctx.strokeStyle = "#3048a8";
    ctx.lineWidth = 3;

    ctx.stroke();


    // ----------------------------------------
    // TIME
    // ----------------------------------------

    ctx.fillStyle = "#6b7185";
    ctx.font = "14px Arial";

    ctx.fillText(
        `t = ${time.toFixed(2)}`,
        left + 10,
        top + 20
    );


    // ----------------------------------------
    // UPDATE VALUES
    // ----------------------------------------

    updatePhysics();
}


// ========================================
// UPDATE PHYSICS INFORMATION
// ========================================

function updatePhysics() {

    const E = energy(n, L);

    nValue.textContent = n;
    lValue.textContent = L.toFixed(1);

    energyValue.textContent = E.toFixed(4);

    physicsN.textContent = `n = ${n}`;
    physicsL.textContent = `L = ${L.toFixed(1)}`;
    physicsEnergy.textContent = E.toFixed(4);


    updateEnergyLevels();
}


// ========================================
// ENERGY LEVELS
// ========================================

function updateEnergyLevels() {

    const levels =
        document.querySelectorAll(".energy-level");

    levels.forEach((level, index) => {

        const levelNumber = 5 - index;

        if (levelNumber === n) {
            level.classList.add("selected");
        } else {
            level.classList.remove("selected");
        }

    });
}


// ========================================
// SLIDER EVENTS
// ========================================

nSlider.addEventListener("input", () => {

    n = Number(nSlider.value);

    time = 0;

    draw();
});


lSlider.addEventListener("input", () => {

    L = Number(lSlider.value);

    time = 0;

    draw();
});


// ========================================
// DISPLAY MODE
// ========================================

waveButton.addEventListener("click", () => {

    displayMode = "wave";

    waveButton.classList.add("active");
    probabilityButton.classList.remove("active");

    draw();
});


probabilityButton.addEventListener("click", () => {

    displayMode = "probability";

    probabilityButton.classList.add("active");
    waveButton.classList.remove("active");

    draw();
});


// ========================================
// ANIMATION
// ========================================

function animate(timestamp) {

    if (running) {

        time += 0.015;

        draw();
    }

    requestAnimationFrame(animate);
}


// ========================================
// START
// ========================================

window.addEventListener("resize", resizeCanvas);

resizeCanvas();

requestAnimationFrame(animate);