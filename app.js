let currentTeam = 0;
let positions = [0,0,0,0];

let currentRoll = 0;
let selectedCategory = "Ooststellingwerf";
let currentQuestion = null;


// ELEMENTEN
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


// GELUIDEN (controleer pad!)
const soundDice = new Audio("public/sounds/dice.mp3");
const soundCorrect = new Audio("public/sounds/correct.mp3");
const soundWrong = new Audio("public/sounds/wrong.mp3");


// SPECIALS
const specialTiles = {
6:"gans",
12:"gans",
18:"herberg",
19:"put",
25:"skip",
31:"brug",
37:"gans",
52:"gevangenis",
79:"put",
95:"put",
111:"gevangenis",
140:"finish"
};


// ======================
// SCHERM FUNCTIE (CRUCIAAL)
// ======================
function showScreen(n){

screen1.style.display = "none";
screen2.style.display = "none";
screen3.style.display = "none";

if(n === 1) screen1.style.display = "block";
if(n === 2) screen2.style.display = "block";
if(n === 3) screen3.style.display = "block";

}


// START
showScreen(1);


// CATEGORIE
categorySelect.addEventListener("change", () => {
selectedCategory = categorySelect.value;
});


// ======================
// DOBBELEN
// ======================
function rollDice(){

currentRoll = Math.floor(Math.random()*6)+1;

diceText.innerText = "🎲 Gegooid: " + currentRoll;

soundDice.play();

// altijd naar vraag scherm
showScreen(2);

loadQuestion();
}


// ======================
// VRAGEN
// ======================
function loadQuestion(){

const pool = vragen.filter(q =>
q.categorie === selectedCategory
);

currentQuestion =
pool[Math.floor(Math.random()*pool.length)];

questionText.innerText = currentQuestion.vraag;

answerButtons.innerHTML = "";

["a","b","c"].forEach(key => {

const btn = document.createElement("button");

btn.className = "answerButton";

btn.innerText = key.toUpperCase() + ") " + currentQuestion[key];

btn.onclick = () => checkAnswer(key);

answerButtons.appendChild(btn);

});

explanationText.innerText = "";
}


// ======================
// ANTWOORD CHECK
// ======================
function checkAnswer(choice){

const buttons = document.querySelectorAll(".answerButton");

buttons.forEach(b => b.disabled = true);

buttons.forEach(b => {

if(b.innerText.startsWith(
currentQuestion.correct.toUpperCase()
)){
b.style.background = "green";
}

});

if(choice === currentQuestion.correct){

soundCorrect.play();

setTimeout(() => {

movePlayer();

}, 1200);

}else{

soundWrong.play();

setTimeout(() => {

nextTurn();
showScreen(1);

}, 1200);

}

}


// ======================
// VERPLAATSEN (BELANGRIJK)
// ======================
function movePlayer(){

showScreen(3);

for(let i=0;i<currentRoll;i++){
positions[currentTeam]++;
updateBoard();
}

setTimeout(() => {

nextTurn();
showScreen(1);

}, 800);

}


// ======================
// BOARD UPDATE
// ======================
function updateBoard(){

const cells = document.querySelectorAll(".cell");

cells.forEach(c => {
c.innerHTML = c.innerHTML.replace(/🔴|🔵|🟢|🟡/g,"");
});

const icons = ["🔴","🔵","🟢","🟡"];

positions.forEach((pos,i)=>{

if(pos>0 && cells[pos-1]){
cells[pos-1].innerHTML += "<br>"+icons[i];
}

});

}


// ======================
// TURN
// ======================
function nextTurn(){

currentTeam++;

if(currentTeam > 3) currentTeam = 0;

turnText.innerText =
"Team " + (currentTeam+1) + " is aan de beurt";

}


// ======================
// INIT BOARD (BELANGRIJK)
// ======================
function initBoard(){

board.innerHTML = "";

for(let i=1;i<=140;i++){

const cell = document.createElement("div");

cell.className = "cell";

if(specialTiles[i]){
cell.classList.add("special");
cell.innerText = i;
}else{
cell.innerText = i;
}

board.appendChild(cell);
}

}

initBoard();
updateBoard();
