const firebaseConfig = {
  apiKey: "AIzaSyCtLCDt4kT0mSmeDm0pHFprsU-zmOMrYkg",
  authDomain: "appelgans-dfbdb.firebaseapp.com",
  projectId: "appelgans-dfbdb",
  storageBucket: "appelgans-dfbdb.firebasestorage.app",
  messagingSenderId: "121163726885",
  appId: "1:121163726885:web:0c8a76c2fe671df5a4bfcc",
  measurementId: "G-EGJT48F990"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();

let currentTeam = 0;
let activeTeams = 4;

let selectedCategory =
"Ooststellingwerf";

let lastRoll = 0;
let currentQuestion = null;

const TOTAL_CELLS = 140;

/* ===== TEAMS ===== */

const teams = [
{
name: "Blauw",
color: "blue",
icon: "🔵",
position: 0,
skipTurns: 0
},
{
name: "Rood",
color: "red",
icon: "🔴",
position: 0,
skipTurns: 0
},
{
name: "Groen",
color: "green",
icon: "🟢",
position: 0,
skipTurns: 0
},
{
name: "Paars",
color: "purple",
icon: "🟣",
position: 0,
skipTurns: 0
}
];

/* ===== HTML ===== */

const board =
document.getElementById("board");

const turnText =
document.getElementById("turn");

const diceText =
document.getElementById("diceResult");

const statusMessage =
document.getElementById("statusMessage");

const questionText =
document.getElementById("question");

const explanationText =
document.getElementById("explanation");

const btnA =
document.getElementById("btnA");

const btnB =
document.getElementById("btnB");

const btnC =
document.getElementById("btnC");

const popup =
document.getElementById("popup");

const categorySelect =
document.getElementById(
"categorySelect"
);

/* ===== SCHERMEN ===== */

const welcomeScreen =
document.getElementById("welcomeScreen");

const screen0 = document.getElementById("screen0");

const screen1 =
document.getElementById("screen1");

const screen2 =
document.getElementById("screen2");

const screen3 =
document.getElementById("screen3");

/* ===== GELUIDEN ===== */

const soundGans =
new Audio("public/gans.mp3");

const soundBridge =
new Audio("public/brug.mp3");

const soundPut =
new Audio("public/put.mp3");

const soundPrison =
new Audio("public/gevangenis.mp3");

const soundInn =
new Audio("public/herberg.mp3");

const soundWin =
new Audio("public/finish.mp3");

/* ===== SPECIALE VAKKEN ===== */

const specialTiles = {

6:"gans",
12:"gans",
18:"brug",
25:"herberg",
31:"gans",
37:"brug",
42:"gans",
52:"gevangenis",
58:"gans",
63:"gans",
79:"brug",
80:"gans",
95:"put",
101:"gans",
111:"gevangenis",
119:"gans",
130:"gans",
140:"finish"

};

/* ===== HULPFUNCTIES ===== */

function startGame() {

try {

updateTeamInputs();

selectedCategory = document.getElementById("categorySelect").value;
activeTeams = parseInt(document.getElementById("teamCount").value);

teams[0].name = document.getElementById("team1Name").value;
teams[1].name = document.getElementById("team2Name").value;
teams[2].name = document.getElementById("team3Name").value;
teams[3].name = document.getElementById("team4Name").value;

document.getElementById("categorySelect").disabled = true;
document.getElementById("teamCount").disabled = true;

document.getElementById("categorySelect").style.pointerEvents = "none";
document.getElementById("teamCount").style.pointerEvents = "none";

document.getElementById("categorySelect").style.opacity = "0.6";
document.getElementById("teamCount").style.opacity = "0.6";

showScreen(screen1);
updateTurn();

document.getElementById("currentCategory").innerText =
"Categorie: " + selectedCategory;

} catch (e) {
console.log("STARTGAME ERROR:", e);
}

}

function createRoom() {
  const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase();

  const roomRef = db.ref("rooms/" + roomCode);

  roomRef.set({
    host: true,
    state: "lobby",
    players: {
      host: {
        name: "Host"
      }
    }
  });

  currentRoom = roomCode;

  alert("Room gemaakt: " + roomCode);

  listenToRoom(roomCode);
}

function joinRoom(code, playerName) {
  const roomRef = db.ref("rooms/" + code);

  roomRef.once("value", (snap) => {
    if (!snap.exists()) {
      alert("Room bestaat niet");
      return;
    }

    const playerId = "p" + Math.random().toString(36).substring(2, 8);

    roomRef.child("players/" + playerId).set({
      name: playerName
    });

    currentRoom = code;

    listenToRoom(code);
  });
}

function listenToRoom(code) {
  db.ref("rooms/" + code).on("value", (snap) => {
    const data = snap.val();
    console.log("ROOM UPDATE:", data);

    updateUI(data);
  });
}

function updateUI(room) {
  if (!room) return;

  console.log("Spelers:", room.players);
}

function updateTeamInputs() {
const count = parseInt(document.getElementById("teamCount").value);
const inputs = document.querySelectorAll(".teamInput");

inputs.forEach(el => {
const nr = parseInt(el.dataset.team);
el.style.display = nr <= count ? "block" : "none";
});
}

function sleep(ms){
return new Promise(resolve =>
setTimeout(resolve, ms));
}

function showScreen(screen){

welcomeScreen.classList.add("hidden");
screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");

screen.classList.remove("hidden");

}

function showPopup(text){

popup.innerText = text;
popup.style.display = "block";

setTimeout(()=>{
popup.style.display = "none";
},3000);

}

/* ===== BORD MAKEN ===== */

for(let i=1; i<=TOTAL_CELLS; i++){

const cell =
document.createElement("div");

cell.classList.add("cell");

if(specialTiles[i]){

cell.classList.add(
specialTiles[i]
);

}

let icon = "";

if(specialTiles[i] === "gans"){
icon = "🪿";
}

if(specialTiles[i] === "brug"){
icon = "🌉";
}

if(specialTiles[i] === "put"){
icon = "🕳";
}

if(specialTiles[i] === "gevangenis"){
icon = "🔒";
}

if(specialTiles[i] === "herberg"){
icon = "🍺";
}

if(specialTiles[i] === "finish"){
icon = "🏁";
}

cell.innerHTML =
`
<div>${i}</div>
<span>${icon}</span>
<div class="pawns"></div>
`;

board.appendChild(cell);

}

/* ===== UPDATE BORD ===== */

function updateBoard(){

const pawns =
document.querySelectorAll(".pawns");

pawns.forEach(p=>{
p.innerHTML = "";
});

teams
.slice(0, activeTeams)
.forEach(team=>{

if(team.position > 0){

const cell =
document.querySelectorAll(".cell")
[team.position - 1];

const pawn =
document.createElement("div");

pawn.classList.add(
"pawn",
team.color
);

cell
.querySelector(".pawns")
.appendChild(pawn);

}

});

}

/* ===== BEURT ===== */

function updateTurn(){

const team =
teams[currentTeam];

turnText.innerText = team.icon + " " + team.name + " is aan de beurt";

}

function nextTurn(){

currentTeam++;

if(currentTeam >= activeTeams){
currentTeam = 0;
}

const team =
teams[currentTeam];

if(team.skipTurns > 0){

team.skipTurns--;

statusMessage.innerText =
team.icon +
" moet een beurt overslaan.";

nextTurn();

return;

}

diceText.innerText = "";
updateTurn();

}

/* ===== DOBBELEN ===== */

function rollDice(){

const roll =
Math.floor(Math.random() * 6) + 1;

lastRoll = roll;

diceText.innerText =
"🎲 Je gooide: " + roll;

categorySelect.disabled = true;

statusMessage.innerText = "";

setTimeout(()=>{

showScreen(screen2);

loadQuestion();

},1500);

}

/* ===== VRAGEN ===== */

function loadQuestion(){

const actieveVragen =
vragen.filter(
v => v.categorie === selectedCategory
);

const q =
actieveVragen[
Math.floor(
Math.random() *
actieveVragen.length
)
];

currentQuestion = q;

questionText.innerText =
q.vraag;

btnA.innerText =
"A: " + q.a;

btnB.innerText =
"B: " + q.b;

btnC.innerText =
"C: " + q.c;

btnA.className =
"answerBtn";

btnB.className =
"answerBtn";

btnC.className =
"answerBtn";

btnA.disabled = false;
btnB.disabled = false;
btnC.disabled = false;

explanationText.innerText = "";

}

/* ===== ANTWOORD CONTROLEREN ===== */

async function checkAnswer(choice){

btnA.disabled = true;
btnB.disabled = true;
btnC.disabled = true;

const correct =
currentQuestion.correct;

if(choice === correct){

document
.getElementById(
"btn" + choice.toUpperCase()
)
.classList.add("correct");

explanationText.innerText =
"✅ Goed! " +
currentQuestion.uitleg;

await sleep(2500);

showScreen(screen3);

const team =
teams[currentTeam];

/* langzaam bewegen */

for(let i=0; i<lastRoll; i++){

if(team.position < TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(350);

}

}

/* speciale vakken */

await handleSpecial(team);

/* gewonnen */

if(team.position >= TOTAL_CELLS){

soundWin.play();

showPopup(
team.icon +
" heeft gewonnen!"
);

return;

}

/* volgende beurt */

nextTurn();

setTimeout(()=>{

showScreen(screen1);
},3500);

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

explanationText.innerText =
"❌ Fout! " +
currentQuestion.uitleg;

setTimeout(()=>{

nextTurn();

showScreen(screen1);

},3500);

}

}

/* ===== SPECIALE VAKKEN ===== */

async function handleSpecial(team){

const type =
specialTiles[team.position];

if(!type){
return;
}
  
/* GANS */

if(type === "gans"){

soundGans.play();

statusMessage.innerText =
team.icon +
" landde op een gans! +6";

await sleep(1500);

for(let i=0; i<6; i++){

if(team.position < TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(350);

}

}

}

/* BRUG */

if(type === "brug"){

soundBridge.play();

statusMessage.innerText =
team.icon +
" over de brug naar vak 30!";

await sleep(2000);

while(team.position < 30){

team.position++;

updateBoard();

await sleep(250);

}

}

/* HERBERG */

if(type === "herberg"){

soundInn.play();

team.skipTurns = 1;

statusMessage.innerText =
team.icon +
" moet 1 beurt overslaan.";

}

/* PUT */

if(type === "put"){

soundPut.play();

team.skipTurns = 1;

statusMessage.innerText =
team.icon +
" zit in de put!";

}

/* GEVANGENIS */

if(type === "gevangenis"){

soundPrison.play();

team.skipTurns = 2;

statusMessage.innerText =
team.icon +
" zit in de gevangenis!";

}

}

/* ===== START ===== */

updateTurn();
updateBoard();
document.getElementById("welcomeScreen")
.classList.remove("hidden");

screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");
