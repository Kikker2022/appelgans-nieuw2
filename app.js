let currentTeam = 0;

let selectedCategory = "Ooststellingwerf";
let activeTeams = 4;

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

function showScreen(screen) {
screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");
screen.classList.remove("hidden");
}

function startGame() {
selectedCategory = document.getElementById("categorySelect").value;
activeTeams = parseInt(document.getElementById("teamCount").value);

document.getElementById("categorySelect").disabled = true;
document.getElementById("teamCount").disabled = true;

showScreen(screen1);
updateTurn();
}

function getActiveTeams() {
return teams.slice(0, activeTeams);
}

function updateTurn() {
const team = getActiveTeams()[currentTeam];
turnText.innerText = team.icon + " is aan de beurt";
}

function nextTurn() {
currentTeam++;
if (currentTeam >= activeTeams) currentTeam = 0;

const team = getActiveTeams()[currentTeam];

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

btnA.disabled = false;
btnB.disabled = false;
btnC.disabled = false;

btnA.className = "answerBtn";
btnB.className = "answerBtn";
btnC.className = "answerBtn";

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

await sleep(2000);

showScreen(screen3);

const team = getActiveTeams()[currentTeam];

for (let i = 0; i < lastRoll; i++) {
if (team.position < TOTAL_CELLS) {
team.position++;
updateBoard();
await sleep(250);
}
}

await handleSpecial(team);

if (team.position >= TOTAL_CELLS) {
soundWin.play();
showPopup(team.icon + " heeft gewonnen!");
return;
}

nextTurn();

setTimeout(() => {
showScreen(screen1);
}, 2500);

} else {

document.getElementById("btn" + choice.toUpperCase()).classList.add("wrong");
document.getElementById("btn" + correct.toUpperCase()).classList.add("correct");

explanationText.innerText = "Fout! " + currentQuestion.uitleg;

setTimeout(() => {
nextTurn();
showScreen(screen1);
}, 2500);
}
}

async function handleSpecial(team) {
const type = specialTiles[team.position];
if (!type) return;

if (type === "gans") {
soundGans.play();
for (let i = 0; i < 6; i++) {
team.position++;
updateBoard();
await sleep(200);
}
}

if (type === "brug") {
soundBridge.play();
while (team.position < 30) {
team.position++;
updateBoard();
await sleep(150);
}
}

if (type === "put") {
soundPut.play();
team.skipTurns = 1;
}

if (type === "gevangenis") {
soundPrison.play();
team.skipTurns = 2;
}

if (type === "herberg") {
soundInn.play();
team.skipTurns = 1;
}
}

updateBoard();
showScreen(screen0);
