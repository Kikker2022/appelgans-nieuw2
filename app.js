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

/* ===== GELUIDEN =====
   De geluidsbestanden staan in:
   public/sounds/

   In dit project gebruikt index.html ook expliciet
   "public/..." voor bestanden, daarom gebruiken we
   hier dezelfde structuur.
*/

const soundDobbel = new Audio("public/sounds/dobbel.mp3");
const soundGans = new Audio("public/sounds/gans.mp3");
const soundBridge = new Audio("public/sounds/brug.mp3");
const soundPut = new Audio("public/sounds/put.mp3");
const soundPrison = new Audio("public/sounds/gevangenis.mp3");
const soundInn = new Audio("public/sounds/herberg.mp3");
const soundWin = new Audio("public/sounds/finish.mp3");

/*
 * Eén centrale functie voor alle spelgeluiden.
 */
function playGameSound(audio) {
    if (!audio) return;

    if (window.gameSoundEnabled === false) {
        return;
    }

    try {
        audio.pause();
        audio.currentTime = 0;

        const promise = audio.play();

        if (promise !== undefined) {
            promise.catch(error => {
                console.warn("Geluid kon niet worden afgespeeld:", error);
            });
        }
    } catch (error) {
        console.warn("Fout bij afspelen geluid:", error);
    }
}


/* ===== PUNT 8: FINISHFEEST ===== */

function showFinishCelebration(winnerTeam){

    let overlay =
        document.getElementById("finishCelebration");

    if(!overlay){

        overlay =
            document.createElement("div");

        overlay.id =
            "finishCelebration";

        overlay.style.position = "fixed";
        overlay.style.inset = "0";
        overlay.style.zIndex = "10000";
        overlay.style.background = "rgba(255,255,255,0.96)";
        overlay.style.display = "flex";
        overlay.style.flexDirection = "column";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";
        overlay.style.textAlign = "center";
        overlay.style.padding = "20px";
        overlay.style.boxSizing = "border-box";
        overlay.style.overflow = "hidden";

        document.body.appendChild(overlay);
    }

    const ranking =
        teams
        .slice(0,activeTeams)
        .map((team,index)=>({
            team,
            index,
            position:
                Math.min(
                    TOTAL_CELLS,
                    parseInt(team.position,10) || 0
                )
        }))
        .sort((a,b)=>b.position-a.position);

    const medals =
        ["🥇","🥈","🥉","4️⃣"];

    const rankingHtml =
        ranking
        .map((item,index)=>
            `<div style="
                margin:5px 0;
                font-size:clamp(1rem,4.5vw,1.35rem);
                font-weight:800;">
                ${medals[index] || "•"}
                ${item.team.icon}
                ${item.team.name}
                — ${item.position} / ${TOTAL_CELLS}
            </div>`
        )
        .join("");

    overlay.innerHTML = `
        <div style="
            font-size:clamp(3rem,18vw,7rem);
            line-height:1;">
            🎉🏁🎉
        </div>

        <div style="
            margin-top:12px;
            font-size:clamp(2rem,9vw,3.5rem);
            font-weight:900;">
            HOERA!
        </div>

        <div style="
            margin:10px 0 18px;
            font-size:clamp(1.35rem,6vw,2rem);
            font-weight:900;">
            ${winnerTeam.icon}
            ${winnerTeam.name}
            heeft Appelgans gewonnen!
        </div>

        <div style="
            width:min(92vw,430px);
            background:#fff;
            border:2px solid #333;
            border-radius:14px;
            padding:12px;
            box-sizing:border-box;">
            <div style="
                font-size:1.15rem;
                font-weight:900;
                margin-bottom:8px;">
                🏆 Eindstand
            </div>
            ${rankingHtml}
        </div>

        <div style="
            margin-top:16px;
            font-size:clamp(1rem,4vw,1.25rem);
            font-weight:800;">
            Jammer voor de andere teams — volgende keer beter!
        </div>
    `;

    // Eenvoudige confetti, zonder extra bibliotheek.
    const confetti =
        ["🎉","🎊","✨","⭐","🪿"];

    for(let i=0;i<28;i++){

        const piece =
            document.createElement("div");

        piece.innerText =
            confetti[i % confetti.length];

        piece.style.position = "absolute";
        piece.style.left =
            ((i * 37) % 96) + "%";
        piece.style.top =
            ((i * 53) % 88) + "%";
        piece.style.fontSize =
            (18 + (i % 5) * 5) + "px";
        piece.style.transform =
            "rotate(" + ((i * 47) % 360) + "deg)";
        piece.style.pointerEvents =
            "none";

        overlay.appendChild(piece);
    }
}

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

        // Gekozen categorie daadwerkelijk uit het keuzemenu halen
        selectedCategory =
            document.getElementById("categorySelect").value;

        activeTeams = parseInt(
            document.getElementById("teamCount").value,
            10
        );

        teams[0].name = document.getElementById("team1Name").value.trim();
        teams[1].name = document.getElementById("team2Name").value.trim();
        teams[2].name = document.getElementById("team3Name").value.trim();
        teams[3].name = document.getElementById("team4Name").value.trim();

        for (let i = 0; i < 4; i++) {
            if (!teams[i].name) {
                teams[i].name = "Team " + (i + 1);
            }
        }

        // Posities bij een nieuw spel resetten
        for (let i = 0; i < 4; i++) {
            teams[i].position = 0;
            teams[i].skipTurns = 0;
        }

        currentTeam = 0;
        lastRoll = 0;
        currentQuestion = null;
        window.diceRolled = false;

        // =========================
        // 2. TEAMNAMEN OP HUIDIGE TELEFOON
        // =========================

        for (let i = 1; i <= 4; i++) {

            const row = document.getElementById("teamDisplay" + i);
            const display = document.getElementById("displayTeam" + i);

            if (!row || !display) continue;

            if (i <= activeTeams) {
                row.style.display = "block";
                display.innerText = teams[i - 1].name;
            } else {
                row.style.display = "none";
            }
        }

        // =========================
        // 3. INSTELLINGEN VASTZETTEN
        // =========================

        document.getElementById("categorySelect").disabled = true;
        document.getElementById("teamCount").disabled = true;
        document.getElementById("categorySelect").style.pointerEvents = "none";
        document.getElementById("teamCount").style.pointerEvents = "none";
        document.getElementById("categorySelect").style.opacity = "0.6";
        document.getElementById("teamCount").style.opacity = "0.6";

        // =========================
        // 4. GEGEVENS NAAR FIREBASE
        // =========================

        if (window.isHost && window.currentGameCode) {

            const positions = {
                0: 0,
                1: 0,
                2: 0,
                3: 0
            };

            firebase.database()
                .ref("games/" + window.currentGameCode)
                .update({
                    gameState: "playing",
                    currentTurn: 0,
                    activeTeams: activeTeams,
                    selectedCategory: selectedCategory,
                    phase: "turn",
                    roll: null,
                    questionIndex: null,
                    teamNames: {
                        0: teams[0].name,
                        1: teams[1].name,
                        2: teams[2].name,
                        3: teams[3].name
                    },
                    teamPositions: positions,
                    teamSkipTurns: {
                        0: 0,
                        1: 0,
                        2: 0,
                        3: 0
                    },
                    usedQuestions: {}
                })
                .then(() => {
                    console.log("✅ Spel gestart en teamgegevens opgeslagen");
                })
                .catch(error => {
                    console.error("❌ Firebase startGame fout:", error);
                    alert("Het spel kon niet worden gestart.\n\n" + error.message);
                });
        }

        // =========================
        // 5. CATEGORIE EN BEURT
        // =========================

        const categoryText = document.getElementById("currentCategory");
        if (categoryText) {
            categoryText.innerText = "Categorie: " + selectedCategory;
        }

        updateTurn();
        showScreen(screen1);

        // Na de start is de grote QR niet meer nodig.
        // De host kan hem later via ⚙️ Instellingen weer tonen.
        window.hostQrManuallyShown = false;
        if (typeof hideGameQrCode === "function") {
            hideGameQrCode(true);
        }

        console.log("✅ startGame() uitgevoerd");

    } catch (e) {
        console.error("❌ STARTGAME ERROR:", e);
        alert("Er is een fout bij het starten van het spel:\n\n" + e.message);
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

updateTeamInputs();

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

function showPopup(text, duration = 4000){

popup.innerText = text;
popup.style.display = "block";
popup.style.fontSize = "clamp(1.25rem, 6vw, 2rem)";
popup.style.fontWeight = "900";
popup.style.lineHeight = "1.35";
popup.style.textAlign = "center";
popup.style.padding = "18px";
popup.style.zIndex = "9999";

setTimeout(()=>{
popup.style.display = "none";
},duration);

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
<span class="tileIcon">${icon}</span>
<div class="pawns"></div>
`;

const tileIcon =
    cell.querySelector(".tileIcon");

if (tileIcon) {

    tileIcon.style.display =
        "flex";

    tileIcon.style.alignItems =
        "center";

    tileIcon.style.justifyContent =
        "center";

    tileIcon.style.width =
        "100%";

    tileIcon.style.height =
        "100%";

    tileIcon.style.fontSize =
        "clamp(2.8rem, 11vw, 4.6rem)";

    tileIcon.style.lineHeight =
        "1";

    tileIcon.style.position = "absolute";
    tileIcon.style.inset = "0";
    tileIcon.style.pointerEvents = "none";
    tileIcon.style.zIndex = "1";

    cell.style.position = "relative";

    const numberDiv = cell.querySelector("div");
    if (numberDiv) {
        numberDiv.style.position = "relative";
        numberDiv.style.zIndex = "2";
        numberDiv.style.fontWeight = "bold";
    }

    const pawnsDiv = cell.querySelector(".pawns");
    if (pawnsDiv) {
        pawnsDiv.style.position = "relative";
        pawnsDiv.style.zIndex = "3";
    }

}

board.appendChild(cell);

}


/* ===== VOORTGANG TEAMS ===== */

function updateTeamProgressDisplay(){

let progressBox =
document.getElementById("teamProgressBox");

if(!progressBox){

progressBox =
document.createElement("div");

progressBox.id = "teamProgressBox";

progressBox.style.width = "min(92vw, 520px)";
progressBox.style.margin = "10px auto 14px auto";
progressBox.style.padding = "10px 12px";
progressBox.style.boxSizing = "border-box";
progressBox.style.background = "rgba(255,255,255,0.96)";
progressBox.style.border = "2px solid rgba(0,0,0,0.16)";
progressBox.style.borderRadius = "12px";
progressBox.style.fontWeight = "800";
progressBox.style.fontSize = "clamp(0.9rem, 3.8vw, 1.05rem)";
progressBox.style.lineHeight = "1.55";
progressBox.style.textAlign = "left";

if(board && board.parentNode){
board.parentNode.insertBefore(
progressBox,
board
);
}

}

const lines = [];

teams
.slice(0, activeTeams)
.forEach((team,index)=>{

const position =
Math.max(
0,
Math.min(
TOTAL_CELLS,
parseInt(team.position,10) || 0
)
);

lines.push(
team.icon +
" " +
(team.name || ("Team " + (index + 1))) +
": " +
position +
" / " +
TOTAL_CELLS
);

});

progressBox.innerText =
lines.join("\n");

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

pawn.style.width = "clamp(20px, 7vw, 32px)";
pawn.style.height = "clamp(20px, 7vw, 32px)";
pawn.style.borderRadius = "50%";
pawn.style.display = "block";

cell
.querySelector(".pawns")
.appendChild(pawn);

}

});

updateTeamProgressDisplay();

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

    activeTeams = parseInt(activeTeams, 10);

    if (!Number.isInteger(activeTeams) || activeTeams < 1) {
        activeTeams = 2;
    }

    currentTeam++;

    if (currentTeam >= activeTeams) {
        currentTeam = 0;
    }

    let team = teams[currentTeam];

    if (!team) {
        currentTeam = 0;
        team = teams[0];
    }

    if (team.skipTurns > 0) {
        team.skipTurns--;
        nextTurn();
        return;
    }

    window.diceRolled = false;
    diceText.innerText = "";
    updateTurn();
}

/* ===== DOBBELEN ===== */

function rollDice() {

    if (window.gamePaused === true) {
        statusMessage.innerText = "⏸️ Het spel is gepauzeerd door de host.";
        return;
    }

    if (parseInt(currentTeam, 10) !== parseInt(window.myTeam, 10)) {
        statusMessage.innerText = "⏳ Wacht op je beurt.";
        return;
    }

    if (window.diceRolled) {
        return;
    }

    window.diceRolled = true;

    playGameSound(soundDobbel);

    const roll = Math.floor(Math.random() * 6) + 1;
    lastRoll = roll;

    const actieveVragen = vragen.filter(
        v => v.categorie === selectedCategory
    );

    if (!actieveVragen.length) {
        window.diceRolled = false;
        statusMessage.innerText =
            "Geen vragen gevonden voor deze categorie.";
        return;
    }

    // -----------------------------------------
    // Gebruikte vragen van dit spel ophalen.
    // De lijst wordt centraal in Firebase bijgehouden,
    // zodat alle telefoons dezelfde vragen gebruiken.
    // -----------------------------------------

    firebase.database()
        .ref(
            "games/" +
            window.currentGameCode +
            "/usedQuestions"
        )
        .once("value")
        .then(snapshot => {

            let usedQuestions =
                snapshot.val() || {};

            let beschikbareIndices = [];

            for (
                let i = 0;
                i < actieveVragen.length;
                i++
            ) {

                if (!usedQuestions[i]) {
                    beschikbareIndices.push(i);
                }
            }

            // Alle vragen gebruikt?
            // Dan start een nieuwe ronde.
            if (!beschikbareIndices.length) {

                usedQuestions = {};

                for (
                    let i = 0;
                    i < actieveVragen.length;
                    i++
                ) {
                    beschikbareIndices.push(i);
                }
            }

            const questionIndex =
                beschikbareIndices[
                    Math.floor(
                        Math.random() *
                        beschikbareIndices.length
                    )
                ];

            // Deze vraag is vanaf nu gebruikt.
            usedQuestions[questionIndex] = true;

            return firebase.database()
                .ref(
                    "games/" +
                    window.currentGameCode
                )
                .update({

                    currentTurn: currentTeam,
                    roll: roll,
                    questionIndex: questionIndex,
                    usedQuestions: usedQuestions,
                    phase: "rolled"

                });

        })
        .then(() => {

            // Na 3,5 seconden gaat iedere telefoon
            // naar dezelfde vraag.
            setTimeout(() => {

                firebase.database()
                    .ref(
                        "games/" +
                        window.currentGameCode
                    )
                    .update({
                        phase: "question"
                    })
                    .catch(error => {

                        console.error(
                            "❌ Fout bij overgang naar vraag:",
                            error
                        );

                    });

            }, 3500);

        })
        .catch(error => {

            console.error(
                "❌ Fout bij opslaan van worp/vraag:",
                error
            );

            window.diceRolled = false;

            statusMessage.innerText =
                "Fout bij het gooien.";

        });
}

/* ===== VRAGEN ===== */

function loadQuestion() {

    const actieveVragen =
        vragen.filter(
            v => v.categorie === selectedCategory
        );

    if (!actieveVragen.length) {

        console.error(
            "Geen vragen gevonden voor categorie:",
            selectedCategory
        );

        return;
    }

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


// =====================================================
// GESYNCHRONISEERDE VRAAG
// =====================================================

function loadSynchronizedQuestion(index) {

    const actieveVragen =
        vragen.filter(
            v => v.categorie === selectedCategory
        );

    if (!actieveVragen.length) {

        console.error(
            "Geen vragen gevonden voor categorie:",
            selectedCategory
        );

        return;
    }

    const questionNumber =
        parseInt(index, 10);

    const q =
        actieveVragen[questionNumber];

    if (!q) {

        console.error(
            "Ongeldige questionIndex:",
            questionNumber
        );

        return;
    }

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

// =====================================================
// LAATSTE DOBBELWORP BOVEN HET SPEELBORD
// =====================================================
function showBoardDice(roll) {

    let boardDice = document.getElementById("boardDiceResult");

    if (!boardDice) {
        boardDice = document.createElement("p");
        boardDice.id = "boardDiceResult";
        boardDice.style.fontSize = "1.2rem";
        boardDice.style.fontWeight = "bold";
        boardDice.style.margin = "10px 0";

        const boardElement = document.getElementById("board");

        if (boardElement && boardElement.parentElement) {
            boardElement.parentElement.insertBefore(boardDice, boardElement);
        } else {
            document.body.appendChild(boardDice);
        }
    }

    boardDice.innerText = "🎲 Laatste worp: " + roll;
}

/* ===== ANTWOORD CONTROLEREN ===== */

function getNextTeamAfterCurrent() {

    const teamCount = parseInt(activeTeams, 10);

    if (!Number.isInteger(teamCount) || teamCount < 1) {
        return 0;
    }

    let nextTeam = parseInt(currentTeam, 10) + 1;

    for (let i = 0; i < teamCount; i++) {

        if (nextTeam >= teamCount) {
            nextTeam = 0;
        }

        const team = teams[nextTeam];

        if (!team) {
            nextTeam++;
            continue;
        }

        if (team.skipTurns > 0) {
            team.skipTurns--;
            nextTeam++;
            continue;
        }

        return nextTeam;
    }

    return 0;
}

async function saveBoardPositions() {

    if (!window.currentGameCode) {
        return Promise.resolve();
    }

    const positions = {};
    const skipTurns = {};

    for (let i = 0; i < activeTeams; i++) {
        positions[i] = teams[i].position || 0;
        skipTurns[i] = teams[i].skipTurns || 0;
    }

    return firebase.database()
        .ref("games/" + window.currentGameCode)
        .update({
            teamPositions: positions,
            teamSkipTurns: skipTurns
        });
}


async function checkAnswer(choice) {

    if (
        parseInt(currentTeam, 10) !==
        parseInt(window.myTeam, 10)
    ) {
        return;
    }

    if (!currentQuestion) {
        return;
    }

    btnA.disabled = true;
    btnB.disabled = true;
    btnC.disabled = true;

    const correct = currentQuestion.correct;

    if (choice === correct) {

        document
            .getElementById("btn" + choice.toUpperCase())
            .classList.add("correct");

        explanationText.innerText =
            "✅ Goed! " + currentQuestion.uitleg;

        await sleep(3333);

        const team = teams[currentTeam];

        // Eerst lokaal direct het bord tonen.
        // Daarna ook de andere telefoons via Firebase naar het bord sturen.
        showScreen(screen3);
        showBoardDice(lastRoll);

        firebase.database()
            .ref("games/" + window.currentGameCode)
            .update({
                phase: "board",
                roll: lastRoll
            })
            .catch(error => {
                console.error(
                    "❌ Fout bij openen speelbord:",
                    error
                );
            });

        // Pion langzaam verplaatsen.
        for (let i = 0; i < lastRoll; i++) {

            if (team.position < TOTAL_CELLS) {

                team.position++;

                updateBoard();
                await saveBoardPositions();
                await sleep(1000);
            }
        }

        await handleSpecial(team);

        updateBoard();
        await saveBoardPositions();

        if (team.position >= TOTAL_CELLS) {

            team.position = TOTAL_CELLS;

            updateBoard();
            await saveBoardPositions();

            playGameSound(soundWin);

            await firebase.database()
                .ref("games/" + window.currentGameCode)
                .update({
                    gameState: "finished",
                    phase: "finished",
                    winnerTeam: currentTeam,
                    winnerName: team.name
                });

            showFinishCelebration(team);

            return;
        }

        // Bord nog even zichtbaar laten.
        await sleep(2500);

        const nextTeam = getNextTeamAfterCurrent();

        await saveBoardPositions();

        await firebase.database()
            .ref("games/" + window.currentGameCode)
            .update({
                currentTurn: nextTeam,
                phase: "turn",
                roll: null,
                questionIndex: null
            });

        return;
    }

    // FOUT ANTWOORD
    document
        .getElementById("btn" + choice.toUpperCase())
        .classList.add("wrong");

    document
        .getElementById("btn" + correct.toUpperCase())
        .classList.add("correct");

    explanationText.innerText =
        "❌ Fout! " + currentQuestion.uitleg;

    await sleep(4000);

    const nextTeam = getNextTeamAfterCurrent();

    await saveBoardPositions();

    await firebase.database()
        .ref("games/" + window.currentGameCode)
        .update({
            currentTurn: nextTeam,
            phase: "turn",
            roll: null,
            questionIndex: null
        });
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

playGameSound(soundGans);

statusMessage.innerText =
team.icon +
" landde op een gans! +6";

showPopup("🪿 GANS!\n" + team.icon + " " + team.name + "\n6 vakken vooruit", 4000);

await sleep(1500);

for(let i=0; i<6; i++){

if(team.position < TOTAL_CELLS){

team.position++;

updateBoard();

await sleep(600);

}

}

}

/* BRUG */

if(type === "brug"){

playGameSound(soundBridge);

statusMessage.innerText =
team.icon +
" over de brug naar vak 30!";

showPopup("🌉 BRUG!\n" + team.icon + " " + team.name + "\nGa door naar vak 30", 4000);

await sleep(2000);

while(team.position < 30){

team.position++;

updateBoard();

await sleep(450);

}

}

/* HERBERG */

if(type === "herberg"){

playGameSound(soundInn);

team.skipTurns = 1;

statusMessage.innerText =
team.icon +
" moet 1 beurt overslaan.";

showPopup("🍺 HERBERG!\n" + team.icon + " " + team.name + "\n1 beurt overslaan", 4000);

}

/* PUT */

if(type === "put"){

playGameSound(soundPut);

team.skipTurns = 1;

statusMessage.innerText =
team.icon +
" zit in de put!";

showPopup("🕳 PUT!\n" + team.icon + " " + team.name + "\n1 beurt overslaan", 4000);

}

/* GEVANGENIS */

if(type === "gevangenis"){

playGameSound(soundPrison);

team.skipTurns = 2;

statusMessage.innerText =
team.icon +
" zit in de gevangenis!";

showPopup("🔒 GEVANGENIS!\n" + team.icon + " " + team.name + "\n2 beurten overslaan", 4000);

}

}

/* ===== START ===== */

// Op het welkomstscherm is geen QR-code meer nodig.
// De QR die de host na het aanmaken van een spel toont,
// blijft gewoon beschikbaar voor telefoon 2, 3 en 4.
if (welcomeScreen) {
    const welcomeQrBox =
        welcomeScreen.querySelector("#gameQrBox");

    if (welcomeQrBox) {
        welcomeQrBox.remove();
    }

    const welcomeQrImages =
        welcomeScreen.querySelectorAll(
            'img[src*="qrserver"], img[alt*="QR"], img[alt*="qr"]'
        );

    welcomeQrImages.forEach(img => {
        const wrapper = img.closest(
            ".qr-code, .qr-container, .qr-box"
        );

        if (wrapper) {
            wrapper.remove();
        } else {
            img.remove();
        }
    });
}

updateTurn();
updateBoard();
welcomeScreen.classList.remove("hidden");
screen0.classList.add("hidden");
screen1.classList.add("hidden");
screen2.classList.add("hidden");
screen3.classList.add("hidden");

