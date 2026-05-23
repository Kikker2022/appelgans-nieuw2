let currentTeam = 0;

let positions = [0, 0, 0, 0];

let skipTurns = [0, 0, 0, 0];

let currentRoll = 0;

let selectedCategory = "Ooststellingwerf";

let gameStarted = false;

let currentQuestion = null;


// DOM ELEMENTEN
const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const diceText = document.getElementById("diceResult");

const questionText = document.getElementById("question");
const answerButtons = document.getElementById("answerButtons");
const explanationText = document.getElementById("explanation");

const categorySelect = document.getElementById("categorySelect");

const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");


// GELUIDEN
const soundDice = new Audio("public/sounds/dice.mp3");
const soundCorrect = new Audio("public/sounds/correct.mp3");
const soundWrong = new Audio("public/sounds/wrong.mp3");
const soundGans = new Audio("public/sounds/gans.mp3");
const soundFinish = new Audio("public/sounds/finish.mp3");


// SPECIALE VAKKEN
const specialTiles = {
  6: "gans",
  12: "gans",
  18: "herberg",
  19: "put",
  25: "skip",
  31: "brug",
  37: "gans",
  52: "gevangenis",
  79: "put",
  95: "put",
  111: "gevangenis",
  140: "finish"
};


// BORD MAKEN
for (let i = 1; i <= 140; i++) {
  const cell = document.createElement("div");
  cell.classList.add("cell");

  if (specialTiles[i]) {
    cell.classList.add("special");
    cell.innerHTML = i;
  } else {
    cell.innerHTML = i;
  }

  board.appendChild(cell);
}


// CATEGORIE SELECTIE
categorySelect.addEventListener("change", function () {
  if (gameStarted) return;
  selectedCategory = categorySelect.value;
});


// DOBBELEN
function rollDice() {

  currentRoll = Math.floor(Math.random() * 6) + 1;

  diceText.innerText = "🎲 Gegooid: " + currentRoll;

  soundDice.play();

  gameStarted = true;

  categorySelect.disabled = true;

  showScreen(2);

  loadQuestion();
}


// VRAGEN LADEN
function loadQuestion() {

  const pool = vragen.filter(q => q.categorie === selectedCategory);

  currentQuestion = pool[Math.floor(Math.random() * pool.length)];

  questionText.innerText = currentQuestion.vraag;

  answerButtons.innerHTML = "";

  const options = [
    { key: "a", text: currentQuestion.a },
    { key: "b", text: currentQuestion.b },
    { key: "c", text: currentQuestion.c }
  ];

  options.forEach(opt => {

    const btn = document.createElement("button");
    btn.classList.add("answerButton");

    btn.innerText = opt.key.toUpperCase() + ") " + opt.text;

    btn.onclick = () => checkAnswer(opt.key, btn);

    answerButtons.appendChild(btn);
  });

  explanationText.innerText = "";
}


// ANTWOORD CONTROLEREN
function checkAnswer(choice, btn) {

  const buttons = document.querySelectorAll(".answerButton");

  buttons.forEach(b => b.disabled = true);

  buttons.forEach(b => {

    if (b.innerText.startsWith(currentQuestion.correct.toUpperCase())) {
      b.style.background = "green";
    }

    if (b === btn && choice !== currentQuestion.correct) {
      b.style.background = "red";
    }
  });

  explanationText.innerText = currentQuestion.uitleg;

  if (choice === currentQuestion.correct) {

    soundCorrect.play();

    setTimeout(() => {
      movePlayer();
    }, 2000);

  } else {

    soundWrong.play();

    setTimeout(() => {
      nextTurn();
      showScreen(1);
    }, 2000);
  }
}


// SPELER VERPLAATSEN
async function movePlayer() {

  showScreen(3);

  for (let i = 0; i < currentRoll; i++) {
    positions[currentTeam]++;
    updateBoard();
    await sleep(200);
  }

  handleSpecial();
}


// SPECIALE VAKKEN
function handleSpecial() {

  const tile = specialTiles[positions[currentTeam]];

  if (tile === "gans") {
    soundGans.play();
    positions[currentTeam] += 6;
  }

  if (tile === "skip") {
    skipTurns[currentTeam] = 1;
  }

  if (tile === "gevangenis") {
    skipTurns[currentTeam] = 2;
  }

  if (tile === "finish") {
    soundFinish.play();
    alert("Team wint!");
    return;
  }

  setTimeout(() => {
    nextTurn();
    showScreen(1);
  }, 1500);
}


// VOLGENDE BEURT
function nextTurn() {
  currentTeam++;

  if (currentTeam > 3) currentTeam = 0;

  turnText.innerText = "Team " + (currentTeam + 1) + " is aan de beurt";
}


// BORD UPDATE
function updateBoard() {

  const cells = document.querySelectorAll(".cell");

  cells.forEach(c => {
    c.innerHTML = c.innerHTML.replace(/🔴|🔵|🟢|🟡/g, "");
  });

  const icons = ["🔴", "🔵", "🟢", "🟡"];

  positions.forEach((pos, i) => {
    if (pos > 0 && cells[pos - 1]) {
      cells[pos - 1].innerHTML += "<br>" + icons[i];
    }
  });
}


// SCHERMEN
function showScreen(n) {

  screen1.style.display = "none";
  screen2.style.display = "none";
  screen3.style.display = "none";

  if (n === 1) screen1.style.display = "block";
  if (n === 2) screen2.style.display = "block";
  if (n === 3) screen3.style.display = "block";
}


// WACHTEN
function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}


// START
updateBoard();
showScreen(1);
