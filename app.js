let currentTeam = 0;

let positions = [0, 0, 0, 0];

let skipTurns = [0, 0, 0, 0];

let currentRoll = 0;

let selectedCategory = "Ooststellingwerf";

let gameStarted = false;

let currentQuestion = null;

const board = document.getElementById("board");

const turnText = document.getElementById("turn");

const diceText = document.getElementById("diceResult");

const questionText = document.getElementById("question");

const answerButtons =
document.getElementById("answerButtons");

const explanationText =
document.getElementById("explanation");

const activeCategory =
document.getElementById("activeCategory");

const categorySelect =
document.getElementById("categorySelect");

const screen1 =
document.getElementById("screen1");

const screen2 =
document.getElementById("screen2");

const screen3 =
document.getElementById("screen3");



// GELUIDEN

const soundDice =
new Audio("sounds/dice.mp3");

const soundCorrect =
new Audio("sounds/correct.mp3");

const soundWrong =
new Audio("sounds/wrong.mp3");

const soundGans =
new Audio("sounds/gans.mp3");

const soundBrug =
new Audio("sounds/brug.mp3");

const soundPut =
new Audio("sounds/put.mp3");

const soundPrison =
new Audio("sounds/gevangenis.mp3");

const soundHerberg =
new Audio("sounds/herberg.mp3");

const soundFinish =
new Audio("sounds/finish.mp3");



// SPECIALE VAKKEN

const specialTiles = {

6: "gans",
12: "gans",
18: "herberg",
19: "put",
25: "beurtoverslaan",
31: "brug",
37: "gans",
52: "gevangenis",
79: "put",
95: "put",
111: "gevangenis",
140: "finish"

};



// BORD MAKEN

for(let i = 1; i <= 140; i++) {

const cell =
document.createElement("div");

cell.classList.add("cell");



if(specialTiles[i]) {

cell.classList.add("special");



if(specialTiles[i] === "gans") {

cell.classList.add("gans");

cell.innerHTML = i + "<br>🪿";

}



else if(specialTiles[i] === "brug") {

cell.classList.add("brug");

cell.innerHTML = i + "<br>🌉";

}



else if(specialTiles[i] === "put") {

cell.classList.add("put");

cell.innerHTML = i + "<br>🕳️";

}



else if(specialTiles[i] === "gevangenis") {

cell.classList.add("gevangenis");

cell.innerHTML = i + "<br>⛓️";

}



else if(specialTiles[i] === "herberg") {

cell.classList.add("herberg");

cell.innerHTML = i + "<br>🍺";

}



else if(specialTiles[i] === "beurtoverslaan") {

cell.classList.add("overslaan");

cell.innerHTML = i + "<br>⏭️";

}



else if(specialTiles[i] === "finish") {

cell.classList.add("finish");

cell.innerHTML = i + "<br>🏆";

}

}



else {

cell.innerHTML = i;

}



board.appendChild(cell);

}



updateBoard();

updateCategoryDisplay();

showScreen(1);



// CATEGORIE WIJZIGEN

categorySelect.addEventListener(
"change",

function(){

if(gameStarted) return;

selectedCategory =
categorySelect.value;

updateCategoryDisplay();

}

);



// DOBBELEN

function rollDice() {

if(skipTurns[currentTeam] > 0){

skipTurns[currentTeam]--;

alert(
"Dit team moet een beurt overslaan."
);

nextTeam();

return;

}



if(!gameStarted){

gameStarted = true;

lockCategory();

}



currentRoll =
Math.floor(Math.random() * 6) + 1;



soundDice.play();



diceText.innerText =
"🎲 Gegooid: " +
currentRoll;



showScreen(2);



loadQuestion();

}



// VRAGEN LADEN

function loadQuestion() {

const filteredQuestions =
vragen.filter(

q =>
q.categorie ===
selectedCategory

);



currentQuestion =
filteredQuestions[
Math.floor(
Math.random() *
filteredQuestions.length
)
];



questionText.innerText =
currentQuestion.vraag;



answerButtons.innerHTML = "";



const answers = [

{
key:"a",
text:currentQuestion.a
},

{
key:"b",
text:currentQuestion.b
},

{
key:"c",
text:currentQuestion.c
}

];



answers.forEach(answer => {

const button =
document.createElement("button");

button.classList.add(
"answerButton"
);

button.innerText =
answer.key +
") " +
answer.text;



button.onclick =
function(){

checkAnswer(
answer.key,
button
);

};



answerButtons.appendChild(
button
);

});



explanationText.innerText = "";

}



// ANTWOORD CONTROLEREN

function checkAnswer(
chosen,
clickedButton
){

const buttons =
document.querySelectorAll(
".answerButton"
);



buttons.forEach(button => {

button.disabled = true;

});



buttons.forEach(button => {

if(
button.innerText.startsWith(
currentQuestion.correct
)
){

button.style.background =
"green";

}



else if(button === clickedButton){

button.style.background =
"red";

}

});



explanationText.innerText =
currentQuestion.uitleg;



if(
chosen ===
currentQuestion.correct
){

soundCorrect.play();



setTimeout(function(){

movePlayer();

}, 2500);

}



else {

soundWrong.play();



setTimeout(function(){

nextTeam();

showScreen(1);

}, 2500);

}

}



// SPELER VERPLAATSEN

async function movePlayer(){

showScreen(3);



for(
let i = 0;
i < currentRoll;
i++
){

positions[currentTeam]++;



updateBoard();



await sleep(350);

}



handleSpecialTile();

}



// SPECIALE VAKKEN

async function handleSpecialTile(){

let pos =
positions[currentTeam];

let tile =
specialTiles[pos];



if(!tile){

finishTurn();

return;

}



// GANS

if(tile === "gans"){

soundGans.play();



showMessage(
"🪿 Gans! Ga 6 vakjes vooruit!"
);



await sleep(2500);



for(let i=0;i<6;i++){

positions[currentTeam]++;

updateBoard();

await sleep(350);

}

}



// BRUG

if(tile === "brug"){

soundBrug.play();



showMessage(
"🌉 Brug! Ga naar vak 30!"
);



await sleep(2500);



while(
positions[currentTeam] < 30
){

positions[currentTeam]++;

updateBoard();

await sleep(200);

}

}



// PUT

if(tile === "put"){

soundPut.play();



skipTurns[currentTeam] = 1;



showMessage(
"🕳️ In de put! 1 beurt overslaan."
);

}



// GEVANGENIS

if(tile === "gevangenis"){

soundPrison.play();



skipTurns[currentTeam] = 2;



showMessage(
"⛓️ Gevangenis! 2 beurten overslaan."
);

}



// HERBERG

if(tile === "herberg"){

soundHerberg.play();



skipTurns[currentTeam] = 1;



showMessage(
"🍺 Herberg! 1 beurt rusten."
);

}



// EXTRA OVERSLAAN

if(tile === "beurtoverslaan"){

soundPut.play();



skipTurns[currentTeam] = 1;



showMessage(
"⏭️ Beurt overslaan!"
);

}



// FINISH

if(
positions[currentTeam] >= 140
){

soundFinish.play();



showMessage(
"🏆 Team wint het spel!"
);



return;

}



finishTurn();

}



// BEURT AFRONDEN

function finishTurn(){

setTimeout(function(){

nextTeam();

showScreen(1);

}, 3000);

}



// VOLGEND TEAM

function nextTeam(){

currentTeam++;



if(currentTeam > 3){

currentTeam = 0;

}



turnText.innerText =
"Beurt: Team " +
(currentTeam + 1);

}



// BORD BIJWERKEN

function updateBoard(){

const cells =
document.querySelectorAll(
".cell"
);



cells.forEach(cell => {

cell.innerHTML =
cell.innerHTML
.replace("🔴","")
.replace("🔵","")
.replace("🟢","")
.replace("🟡","");

});



const teamIcons = [

"🔴",
"🔵",
"🟢",
"🟡"

];



positions.forEach((pos,index)=>{

if(pos > 0){

cells[pos - 1].innerHTML +=
"<br>" +
teamIcons[index];

}

});

}



// CATEGORIE TONEN

function updateCategoryDisplay(){

activeCategory.innerText =
"Categorie: " +
selectedCategory;

}



// CATEGORIE VERGRENDELEN

function lockCategory(){

categorySelect.disabled = true;

}



// SCHERMEN

function showScreen(number){

screen1.style.display = "none";

screen2.style.display = "none";

screen3.style.display = "none";



if(number === 1){

screen1.style.display = "block";

}



if(number === 2){

screen2.style.display = "block";

}



if(number === 3){

screen3.style.display = "block";

}

}



// MELDINGEN

function showMessage(text){

diceText.innerText = text;

}



// WACHTFUNCTIE

function sleep(ms){

return new Promise(resolve =>
setTimeout(resolve, ms)
);

}
