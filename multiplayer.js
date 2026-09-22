/* =========================================================
   APPELGANS - MULTIPLAYER.JS
   ========================================================= */

/* =========================================================
   APPELGANS - HERSTART / VERBINDING BEVEILIGING
   ========================================================= */

const PLAYER_STORAGE_PREFIX = "appelgansPlayer_";
const DISCONNECTED_TURN_WAIT_MS = 30000;

function getPlayerStorageKey(code) {
    return PLAYER_STORAGE_PREFIX + String(code).trim();
}

function getSavedPlayerId(code) {
    try {
        return localStorage.getItem(getPlayerStorageKey(code));
    } catch (error) {
        console.warn("Lokale speler-ID kon niet worden gelezen:", error);
        return null;
    }
}

function savePlayerId(code, playerId) {
    try {
        localStorage.setItem(getPlayerStorageKey(code), playerId);
    } catch (error) {
        console.warn("Lokale speler-ID kon niet worden opgeslagen:", error);
    }
}

function setupPlayerPresence(code, playerId) {

    if (!code || !playerId) return;

    const playerRef = firebase.database()
        .ref("games/" + code + "/players/" + playerId);

    firebase.database().ref(".info/connected").on("value", snapshot => {

        if (snapshot.val() !== true) return;

        playerRef.onDisconnect().update({
            connected: false,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.warn("onDisconnect kon niet worden ingesteld:", error);
        });

        playerRef.update({
            connected: true,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.warn("Aanwezigheid kon niet worden opgeslagen:", error);
        });
    });
}

function findConnectedPlayerForTeam(players, team) {

    if (!players) return null;

    const keys = Object.keys(players);

    for (const key of keys) {
        const player = players[key];

        if (
            player &&
            parseInt(player.team, 10) === parseInt(team, 10) &&
            player.connected !== false
        ) {
            return key;
        }
    }

    return null;
}

function advancePastDisconnectedTeam(code) {

    if (!code) return;

    firebase.database()
        .ref("games/" + code)
        .transaction(game => {

            if (!game || game.gameState !== "playing") {
                return;
            }

            if (game.phase !== "turn" && game.phase !== "rolled" && game.phase !== "question") {
                return;
            }

            const teamCount = parseInt(game.activeTeams, 10) || 0;
            const current = parseInt(game.currentTurn, 10);

            if (teamCount < 1 || !Number.isInteger(current)) {
                return;
            }

            // Alleen overslaan als de huidige speler echt offline is.
            if (findConnectedPlayerForTeam(game.players, current)) {
                return;
            }

            let next = current;

            for (let i = 1; i <= teamCount; i++) {
                const candidate = (current + i) % teamCount;

                if (findConnectedPlayerForTeam(game.players, candidate)) {
                    next = candidate;
                    break;
                }
            }

            if (next === current) {
                return;
            }

            return {
                ...game,
                currentTurn: next,
                phase: "turn",
                roll: null,
                questionIndex: null,
                disconnectedTurnSkippedAt: Date.now()
            };
        })
        .catch(error => {
            console.warn("Offline beurt kon niet worden overgeslagen:", error);
        });
}

function monitorCurrentPlayer(code, game) {

    if (!code || !game || game.gameState !== "playing") return;

    const current = parseInt(game.currentTurn, 10);
    const playerId = findConnectedPlayerForTeam(game.players, current);

    if (playerId) return;

    // Geef een korte herstelperiode. Daardoor kan een telefoon met
    // een tijdelijke verbinding niet direct zijn beurt verliezen.
    const marker =
        String(code) + "_" +
        String(current) + "_" +
        String(game.phase || "");

    if (window._disconnectTimerMarker === marker) return;

    window._disconnectTimerMarker = marker;

    setTimeout(() => {
        window._disconnectTimerMarker = null;
        advancePastDisconnectedTeam(code);
    }, DISCONNECTED_TURN_WAIT_MS);
}

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
        color: "blue",
        connected: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
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
             * Controleer hoe oud het bestaande spel is.
             *
             * BELANGRIJK:
             * Oude spellen van vóór de 24-uurs-beveiliging hebben
             * geen createdAt. Die moeten NIET voor altijd een code
             * blokkeren. Daarom worden zulke oude spellen hier als
             * verlopen beschouwd en vervangen door het nieuwe spel.
             */
            if (typeof currentData.createdAt === "number") {

                const leeftijd = Date.now() - currentData.createdAt;

                if (leeftijd >= 0 && leeftijd < CODE_GELDIGHEID_MS) {
                    // Code is nog geen 24 uur oud en dus in gebruik.
                    return;
                }
            }

            // Geen createdAt, een ongeldige datum of 24 uur of ouder:
            // het oude spel is verlopen en mag worden vervangen.
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
                "Deze code is nog in gebruik.\n\n" +
                "Een spelcode blijft 24 uur gereserveerd.\n" +
                "Gebruik een andere code."
            );
            return;
        }

        window.currentGameCode = code;
        window.isHost = true;
        window.myPlayerId = "host";
        window.myTeam = 0;
        window.myColor = "blue";
        savePlayerId(code, "host");
        setupPlayerPresence(code, "host");

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

            const players = game.players || {};
            const savedPlayerId = getSavedPlayerId(code);

            // ---------------------------------------------------------
            // BESTAANDE SPELER OPNIEUW VERBINDEN
            // ---------------------------------------------------------
            if (
                savedPlayerId &&
                players[savedPlayerId]
            ) {

                const existingPlayer = players[savedPlayerId];
                const team = parseInt(existingPlayer.team, 10);
                const color = existingPlayer.color ||
                    ["blue", "red", "green", "purple"][team];

                return gameRef
                    .child("players")
                    .child(savedPlayerId)
                    .update({
                        name: name,
                        connected: true,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    })
                    .then(() => {

                        window.currentGameCode = code;
                        window.isHost = savedPlayerId === "host";
                        window.myPlayerId = savedPlayerId;
                        window.myTeam = team;
                        window.myColor = color;

                        setupPlayerPresence(code, savedPlayerId);

                        if (savedPlayerId === "host" && game.gameState === "lobby") {
                            const teamInputs = document.getElementById("teamInputs");
                            if (teamInputs) teamInputs.style.display = "block";

                            const startButton = document.getElementById("startGameButton");
                            if (startButton) startButton.style.display = "block";
                        } else {
                            prepareJoinedPlayerScreen();
                        }

                        listenToPlayers(code);
                        listenToGameState();

                        alert(
                            "Je bent opnieuw verbonden!\n\n" +
                            "Team: " + (team + 1) +
                            "\nKleur: " + color +
                            "\n\nJe gaat verder vanaf je bestaande spelpositie."
                        );
                    });
            }

            // ---------------------------------------------------------
            // EEN NIEUWE SPELER MAG ALLEEN IN DE LOBBY INSTAPPEN
            // ---------------------------------------------------------
            if (game.gameState && game.gameState !== "lobby") {
                alert(
                    "Dit spel is al gestart.\n\n" +
                    "Als je al eerder met deze telefoon meespeelde, gebruik dan dezelfde spelcode en naam om opnieuw te verbinden."
                );
                return;
            }

            const playerIds = Object.keys(players);

            if (playerIds.length >= 4) {
                alert("Er kunnen maximaal 4 deelnemers meedoen.");
                return;
            }

            const usedTeams = playerIds.map(id =>
                parseInt(players[id].team, 10)
            );

            let team = 0;

            while (usedTeams.includes(team) && team < 4) {
                team++;
            }

            if (team >= 4) {
                alert("Alle teams zijn al bezet.");
                return;
            }

            const colors = ["blue", "red", "green", "purple"];
            const playerId = "p" + Date.now() + "_" +
                Math.random().toString(36).slice(2, 8);

            const player = {
                name: name,
                team: team,
                color: colors[team],
                connected: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            };

            return gameRef
                .child("players")
                .child(playerId)
                .set(player)
                .then(() => {

                    savePlayerId(code, playerId);

                    window.currentGameCode = code;
                    window.isHost = false;
                    window.myPlayerId = playerId;
                    window.myTeam = team;
                    window.myColor = colors[team];

                    setupPlayerPresence(code, playerId);
                    prepareJoinedPlayerScreen();
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

function prepareJoinedPlayerScreen() {

    const teamInputs = document.getElementById("teamInputs");
    if (teamInputs) teamInputs.style.display = "none";

    const teamCount = document.getElementById("teamCount");
    if (teamCount) teamCount.style.display = "none";

    const categorySelect = document.getElementById("categorySelect");
    if (categorySelect) categorySelect.style.display = "none";

    const startButton = document.getElementById("startGameButton");
    if (startButton) startButton.style.display = "none";
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

                const onlineText =
                    player.connected === false
                        ? " — offline"
                        : " — online";

                div.innerText =
                    key === "host"
                        ? "👑 Host: " + player.name + onlineText
                        : "👤 " + player.name + onlineText;

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

            // Als de huidige speler offline is, geef hem eerst 30 seconden
            // om opnieuw te verbinden. Daarna gaat het spel automatisch
            // verder met het eerstvolgende verbonden team.
            monitorCurrentPlayer(window.currentGameCode, game);


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
            // BEURTEN OVERSLAAN
            // =========================

            if (game.teamSkipTurns) {

                for (let i = 0; i < 4; i++) {

                    if (
                        game.teamSkipTurns[i] !== undefined &&
                        teams[i]
                    ) {
                        teams[i].skipTurns =
                            parseInt(game.teamSkipTurns[i], 10) || 0;
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
