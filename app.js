const screen1 =
document.getElementById("screen1");

const screen2 =
document.getElementById("screen2");

const screen3 =
document.getElementById("screen3");

const TOTAL_CELLS = 140;

let currentTeam = 0;

const teams = [
{ color:"blue", icon:"🔵", position:0, skipTurns:0 },
{ color:"red", icon:"🔴", position:0, skipTurns:0 },
{ color:"green", icon:"🟢", position:0, skipTurns:0 },
{ color:"purple", icon:"🟣", position:0, skipTurns:0 }
];

const board = document.getElementById("board");
const turnText = document.getElementById("turn");
const diceText = document.getElementById("diceResult");
const questionText = document.getElementById("question");
const explanationText =
document.getElementById("explanation");

const btnA =
document.getElementById("btnA");

const btnB =
document.getElementById("btnB");

const btnC =
document.getElementById("btnC");

let currentQuestion = null;
const popup = document.getElementById("popup");

const soundGans = new Audio("public/gans.mp3");
const soundPut = new Audio("public/dubbel.mp3");
const soundWin = new Audio("public/finish.mp3");
const soundPrison = new Audio("public/gevangenis.mp3");
const soundPit = new Audio("public/put.mp3");
const soundInn = new Audio("public/herberg.mp3");
const soundBridge = new Audio("public/brug.mp3");

const specialTiles = {
6:"gans",
12:"gans",
18:"brug",
25:"herberg",
37:"put",
52:"gevangenis",
68:"gans",
79:"brug",
95:"put",
111:"gevangenis",
125:"dood",
140:"finish"
};

function createBoard(){

board.innerHTML="";

for(let i=1;i<=TOTAL_CELLS;i++){

const cell=document.createElement("div");
cell.classList.add("cell");

const type=specialTiles[i];

if(type){
cell.classList.add(type);
}

let icon="";

if(type==="gans") icon="🪿";
if(type==="brug") icon="🌉";
if(type==="put") icon="🕳️";
if(type==="gevangenis") icon="⛓️";
if(type==="herberg") icon="🍺";
if(type==="dood") icon="☠️";
if(type==="finish") icon="🏁";

cell.innerHTML=`
<div>${i}</div>
<span>${icon}</span>
<div class="pawns" id="pawn-${i}"></div>
`;

board.appendChild(cell);

}

updateBoard();

}

function updateBoard(){

document.querySelectorAll(".pawns").forEach(p=>{
p.innerHTML="";
});

teams.forEach(team=>{

if(team.position===0) return;

const holder=document.getElementById(`pawn-${team.position}`);

if(holder){

const pawn=document.createElement("div");
pawn.classList.add("pawn",team.color);

holder.appendChild(pawn);

}

});

turnText.innerHTML=
`${teams[currentTeam].icon} is aan de beurt`;

}

async function rollDice(){

const team=teams[currentTeam];

if(team.skipTurns > 0){

showPopup(
`${team.icon} slaat een beurt over`
);

team.skipTurns--;

nextTurn();

return;

}

const roll=Math.floor(Math.random()*6)+1;

diceText.innerText=`Je gooide ${roll}`;

for(let i=0;i<roll;i++){

if(team.position<TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(350);

}

}

await handleSpecial(team);

loadQuestion();

if(team.position>=TOTAL_CELLS){

soundWin.play();

showPopup(`${team.icon} heeft gewonnen!`);

return;

}

nextTurn();

}

async function handleSpecial(team){

const type = specialTiles[team.position];

if(!type) return;

if(type === "gans"){

soundGans.play();

showPopup("🪿 Gans! Ga 6 vakjes vooruit");

for(let i=0;i<6;i++){

if(team.position < TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(350);

}

}

}

if(type === "brug"){

soundBridge.play();

showPopup("🌉 Brug! Ga naar vak 30");

if(team.position < 30){

while(team.position < 30){

team.position++;

updateBoard();

await sleep(250);

}

}else{

while(team.position > 30){

team.position--;

updateBoard();

await sleep(250);

}

}

}

if(type === "put"){

soundPit.play();

showPopup("🕳️ In de put! Beurt overslaan");

team.skipTurns = 1;

}

if(type === "gevangenis"){

soundPrison.play();

showPopup("⛓️ Gevangenis! Beurt overslaan");

team.skipTurns = 2;

}

if(type === "herberg"){

soundInn.play();

showPopup("🍺 Herberg! Beurt overslaan");

team.skipTurns = 1;

}

if(type === "dood"){

showPopup("☠️ Terug naar start!");

while(team.position > 0){

team.position--;

updateBoard();

await sleep(150);

}

}

updateBoard();

}

function nextTurn(){

currentTeam++;

if(currentTeam>=teams.length){
currentTeam=0;
}

updateBoard();

}

function loadQuestion(){

const q =
vragen[Math.floor(Math.random() * vragen.length)];

currentQuestion = q;

questionText.innerText = q.vraag;

btnA.innerText = "A: " + q.a;
btnB.innerText = "B: " + q.b;
btnC.innerText = "C: " + q.c;

btnA.className = "answerBtn";
btnB.className = "answerBtn";
btnC.className = "answerBtn";

explanationText.innerText = "";

}

function showAnswer(){

answerText.style.display="block";

}

function showPopup(text){

popup.style.display="block";

popup.innerText=text;

setTimeout(()=>{
popup.style.display="none";
},6000);

}

function sleep(ms){
return new Promise(resolve=>setTimeout(resolve,ms));
}

function checkAnswer(choice){

const correct =
currentQuestion.correct;

if(choice === correct){

document
.getElementById(
"btn" + choice.toUpperCase()
)
.classList.add("correct");

}else{

document
.getElementById(
"btn" + choice.toUpperCase()
)
.classList.add("wrong");

document
.getElementById(
"btn" + correct.toUpperCase()
)
.classList.add("correct");

}

explanationText.innerText =
"Verklaring: " +
currentQuestion.uitleg;

}

function showScreen(screen){

screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");

screen.classList.remove("hidden");

}

createBoard();
