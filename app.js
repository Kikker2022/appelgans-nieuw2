let currentTeam = 0;
let activeTeams = 4;

let selectedCategory = "Ooststellingwerf";

let lastRoll = 0;
let currentQuestion = null;

const TOTAL_CELLS = 140;

const teams = [
{ name: "Blauw", color: "blue", icon: "🔵", position: 0, skipTurns: 0 },
{ name: "Rood", color: "red", icon: "🔴", position: 0, skipTurns: 0 },
{ name: "Groen", color: "green", icon: "🟢", position: 0, skipTurns: 0 },
{ name: "Paars", color: "purple", icon: "🟣", position: 0, skipTurns: 0 }
];

const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const diceText = document.getElementById("diceResult");
const statusMessage = document.getElementById("statusMessage");
const questionText = document.getElementById("question");
const explanationText = document.getElementById("explanation");

const btnA = document.getElementById("btnA");
const btnB = document.getElementById("btnB");
const btnC = document.getElementById("btnC");

const popup = document.getElementById("popup");

const screen0 = document.getElementById("screen0");
const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");

const soundGans = new Audio("public/gans.mp3");
const soundBridge = new Audio("public/brug.mp3");
const soundPut = new Audio("public/put.mp3");
const soundPrison = new Audio("public/gevangenis.mp3");
const soundInn = new Audio("public/herberg.mp3");
const soundWin = new Audio("public/finish.mp3");

const categorySelect = document.getElementById("categorySelect");
const teamCountSelect = document.getElementById("teamCount");

function startGame() {
selectedCategory = categorySelect.value;
activeTeams = parseInt(teamCountSelect.value);

categorySelect.disabled = true;
teamCountSelect.disabled = true;

categorySelect.style.pointerEvents = "none";
teamCountSelect.style.pointerEvents = "none";

categorySelect.style.opacity = "0.6";
teamCountSelect.style.opacity = "0.6";

showScreen(screen1);
updateTurn();
}

function sleep(ms) {
return new Promise(resolve => setTimeout(resolve, ms));
}

function showScreen(screen) {
screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");
screen.classList.remove("hidden");
}

function showPopup(text) {
popup.innerText = text;
popup.style.display = "block";
setTimeout(() => popup.style.display = "none", 3000);
}

for (let i = 1; i <= TOTAL_CELLS; i++) {
const cell = document.createElement("div");
cell.classList.add("cell");

if (specialTiles[i]) {
cell.classList.add(specialTiles[i]);
}

let icon = "";
if (specialTiles[i] === "gans") icon = "🪿";
if (specialTiles[i] === "brug") icon = "🌉";
if (specialTiles[i] === "put") icon = "🕳";
if (specialTiles[i] === "gevangenis") icon = "🔒";
if (specialTiles[i] === "herberg") icon = "🍺";
if (specialTiles[i] === "finish") icon = "🏁";

cell.innerHTML = `
<div>${i}</div>
<span>${icon}</span>
<div class="pawns"></div>
`;

board.appendChild(cell);
}

function updateBoard() {
document.querySelectorAll(".pawns").forEach(p => p.innerHTML = "");

teams.slice(0, activeTeams).forEach(team => {
if (team.position > 0) {
const cell = document.querySelectorAll(".cell")[team.position - 1];
const pawn = document.createElement("div");
pawn.classList.add("pawn", team.color);
cell.querySelector(".pawns").appendChild(pawn);
}
});
}

function updateTurn() {
const team = teams[currentTeam];
turnText.innerText = team.icon + " is aan de beurt";
}

function nextTurn() {
currentTeam++;
if (currentTeam >= activeTeams) currentTeam = 0;

const team = teams[currentTeam];

if (team.skipTurns > 0) {
team.skipTurns--;
statusMessage.innerText = team.icon + " moet een beurt overslaan.";
setTimeout(() => {
nextTurn();
showScreen(screen1);
}, 1500);
return;
}

diceText.innerText = "";
updateTurn();
}

function rollDice() {
const roll = Math.floor(Math.random() * 6) + 1;
lastRoll = roll;

diceText.innerText = "🎲 Je gooide: " + roll;
statusMessage.innerText = "";

setTimeout(() => {
showScreen(screen2);
loadQuestion();
}, 1500);
}

function loadQuestion() {
const actieveVragen = vragen.filter(v => v.categorie === selectedCategory);
const q = actieveVragen[Math.floor(Math.random() * actieveVragen.length)];

currentQuestion = q;

questionText.innerText = q.vraag;
btnA.innerText = "A: " + q.a;
btnB.innerText = "B: " + q.b;
btnC.innerText = "C: " + q.c;

btnA.className = "answerBtn";
btnB.className = "answerBtn";
btnC.className = "answerBtn";

btnA.disabled = false;
btnB.disabled = false;
btnC.disabled = false;

explanationText.innerText = "";
}

async function checkAnswer(choice) {
btnA.disabled = true;
btnB.disabled = true;
btnC.disabled = true;

const correct = currentQuestion.correct;

if (choice === correct) {
document.getElementById("btn" + choice.toUpperCase()).classList.add("correct");

explanationText.innerText = "Goed! " + currentQuestion.uitleg;

await sleep(2500);

showScreen(screen3);

const team = teams[currentTeam];

for (let i = 0; i < lastRoll; i++) {
if (team.position < TOTAL_CELLS) {
team.position++;
updateBoard();
await sleep(350);
}
}

await handleSpecial(team);

if (team.position >= TOTAL_CELLS) {
soundWin.play();
showPopup(team.icon + " heeft gewonnen!");
return;
}

nextTurn();

setTimeout(() => showScreen(screen1), 3500);

} else {
document.getElementById("btn" + choice.toUpperCase()).classList.add("wrong");
document.getElementById("btn" + correct.toUpperCase()).classList.add("correct");

explanationText.innerText = "❌ Fout! " + currentQuestion.uitleg;

setTimeout(() => {
nextTurn();
showScreen(screen1);
}, 3500);
}
}

async function handleSpecial(team) {
const type = specialTiles[team.position];
if (!type) return;

if (type === "gans") {
soundGans.play();
statusMessage.innerText = team.icon + " landde op een gans! +6";

await sleep(1500);

for (let i = 0; i < 6; i++) {
if (team.position < TOTAL_CELLS) {
team.position++;
updateBoard();
await sleep(350);
}
}
}

if (type === "brug") {
soundBridge.play();
statusMessage.innerText = team.icon + " over de brug naar vak 30!";

await sleep(2000);

while (team.position < 30) {
team.position++;
updateBoard();
await sleep(250);
}
}

if (type === "herberg") {
soundInn.play();
team.skipTurns = 1;
statusMessage.innerText = team.icon + " moet 1 beurt overslaan.";
}

if (type === "put") {
soundPut.play();
team.skipTurns = 1;
statusMessage.innerText = team.icon + " zit in de put!";
}

if (type === "gevangenis") {
soundPrison.play();
team.skipTurns = 2;
statusMessage.innerText = team.icon + " zit in de gevangenis!";
}
}

updateTurn();
updateBoard();
showScreen(screen0);
