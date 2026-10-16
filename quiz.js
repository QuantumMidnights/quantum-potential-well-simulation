/* MidnightQuantum Learning Assessment
   Prototype only: scores are stored locally in this browser. */
const questionBank = [
  { question: "In the simplified classical model, which statement best describes the particle's energy?", options: ["It must always be one of a fixed set of levels", "It can be selected from a continuous range of values", "It is always zero", "It depends only on the colour of the graph"], answer: 1, explanation: "In this simplified classical model, energy is treated as a continuous parameter." },
  { question: "For a particle in an ideal one-dimensional infinite box, what happens to energy when quantum number n increases while L stays fixed?", options: ["Energy decreases", "Energy stays the same", "Energy increases", "Energy becomes negative"], answer: 2, explanation: "The energy is proportional to n², so higher quantum numbers have higher energies." },
  { question: "For the same quantum number n, what happens to the energy when box length L increases?", options: ["It increases", "It decreases", "It stays exactly the same", "It becomes infinite"], answer: 1, explanation: "Eₙ is proportional to 1/L². A wider box gives lower energy for the same n." },
  { question: "What does |ψ(x)|² represent in the position representation?", options: ["The particle's mass", "The probability density", "The box length", "The potential energy everywhere"], answer: 1, explanation: "The squared magnitude of the wavefunction gives the position probability density." },
  { question: "Which expression describes the energy levels for an ideal 1D infinite potential well?", options: ["Eₙ = n²π²ħ²/(2mL²)", "E = mc² only", "F = ma", "V = IR"], answer: 0, explanation: "The energy depends on quantum number n, mass m, and box length L." },
  { question: "For an ideal infinite potential well extending from x = 0 to x = L, what boundary condition applies to the wavefunction at the walls?", options: ["ψ is always 1", "ψ is zero at both walls", "ψ equals the energy", "ψ is undefined throughout the box"], answer: 1, explanation: "For the ideal infinite well, the wavefunction is zero at x = 0 and x = L." },
  { question: "What does 'quantized energy' mean in the ideal quantum box model?", options: ["The particle can have any energy value", "Only certain allowed energy values are possible for stationary states", "Energy has no units in any model", "Energy changes randomly every second"], answer: 1, explanation: "Quantized means the stationary-state energy can take only certain allowed values." },
  { question: "If L doubles and n remains the same, what happens to Eₙ in the ideal box model?", options: ["It doubles", "It becomes four times larger", "It becomes one quarter as large", "It does not change"], answer: 2, explanation: "Because Eₙ ∝ 1/L², doubling L reduces the energy to 1/4 of its original value." },
  { question: "Which is a key difference between the simplified classical and ideal quantum models used on this website?", options: ["Classical energy is continuous, while the quantum box has discrete allowed levels", "Both models always have exactly the same energy levels", "Quantum mechanics does not use energy", "Classical particles are described by a wavefunction in this model"], answer: 0, explanation: "The simplified classical model allows a continuous range, while the ideal quantum box has discrete allowed energy levels." },
  { question: "The Double Well page shows an adjustable potential profile. What does that graph alone calculate?", options: ["All quantum eigenstates and tunnelling rates", "The exact measured energy of an electron", "The illustrative potential shape, not quantum eigenstates by itself", "The student's test score"], answer: 2, explanation: "The page explicitly presents an illustrative potential profile; solving for eigenstates or tunnelling requires additional quantum calculations." }
];
const menuGrid = document.querySelector('.menu-grid');
const menuCards = document.querySelectorAll('.menu-card[data-mode]');
const quizSection = document.getElementById('quizSection');
const resultSection = document.getElementById('resultSection');
const surveySection = document.getElementById('surveySection');
const modeLabel = document.getElementById('modeLabel');
const quizTitle = document.getElementById('quizTitle');
const backButton = document.getElementById('backButton');
const progressBar = document.getElementById('progressBar');
const questionCount = document.getElementById('questionCount');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const feedback = document.getElementById('feedback');
const submitButton = document.getElementById('submitButton');
const nextButton = document.getElementById('nextButton');
const resultTitle = document.getElementById('resultTitle');
const scoreValue = document.getElementById('scoreValue');
const resultMessage = document.getElementById('resultMessage');
const retryButton = document.getElementById('retryButton');
const homeButton = document.getElementById('homeButton');
const exportButton = document.getElementById('exportButton');
let currentMode = 'quiz';
let currentQuestion = 0;
let score = 0;
let selectedAnswer = null;
let hasSubmitted = false;
let lastResult = null;
const modeNames = { pre: 'Pre-test', post: 'Post-test', quiz: 'Practice Quiz' };

function readLocal(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
function writeLocal(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
function startQuiz(mode) {
  currentMode = mode; currentQuestion = 0; score = 0; selectedAnswer = null; hasSubmitted = false;
  quizSection.classList.remove('hidden'); resultSection.classList.add('hidden'); surveySection?.classList.add('hidden'); menuGrid.classList.add('hidden');
  modeLabel.textContent = mode === 'quiz' ? 'PRACTICE' : 'LEARNING ASSESSMENT';
  quizTitle.textContent = modeNames[mode]; submitButton.classList.remove('hidden'); nextButton.classList.add('hidden'); renderQuestion();
}
function renderQuestion() {
  const q = questionBank[currentQuestion]; selectedAnswer = null; hasSubmitted = false;
  questionCount.textContent = `Question ${currentQuestion + 1} of ${questionBank.length}`;
  questionText.textContent = q.question; feedback.textContent = ''; optionsContainer.replaceChildren();
  progressBar.style.width = `${(currentQuestion / questionBank.length) * 100}%`;
  submitButton.disabled = true; submitButton.classList.remove('hidden'); nextButton.classList.add('hidden');
  q.options.forEach((option, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'answer-option'; button.textContent = option;
    button.addEventListener('click', () => { if (hasSubmitted) return; selectedAnswer = index; optionsContainer.querySelectorAll('button').forEach(item => item.classList.remove('selected')); button.classList.add('selected'); submitButton.disabled = false; });
    optionsContainer.appendChild(button);
  });
}
function checkAnswer() {
  if (selectedAnswer === null || hasSubmitted) return;
  hasSubmitted = true; const q = questionBank[currentQuestion]; const buttons = optionsContainer.querySelectorAll('button');
  if (selectedAnswer === q.answer) score++;
  buttons.forEach((button, index) => { button.disabled = true; if (currentMode === 'quiz' && index === q.answer) button.classList.add('correct'); else if (currentMode === 'quiz' && index === selectedAnswer && selectedAnswer !== q.answer) button.classList.add('incorrect'); });
  feedback.textContent = currentMode === 'quiz' ? `${selectedAnswer === q.answer ? 'Correct! ' : 'Not quite. '}${q.explanation}` : 'Answer recorded.';
  submitButton.classList.add('hidden'); nextButton.classList.remove('hidden'); nextButton.textContent = currentQuestion === questionBank.length - 1 ? 'View Results' : 'Next Question';
  progressBar.style.width = `${((currentQuestion + 1) / questionBank.length) * 100}%`;
}
function showResults() {
  quizSection.classList.add('hidden'); resultSection.classList.remove('hidden');
  const percentage = Math.round(score / questionBank.length * 100);
  lastResult = { mode: currentMode, score, total: questionBank.length, percentage, date: new Date().toISOString() };
  resultTitle.textContent = `${modeNames[currentMode]} Completed`; scoreValue.textContent = `${score} / ${questionBank.length}`;
  if (currentMode === 'pre') {
    writeLocal('mqAssessmentPre', JSON.stringify(lastResult));
    resultMessage.textContent = `Starting score: ${percentage}%. Explore the simulations and learning activities before taking the post-test.`;
  } else if (currentMode === 'post') {
    let pre = null; try { pre = JSON.parse(readLocal('mqAssessmentPre') || 'null'); } catch (_) {}
    if (pre && Number.isFinite(pre.score)) {
      const difference = score - pre.score;
      resultMessage.textContent = `Post-test score: ${percentage}%. Change from pre-test: ${difference > 0 ? '+' : ''}${difference} points (${difference > 0 ? 'higher' : difference < 0 ? 'lower' : 'unchanged'}). This is a score difference, not by itself proof that the website caused a learning improvement.`;
      lastResult.preScore = pre.score; lastResult.scoreDifference = difference;
    } else resultMessage.textContent = `Post-test score: ${percentage}%. No pre-test score was found in this browser. Take the pre-test first if you want to compare results.`;
    writeLocal('mqAssessmentPost', JSON.stringify(lastResult));
  } else resultMessage.textContent = `You answered ${score} out of ${questionBank.length} questions correctly (${percentage}%). Review the explanations and try again.`;
  exportButton?.classList.remove('hidden');
}
function showSurvey() { quizSection.classList.add('hidden'); resultSection.classList.add('hidden'); menuGrid.classList.add('hidden'); surveySection.classList.remove('hidden'); }
function returnHome() { quizSection.classList.add('hidden'); resultSection.classList.add('hidden'); surveySection?.classList.add('hidden'); menuGrid.classList.remove('hidden'); }
function csvEscape(value) { return `"${String(value ?? '').replace(/"/g, '""')}"`; }
function downloadCSV(filename, rows) {
  const csv = '\uFEFF' + rows.map(row => row.map(csvEscape).join(',')).join('\r\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
}
menuCards.forEach(card => card.addEventListener('click', () => startQuiz(card.dataset.mode)));
document.getElementById('surveyCard')?.addEventListener('click', showSurvey);
submitButton.addEventListener('click', checkAnswer);
nextButton.addEventListener('click', () => currentQuestion < questionBank.length - 1 ? (currentQuestion++, renderQuestion()) : showResults());
backButton.addEventListener('click', returnHome); homeButton.addEventListener('click', returnHome); retryButton.addEventListener('click', () => startQuiz(currentMode));
exportButton?.addEventListener('click', () => {
  if (!lastResult) return;
  const rows = [['Assessment', 'Score', 'Total questions', 'Percentage', 'Completed at', 'Pre-test score', 'Score difference'], [modeNames[lastResult.mode], lastResult.score, lastResult.total, lastResult.percentage, lastResult.date, lastResult.preScore ?? '', lastResult.scoreDifference ?? '']];
  downloadCSV('midnightquantum-assessment-result.csv', rows);
});
document.getElementById('saveSurveyButton')?.addEventListener('click', () => {
  const form = document.getElementById('feedbackSurvey'); const status = document.getElementById('surveyStatus');
  const data = [...form.querySelectorAll('select, textarea')];
  if (data.some(el => !el.value.trim())) { status.textContent = 'Please answer every survey item before saving.'; return; }
  const record = { completedAt: new Date().toISOString(), responses: Object.fromEntries(data.map(el => [el.name, el.value])) };
  const ok = writeLocal('mqLearningSurvey', JSON.stringify(record));
  status.textContent = ok ? 'Feedback saved in this browser. It has not been sent to your teacher or uploaded to a server.' : 'Browser storage is unavailable. You can still export your feedback as a CSV file.';
  document.getElementById('exportSurveyButton').classList.remove('hidden');
});
document.getElementById('exportSurveyButton')?.addEventListener('click', () => {
  let record; try { record = JSON.parse(readLocal('mqLearningSurvey') || 'null'); } catch (_) {}
  if (!record) { document.getElementById('surveyStatus').textContent = 'Save your feedback first, then export it.'; return; }
  downloadCSV('midnightquantum-learning-feedback.csv', [['Completed at', 'Item', 'Response'], ...Object.entries(record.responses).map(([k, v]) => [record.completedAt, k, v])]);
});
returnHome();
