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

const predictionButtons = document.querySelectorAll(".prediction");
const predictionFeedback = document.getElementById("predictionFeedback");

predictionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const answer = button.dataset.answer;

        if (answer === "decrease") {
            predictionFeedback.innerHTML = `
                <strong>Correct!</strong>
                When the box becomes wider, the energy decreases.
                Energy is proportional to 1/L² when n stays constant.
            `;
            predictionFeedback.style.backgroundColor = "#ecfdf5";
            predictionFeedback.style.color = "#047857";
        } else {
            predictionFeedback.innerHTML = `
                <strong>Not quite! Try again.</strong>
                The correct answer is Energy decreases.
                When L increases, energy decreases because E is proportional to 1/L².
            `;
            predictionFeedback.style.backgroundColor = "#fff7ed";
            predictionFeedback.style.color = "#c2410c";
        }

        predictionFeedback.style.padding = "16px";
        predictionFeedback.style.marginTop = "16px";
        predictionFeedback.style.borderRadius = "12px";
        predictionFeedback.style.lineHeight = "1.6";
    });
});

let initialEnergy = null;
let initialBoxLength = null;
let initialQuantumNumber = null;

const saveEnergyButton = document.getElementById("saveInitialEnergy");
const initialEnergyResult = document.getElementById("initialEnergyResult");
const energyComparison = document.getElementById("energyComparison");

if (saveEnergyButton) {
    saveEnergyButton.addEventListener("click", () => {
        initialEnergy = energy(n, L);
        initialBoxLength = L;
        initialQuantumNumber = n;

        initialEnergyResult.textContent =
            `Initial energy: ${initialEnergy.toFixed(4)} ` +
            `(L = ${initialBoxLength.toFixed(1)}, n = ${initialQuantumNumber})`;

        energyComparison.textContent =
            "Initial energy saved! Now change Box Length and compare.";
           updateEnergyComparison(); 
    });
}

function updateEnergyComparison() {
    if (initialEnergy === null) {
        return;
    }

    const currentEnergy = energy(n, L);
    const energyDifference = currentEnergy - initialEnergy;
    const percentChange =
        (energyDifference / initialEnergy) * 100;

    energyComparison.textContent =
        `Initial: E = ${initialEnergy.toFixed(4)} (L = ${initialBoxLength.toFixed(1)}). ` +
        `Current: E = ${currentEnergy.toFixed(4)} (L = ${L.toFixed(1)}). ` +
        `Change: ${energyDifference.toFixed(4)} ` +
        `(${percentChange.toFixed(2)}%).`;
}

nSlider.addEventListener("input", updateEnergyComparison);
lSlider.addEventListener("input", updateEnergyComparison);



let energyChartInstance = null;

function drawEnergyChart() {
    const canvas = document.getElementById("energyChart");
    if (!canvas || typeof Chart === "undefined") return;

    const lengthSlider = document.getElementById("lSlider");
    const nSlider = document.getElementById("nSlider");

    const currentL = lengthSlider ? Number(lengthSlider.value) : 2;
    const currentN = nSlider ? Number(nSlider.value) : 1;

    // Dimensionless units: hbar = 1, mass = 1
    const energy = (n, L) =>
        (n * n * Math.PI * Math.PI) / (2 * L * L);

    const colors = [
        "#4776e6",
        "#8265d5",
        "#d56b9f",
        "#399bb3",
        "#7b8498"
    ];

    const datasets = [];

    // Energy curves for n = 1 to 5
    for (let n = 1; n <= 5; n++) {
        const points = [];

        for (let i = 0; i <= 100; i++) {
            const L = 1 + (4 * i) / 100;
            points.push({ x: L, y: energy(n, L) });
        }

        datasets.push({
            label: `n = ${n}`,
            data: points,
            borderColor: colors[n - 1],
            backgroundColor: colors[n - 1],
            borderWidth: 2.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.2,
            fill: false
        });
    }

    // Highlight the currently selected state
    datasets.push({
        label: `Selected state (n = ${currentN})`,
        data: [{ x: currentL, y: energy(currentN, currentL) }],
        borderColor: "#2563eb",
        backgroundColor: "#2563eb",
        pointRadius: 6,
        pointHoverRadius: 8,
        showLine: false
    });

    if (energyChartInstance) {
        energyChartInstance.destroy();
    }

    energyChartInstance = new Chart(canvas, {
        type: "line",
        data: { datasets },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            interaction: {
                mode: "nearest",
                intersect: false
            },
            plugins: {
                legend: {
                    position: "top",
                    labels: {
                        usePointStyle: true,
                        pointStyle: "line",
                        padding: 18,
                        boxWidth: 24,
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: E = ${
                                context.parsed.y.toFixed(4)
                            }`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    type: "linear",
                    min: 1,
                    max: 5,
                    title: {
                        display: true,
                        text: "Box length L",
                        padding: 12
                    },
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: "#edf0f7"
                    },
                    border: {
                        color: "#cbd5e1"
                    }
                },
                y: {
    beginAtZero: true,
    min: 0,
    title: {
        display: true,
        text: "Energy E",
        padding: 10
    },
                    border: {
                        color: "#cbd5e1"
                    }
                }
            }
        }
    });
}

// Redraw when the user changes L or n
const energyLengthControl = document.getElementById("lSlider");
const energyLevelControl = document.getElementById("nSlider");

if (energyLengthControl) {
    energyLengthControl.addEventListener("input", drawEnergyChart);
}

if (energyLevelControl) {
    energyLevelControl.addEventListener("input", drawEnergyChart);
}

drawEnergyChart();
