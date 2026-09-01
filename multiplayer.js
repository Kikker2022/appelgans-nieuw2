/* =========================================================
   APPELGANS - MULTIPLAYER.JS
   ========================================================= */

function createGame() {

    const code = document.getElementById("gameCode").value.trim();
    const hostName = document.getElementById("hostName").value.trim();

    if (!code || !hostName) {
        alert("Vul naam en spelcode in");
        return;
    }

    const hostPlayer = {
        name: hostName,
        team: 0,
        color: "blue"
    };

    const gameRef = firebase.database().ref("games/" + code);

    /*
     * BEVEILIGING TEGEN DUBBELE SPELCODES
     *
     * Een spelcode blijft 24 uur in gebruik.
     * Binnen die 24 uur kan een tweede Host de code
     * niet opnieuw gebruiken.
     *
     * Na 24 uur wordt het oude spel als verlopen beschouwd
     * en mag dezelfde code opnieuw worden gebruikt.
     *
     * We gebruiken hiervoor een Firebase transaction,
     * zodat twee Hosts niet tegelijk dezelfde vrije code
     * kunnen claimen.
     */
    const CODE_GELDIGHEID_MS = 24 * 60 * 60 * 1000;

    gameRef.transaction(currentData => {

        if (currentData !== null) {
            /*
             * Oude spellen uit een eerdere versie hebben mogelijk
             * nog geen createdAt. Die behandelen we als actief,
             * zodat ze niet per ongeluk worden overschreven.
             */
            if (typeof currentData.createdAt !== "number") {
                return;
            }

            const leeftijd = Date.now() - currentData.createdAt;

            if (leeftijd < CODE_GELDIGHEID_MS) {
                // Code is nog geen 24 uur oud en dus in gebruik.
                return;
            }

            // Code is 24 uur of ouder: oud spel mag worden vervangen.
        }

        // Code is vrij of het oude spel is verlopen.
        return {
            gameState: "lobby",
            createdAt: Date.now(),
            currentTurn: 0,
            activeTeams: 4,
            selectedCategory: null,
            phase: "lobby",
            roll: null,
            questionIndex: null,
            teamPositions: {0: 0, 1: 0, 2: 0, 3: 0},
            players: {
                host: hostPlayer
            }
        };

    }).then(result => {

        if (!result.committed) {
            alert(
                "Deze code is in gebruik.\n\n" +
                "Gebruik een andere code."
            );
            return;
        }

        window.currentGameCode = code;
        window.isHost = true;
        window.myPlayerId = "host";
        window.myTeam = 0;
        window.myColor = "blue";

        const teamInputs = document.getElementById("teamInputs");
        if (teamInputs) teamInputs.style.display = "block";

        const startButton = document.getElementById("startGameButton");
        if (startButton) startButton.style.display = "block";

        listenToPlayers(code);
        listenToGameState();

        alert("Spel aangemaakt: " + code);

    }).catch(error => {

        console.error("FOUT BIJ CREATE GAME:", error);
        alert(
            "Spel kon niet worden aangemaakt:\n\n" +
            error.message
        );
    });
}

function joinGame() {

    const code = document.getElementById("joinCode").value.trim();
    const name = document.getElementById("joinName").value.trim();

    if (!code || !name) {
        alert("Vul naam en spelcode in");
        return;
    }

    const gameRef = firebase.database().ref("games/" + code);

    gameRef.once("value")
        .then(snapshot => {

            const game = snapshot.val();

            if (!game) {
                alert("Spel bestaat niet.");
                return;
            }

            if (game.gameState && game.gameState !== "lobby") {
                alert("Dit spel is al gestart.");
                return;
            }

            const players = game.players || {};
            const playerIds = Object.keys(players);

            if (playerIds.length >= 4) {
                alert("Er kunnen maximaal 4 deelnemers meedoen.");
                return;
            }

            const usedTeams = playerIds.map(id => players[id].team);
            let team = 0;

            while (usedTeams.includes(team) && team < 4) {
                team++;
            }

            const colors = ["blue", "red", "green", "purple"];
            const playerId = "p" + Date.now();

            const player = {
                name: name,
                team: team,
                color: colors[team]
            };

            return gameRef
                .child("players")
                .child(playerId)
                .set(player)
                .then(() => {

                    window.currentGameCode = code;
                    window.isHost = false;
                    window.myPlayerId = playerId;
                    window.myTeam = team;
                    window.myColor = colors[team];

                    // Deelnemer mag de instellingen niet wijzigen.
                    const teamInputs = document.getElementById("teamInputs");
                    if (teamInputs) teamInputs.style.display = "none";

                    const teamCount = document.getElementById("teamCount");
                    if (teamCount) teamCount.style.display = "none";

                    const categorySelect = document.getElementById("categorySelect");
                    if (categorySelect) categorySelect.style.display = "none";

                    const startButton = document.getElementById("startGameButton");
                    if (startButton) startButton.style.display = "none";

                    listenToPlayers(code);
                    listenToGameState();

                    alert(
                        "Je doet mee!\n\n" +
                        "Team: " + (team + 1) +
                        "\nKleur: " + colors[team]
                    );
                });
        })
        .catch(error => {
            console.error("FOUT BIJ JOIN GAME:", error);
            alert("Deelnemen mislukt:\n\n" + error.message);
        });
}

function listenToPlayers(code) {

    firebase.database()
        .ref("games/" + code + "/players")
        .on("value", snapshot => {

            const players = snapshot.val();
            const list = document.getElementById("playersList");

            if (!list) return;

            list.innerHTML = "";

            if (!players) return;

            Object.keys(players).forEach(key => {
                const player = players[key];
                const div = document.createElement("div");

                div.innerText =
                    key === "host"
                        ? "👑 Host: " + player.name
                        : "👤 " + player.name;

                list.appendChild(div);
            });
        });
}

function renderSynchronizedBoard() {

    if (typeof updateBoard === "function") {
        updateBoard();
    }

}


function listenToGameState() {

    if (!window.currentGameCode) {
        return;
    }

    firebase.database()
        .ref("games/" + window.currentGameCode)
        .on("value", snapshot => {

            const game = snapshot.val();

            if (!game) {
                return;
            }

            console.log("🔥 GAME DATA:", game);


            // =========================
            // AANTAL TEAMS
            // =========================

            if (game.activeTeams !== undefined) {
                activeTeams =
                    parseInt(game.activeTeams, 10);
            }


            // =========================
            // TEAMNAMEN
            // =========================

            if (game.teamNames) {

                for (let i = 0; i < 4; i++) {

                    if (
                        game.teamNames[i] !== undefined &&
                        teams[i]
                    ) {

                        teams[i].name =
                            game.teamNames[i];
                    }
                }
            }


            // =========================
            // CATEGORIE
            // =========================

            if (game.selectedCategory) {
                selectedCategory =
                    game.selectedCategory;
            }


            // =========================
            // HUIDIGE BEURT
            // =========================

            if (game.currentTurn !== undefined) {
                currentTeam =
                    parseInt(game.currentTurn, 10);
            }


            // =========================
            // MIJN TEAM
            // =========================

            if (
                game.players &&
                window.myPlayerId &&
                game.players[window.myPlayerId]
            ) {

                window.myTeam =
                    parseInt(
                        game.players[window.myPlayerId].team,
                        10
                    );
            }


            // =========================
            // BORDPOSITIES
            // =========================

            if (game.teamPositions) {

                for (let i = 0; i < 4; i++) {

                    if (
                        game.teamPositions[i] !== undefined &&
                        teams[i]
                    ) {

                        teams[i].position =
                            parseInt(
                                game.teamPositions[i],
                                10
                            );
                    }
                }
            }


            // =========================
            // CATEGORIE OP SCHERM
            // =========================

            const categoryText =
                document.getElementById("currentCategory");

            if (categoryText) {
                categoryText.innerText =
                    "Categorie: " +
                    selectedCategory;
            }


            updateTurn();


            if (game.gameState !== "playing") {
                return;
            }


            // =====================================
            // TURN = DOBBEL-SCHERM
            // =====================================

            if (game.phase === "turn") {

                currentQuestion = null;
                explanationText.innerText = "";
                diceText.innerText = "";
                window.diceRolled = false;

                showScreen(screen1);

                if (
                    parseInt(currentTeam, 10) ===
                    parseInt(window.myTeam, 10)
                ) {

                    statusMessage.innerText =
                        "🎲 Jij bent aan de beurt.";

                } else {

                    statusMessage.innerText =
                        "⏳ Wacht op je beurt.";
                }

                renderSynchronizedBoard();
                return;
            }


            // =====================================
            // ROLLED = WORP ZICHTBAAR
            // =====================================

            if (game.phase === "rolled") {

                if (
                    game.roll !== undefined &&
                    game.roll !== null
                ) {

                    lastRoll =
                        parseInt(game.roll, 10);

                    diceText.innerText =
                        "🎲 Je gooide: " +
                        lastRoll;
                }

                showScreen(screen1);

                if (
                    parseInt(currentTeam, 10) ===
                    parseInt(window.myTeam, 10)
                ) {

                    statusMessage.innerText =
                        "🎲 Je hebt gegooid.";

                } else {

                    statusMessage.innerText =
                        "⏳ Even wachten...";
                }

                return;
            }


            // =====================================
            // QUESTION = ZELFDE VRAAG
            // =====================================

            if (game.phase === "question") {

                if (
                    game.roll !== undefined &&
                    game.roll !== null
                ) {

                    lastRoll =
                        parseInt(game.roll, 10);

                    diceText.innerText =
                        "🎲 Je gooide: " +
                        lastRoll;
                }

                showScreen(screen2);

                if (
                    game.questionIndex !== undefined &&
                    typeof loadSynchronizedQuestion === "function"
                ) {

                    loadSynchronizedQuestion(
                        game.questionIndex
                    );
                }

                return;
            }


            // =====================================
            // BOARD = SPEELBORD
            // =====================================

            if (game.phase === "board") {

                currentQuestion = null;
                explanationText.innerText = "";

                showScreen(screen3);

                if (
                    typeof showBoardDice === "function" &&
                    game.roll !== undefined &&
                    game.roll !== null
                ) {
                    showBoardDice(game.roll);
                }

                renderSynchronizedBoard();
                return;
            }

        });
}
