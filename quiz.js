const questionBank = [
    {
        question: "What happens to the energy when the quantum number n increases?",
        options: [
            "Energy decreases",
            "Energy increases",
            "Energy stays the same",
            "Energy becomes zero"
        ],
        answer: 1,
        explanation: "Energy is proportional to n². Therefore, increasing n increases the energy."
    },
    {
        question: "What happens to the energy when the box length L increases?",
        options: [
            "Energy increases",
            "Energy decreases",
            "Energy stays the same",
            "Energy becomes infinite"
        ],
        answer: 1,
        explanation: "Energy is proportional to 1/L². A wider box gives lower energy for the same quantum number."
    },
    {
        question: "What does |ψ(x)|² represent?",
        options: [
            "The particle's energy",
            "The box length",
            "The probability density",
            "The particle's mass"
        ],
        answer: 2,
        explanation: "The squared magnitude of the wavefunction represents the probability density."
    },
    {
        question: "Which equation gives the energy levels in a 1D infinite potential well?",
        options: [
            "E = mc²",
            "Eₙ = n²π²ℏ² / (2mL²)",
            "F = ma",
            "V = IR"
        ],
        answer: 1,
        explanation: "The energy depends on n, the particle mass m, and the box length L."
    },
    {
        question: "What is the wavefunction at the walls of an ideal infinite potential well?",
        options: [
            "Always zero",
            "Always one",
            "Always infinite",
            "Equal to the energy"
        ],
        answer: 0,
        explanation: "The wavefunction must be zero at x = 0 and x = L for an ideal infinite well."
    }
];

const menuCards = document.querySelectorAll(".menu-card[data-mode]");
const quizSection = document.getElementById("quizSection");
const resultSection = document.getElementById("resultSection");

const modeLabel = document.getElementById("modeLabel");
const quizTitle = document.getElementById("quizTitle");
const backButton = document.getElementById("backButton");

const progressBar = document.getElementById("progressBar");
const questionCount = document.getElementById("questionCount");
const questionText = document.getElementById("questionText");
const optionsContainer = document.getElementById("optionsContainer");
const feedback = document.getElementById("feedback");

const submitButton = document.getElementById("submitButton");
const nextButton = document.getElementById("nextButton");

const resultTitle = document.getElementById("resultTitle");
const scoreValue = document.getElementById("scoreValue");
const resultMessage = document.getElementById("resultMessage");
const retryButton = document.getElementById("retryButton");
const homeButton = document.getElementById("homeButton");

let currentMode = "quiz";
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let hasSubmitted = false;
let previousPreScore = null;

const modeNames = {
    pre: "Pre-test",
    post: "Post-test",
    quiz: "Practice Quiz"
};

function startQuiz(mode) {
    currentMode = mode;
    currentQuestion = 0;
    score = 0;
    selectedAnswer = null;
    hasSubmitted = false;

    quizSection.classList.remove("hidden");
    resultSection.classList.add("hidden");
    document.querySelector(".menu-grid").classList.add("hidden");

    modeLabel.textContent = "ASSESSMENT";
    quizTitle.textContent = modeNames[mode];

    submitButton.classList.remove("hidden");
    nextButton.classList.add("hidden");

    renderQuestion();
}

function renderQuestion() {
    const q = questionBank[currentQuestion];

    selectedAnswer = null;
    hasSubmitted = false;

    questionCount.textContent =
        `Question ${currentQuestion + 1} of ${questionBank.length}`;

    questionText.textContent = q.question;
    feedback.textContent = "";
    optionsContainer.innerHTML = "";

    progressBar.style.width =
        `${(currentQuestion / questionBank.length) * 100}%`;

    submitButton.disabled = true;
    submitButton.classList.remove("hidden");
    nextButton.classList.add("hidden");

    q.options.forEach((option, index) => {
        const button = document.createElement("button");

        button.type = "button";
        button.className = "answer-option";
        button.textContent = option;

        button.addEventListener("click", () => {
            if (hasSubmitted) return;

            selectedAnswer = index;

            optionsContainer.querySelectorAll("button")
                .forEach(item => item.classList.remove("selected"));

            button.classList.add("selected");
            submitButton.disabled = false;
        });

        optionsContainer.appendChild(button);
    });
}

function checkAnswer() {
    if (selectedAnswer === null || hasSubmitted) return;

    hasSubmitted = true;

    const q = questionBank[currentQuestion];
    const buttons = optionsContainer.querySelectorAll("button");

    if (selectedAnswer === q.answer) {
        score++;
    }

    if (currentMode === "quiz") {
        buttons.forEach((button, index) => {
            button.disabled = true;

            if (index === q.answer) {
                button.classList.add("correct");
            } else if (index === selectedAnswer) {
                button.classList.add("incorrect");
            }
        });

        feedback.textContent =
            (selectedAnswer === q.answer ? "Correct! " : "Not quite. ")
            + q.explanation;
    } else {
        buttons.forEach(button => button.disabled = true);
        feedback.textContent = "Answer recorded.";
    }

    submitButton.classList.add("hidden");
    nextButton.classList.remove("hidden");
    nextButton.textContent =
        currentQuestion === questionBank.length - 1
            ? "View Results"
            : "Next Question";

    progressBar.style.width =
        `${((currentQuestion + 1) / questionBank.length) * 100}%`;
}

function showResults() {
    quizSection.classList.add("hidden");
    resultSection.classList.remove("hidden");

    const percentage = Math.round(
        (score / questionBank.length) * 100
    );

    resultTitle.textContent = `${modeNames[currentMode]} Completed`;
    scoreValue.textContent = `${score} / ${questionBank.length}`;

    if (currentMode === "pre") {
        previousPreScore = score;

        try {
            localStorage.setItem("midnightQuantumPreScore", String(score));
        } catch (error) {
            // The quiz still works if browser storage is unavailable.
        }

        resultMessage.textContent =
            `Your starting score is ${percentage}%. Complete the learning activities before taking the post-test.`;

    } else if (currentMode === "post") {
        let savedScore = previousPreScore;

        try {
            const storedScore =
                localStorage.getItem("midnightQuantumPreScore");

            if (storedScore !== null) {
                savedScore = Number(storedScore);
            }
        } catch (error) {
            // Continue without saved comparison data.
        }

        if (savedScore !== null && savedScore !== undefined) {
            const difference = score - savedScore;

            resultMessage.textContent =
                `Post-test score: ${percentage}%. ` +
                `Difference from pre-test: ${difference > 0 ? "+" : ""}${difference} points out of ${questionBank.length}.`;
        } else {
            resultMessage.textContent =
                `Your post-test score is ${percentage}%. Take the pre-test first to compare scores.`;
        }

    } else {
        resultMessage.textContent =
            `You answered ${score} out of ${questionBank.length} questions correctly (${percentage}%).`;
    }
}

menuCards.forEach(card => {
    card.addEventListener("click", () => {
        startQuiz(card.dataset.mode);
    });
});

submitButton.addEventListener("click", checkAnswer);

nextButton.addEventListener("click", () => {
    if (currentQuestion < questionBank.length - 1) {
        currentQuestion++;
        renderQuestion();
    } else {
        showResults();
    }
});

backButton.addEventListener("click", returnHome);
homeButton.addEventListener("click", returnHome);

retryButton.addEventListener("click", () => {
    startQuiz(currentMode);
});

function returnHome() {
    quizSection.classList.add("hidden");
    resultSection.classList.add("hidden");
    document.querySelector(".menu-grid").classList.remove("hidden");
}

returnHome();