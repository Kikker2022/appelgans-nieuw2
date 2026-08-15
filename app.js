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
        name: "Team 1",
        colorName: "Blauw",
        color: "blue",
        icon: "🔵",
        position: 0,
        skipTurns: 0
    },
    {
        name: "Team 2",
        colorName: "Rood",
        color: "red",
        icon: "🔴",
        position: 0,
        skipTurns: 0
    },
    {
        name: "Team 3",
        colorName: "Groen",
        color: "green",
        icon: "🟢",
        position: 0,
        skipTurns: 0
    },
    {
        name: "Team 4",
        colorName: "Paars",
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

const screen0 =
document.getElementById("screen0");

const screen1 =
document.getElementById("screen1");

const screen2 =
document.getElementById("screen2");

const screen3 =
document.getElementById("screen3");

/* ===== GELUIDEN ===== */

const soundDobbel = new Audio("public/dobbel.mp3");

const soundGans = new Audio("public/gans.mp3");

const soundBridge = new Audio("public/brug.mp3");

const soundPut = new Audio("public/put.mp3");

const soundPrison = new Audio("public/gevangenis.mp3");

const soundInn = new Audio("public/herberg.mp3");

const soundWin = new Audio("public/finish.mp3");

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

        // =========================
        // 1. TEAMINSTELLINGEN OPHALEN
        // =========================

        updateTeamInputs();

        activeTeams =
    parseInt(
        document.getElementById("teamCount").value
    );

teams[0].name =
    document.getElementById("team1Name").value.trim();

teams[1].name =
    document.getElementById("team2Name").value.trim();

teams[2].name =
    document.getElementById("team3Name").value.trim();

teams[3].name =
    document.getElementById("team4Name").value.trim();
        

        // =========================
        // 2. LEGE NAMEN VOORKOMEN
        // =========================

        if (!teams[0].name) {
            teams[0].name = "Team 1";
        }

        if (!teams[1].name) {
            teams[1].name = "Team 2";
        }

        if (!teams[2].name) {
            teams[2].name = "Team 3";
        }

        if (!teams[3].name) {
            teams[3].name = "Team 4";
        }


        // =========================
        // 3. TEAMNAMEN OP HUIDIGE
        //    TELEFOON TONEN
        // =========================

        for (let i = 1; i <= 4; i++) {

            const row =
                document.getElementById(
                    "teamDisplay" + i
                );

            const display =
                document.getElementById(
                    "displayTeam" + i
                );

            if (!row || !display) {
                continue;
            }

            if (i <= activeTeams) {

                row.style.display = "block";

                display.innerText =
                    teams[i - 1].name;

            } else {

                row.style.display = "none";

            }

        }


        // =========================
        // 4. INSTELLINGEN VASTZETTEN
        // =========================

        document.getElementById(
            "categorySelect"
        ).disabled = true;

        document.getElementById(
            "teamCount"
        ).disabled = true;


        // =========================
        // 5. GEGEVENS NAAR FIREBASE
        // =========================

        if (
            window.isHost &&
            window.currentGameCode
        ) {

            firebase.database()
                .ref(
                    "games/" +
                    window.currentGameCode
                )
.update({

    gameState: "playing",

    currentTurn: 0,

    activeTeams: activeTeams,

    selectedCategory: selectedCategory,

    teamNames: {

        0: document.getElementById("team1Name").value.trim(),

        1: document.getElementById("team2Name").value.trim(),

        2: document.getElementById("team3Name").value.trim(),

        3: document.getElementById("team4Name").value.trim()

    }

})
                .then(() => {

                    console.log(
                        "✅ Spel gestart en teamgegevens opgeslagen"
                    );

                })
                .catch(error => {

                    console.error(
                        "❌ Firebase startGame fout:",
                        error
                    );

                    alert(
                        "Het spel kon niet worden gestart.\n\n" +
                        error.message
                    );

                });

        }


        // =========================
        // 6. CATEGORIE TONEN
        // =========================

        const categoryText =
            document.getElementById(
                "currentCategory"
            );

        if (categoryText) {

            categoryText.innerText =
                "Categorie: " +
                selectedCategory;

        }


        // =========================
        // 7. BEURT BIJWERKEN
        // =========================

        currentTeam = 0;

        updateTurn();


        // =========================
        // 8. HOST NAAR SPELSCHERM
        // =========================

        showScreen(screen1);


        console.log(
            "✅ startGame() uitgevoerd"
        );

    }

    catch (e) {

        console.error(
            "❌ STARTGAME ERROR:",
            e
        );

        alert(
            "Er is een fout bij het starten van het spel:\n\n" +
            e.message
        );

    }

}

function updateTeamInputs() {

    const teamCount =
        parseInt(
            document.getElementById("teamCount").value,
            10
        );

    const teamInputs =
        document.querySelectorAll(".teamInput");

    teamInputs.forEach(input => {

        const teamNumber =
            parseInt(
                input.dataset.team,
                10
            );

        if (teamNumber <= teamCount) {

            input.style.display = "block";
            input.hidden = false;

        } else {

            input.style.display = "none";
            input.hidden = true;

        }

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

function showStartScreen(){

welcomeScreen.classList.add("hidden");

showScreen(screen0);

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

function updateTurn() {

    const team =
        teams[currentTeam];

    if (!team) {
        return;
    }


    const naam =
        team.name || "Nog niet bekend";


    turnText.innerText =
        team.icon +
        " " +
        naam +
        " is aan de beurt";


    // Firebase is leidend.
    const activeTeamCount =
        parseInt(activeTeams, 10);


    for (let i = 0; i < 4; i++) {

        const display =
            document.getElementById(
                "displayTeam" + (i + 1)
            );

        if (!display) {
            continue;
        }


        const row =
            display.parentElement;


        if (i < activeTeamCount) {

            row.style.display =
                "block";

            display.innerText =
                teams[i].name ||
                "Nog niet bekend";

        } else {

            row.style.display =
                "none";

        }

    }

}

function nextTurn() {

    // Zorg dat activeTeams altijd een geldig getal is.
    activeTeams =
        parseInt(activeTeams, 10);

    if (
        !Number.isInteger(activeTeams) ||
        activeTeams < 1
    ) {
        activeTeams = 2;
    }


    // Volgende team
    currentTeam++;


    // Nooit buiten het actieve aantal teams
    if (
        currentTeam >= activeTeams
    ) {

        currentTeam = 0;

    }


    let team =
        teams[currentTeam];


    if (!team) {
        currentTeam = 0;
        team = teams[0];
    }


    // Beurt overslaan
    if (
        team.skipTurns &&
        team.skipTurns > 0
    ) {

        team.skipTurns--;

        statusMessage.innerText =
            team.icon +
            " " +
            team.name +
            " moet een beurt overslaan.";

        nextTurn();

        return;
    }


    // Nieuwe beurt: opnieuw dobbelen toegestaan
    window.diceRolled = false;

    diceText.innerText = "";

    updateTurn();

}

/* ===== DOBBELEN ===== */

function rollDice() {

    // Voorkom meerdere worpen tijdens dezelfde beurt
    if (window.diceRolled) {
        return;
    }

    // Deze beurt is nu geworpen
    window.diceRolled = true;

    // Dobbelgeluid afspelen
    soundDobbel.currentTime = 0;
    soundDobbel.play();

    const roll = Math.floor(Math.random() * 6) + 1;
    lastRoll = roll;

    categorySelect.disabled = true;
    statusMessage.innerText = "";

    // Pas na 3,5 seconden laten zien wat er gegooid is
    setTimeout(() => {

        diceText.innerText = "🎲 Je gooide: " + roll;

        setTimeout(() => {

            showScreen(screen2);
            loadQuestion();

        }, 1500);

    }, 3500);
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

await sleep(4000);

showScreen(screen3);

const team =
teams[currentTeam];

/* langzaam bewegen */

for(let i=0; i<lastRoll; i++){

if(team.position < TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(700);

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
welcomeScreen.classList.remove("hidden");
screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");

function showTurn(index) {

    const teams = [
        document.getElementById("team1Name")?.value || "Team 1",
        document.getElementById("team2Name")?.value || "Team 2",
        document.getElementById("team3Name")?.value || "Team 3",
        document.getElementById("team4Name")?.value || "Team 4"
    ];

    document.getElementById("turn").innerText =
        "Beurt: " + teams[index];

}

setTimeout(() => {

    const code = document.getElementById("gameCode")?.value
        || document.getElementById("joinCode")?.value;

    nextTurn(code);

}, 1500);
