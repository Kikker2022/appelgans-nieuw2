/* =========================================================
   APPELGANS - MULTIPLAYER.JS
   ========================================================= */


/* =========================================================
   SPEL AANMAKEN - ALLEEN HOST
   ========================================================= */

function createGame() {

    const code =
        document.getElementById("gameCode").value.trim();

    const hostName =
        document.getElementById("hostName").value.trim();


    if (!code || !hostName) {

        alert("Vul naam en spelcode in");

        return;
    }


    const hostPlayer = {

        name: hostName,

        team: 0,

        color: "blue"

    };


    firebase.database()
        .ref("games/" + code)
        .set({

            gameState: "lobby",

            currentTurn: 0,

            players: {

                host: hostPlayer

            }

        })

        .then(() => {

            window.currentGameCode = code;

            window.isHost = true;

            window.myPlayerId = "host";

            window.myTeam = 0;

            window.myColor = "blue";


            /* Luister naar spelers */

            listenToPlayers(code);


            /* Luister naar game-status */

            listenToGameState();


            /* Startknop alleen zichtbaar voor host */

            const startButton =
                document.getElementById(
                    "startGameButton"
                );


            if (startButton) {

                startButton.style.display =
                    "block";

            }


            alert(
                "Spel aangemaakt: " + code
            );

        })

        .catch(error => {

            console.error(
                "FOUT BIJ CREATE GAME:",
                error
            );

            alert(
                "Spel kon niet worden aangemaakt:\n\n" +
                error.message
            );

        });

}



/* =========================================================
   DEELNEMER LAAT MEEDOEN
   ========================================================= */

function joinGame() {

    const code =
        document.getElementById("joinCode").value.trim();

    const name =
        document.getElementById("joinName").value.trim();


    if (!code || !name) {

        alert(
            "Vul naam en spelcode in"
        );

        return;
    }


    const gameRef =
        firebase.database()
            .ref("games/" + code);


    gameRef.once("value")
        .then(snapshot => {

            const game =
                snapshot.val();


            if (!game) {

                alert(
                    "Spel bestaat niet."
                );

                return;
            }


            /* Alleen meedoen als de lobby nog open is */

            if (
                game.gameState &&
                game.gameState !== "lobby"
            ) {

                alert(
                    "Dit spel is al gestart."
                );

                return;
            }


            const players =
                game.players || {};


            const playerIds =
                Object.keys(players);


            if (playerIds.length >= 4) {

                alert(
                    "Er kunnen maximaal 4 spelers meedoen."
                );

                return;
            }


            /* Eerste vrije team/kleur */

            const usedTeams =
                playerIds.map(
                    id => players[id].team
                );


            let team = 0;


            while (
                usedTeams.includes(team) &&
                team < 4
            ) {

                team++;

            }


            const colors = [

                "blue",

                "red",

                "green",

                "purple"

            ];


            const playerId =
                "p" + Date.now();


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

                    window.currentGameCode =
                        code;

                    window.isHost =
                        false;

                    window.myPlayerId =
                        playerId;

                    window.myTeam =
                        team;

                    window.myColor =
                        colors[team];


                    /* Luisteren naar spelers */

                    listenToPlayers(code);


                    /* Luisteren naar game-status */

                    listenToGameState();


                    alert(
                        "Je doet mee!\n\n" +
                        "Team: " +
                        (team + 1) +
                        "\nKleur: " +
                        colors[team]
                    );

                });

        })

        .catch(error => {

            console.error(
                "FOUT BIJ JOIN GAME:",
                error
            );

            alert(
                "Deelnemen mislukt:\n\n" +
                error.message
            );

        });

}



/* =========================================================
   SPELERS IN LOBBY TONEN
   ========================================================= */

function listenToPlayers(code) {

    firebase.database()
        .ref("games/" + code + "/players")
        .on("value", snapshot => {

            const players = snapshot.val();

            const list =
                document.getElementById("playersList");

            if (!list) {
                return;
            }

            list.innerHTML = "";

            if (!players) {
                return;
            }


            // =====================================
            // SPELERSLIJST
            // =====================================

            Object.keys(players).forEach(key => {

                const player =
                    players[key];

                const div =
                    document.createElement("div");

                if (key === "host") {

                    div.innerText =
                        "👑 Host: " +
                        player.name;

                } else {

                    div.innerText =
                        "👤 " +
                        player.name;

                }

                list.appendChild(div);

            });


            // =====================================
            // KOPPEL NAAM AAN KLEUR/TEAM
            // =====================================

            for (let i = 0; i < 4; i++) {

                const display =
                    document.getElementById(
                        "displayTeam" + (i + 1)
                    );

                if (!display) {
                    continue;
                }


                let playerForTeam = null;


                Object.keys(players).forEach(key => {

                    const player =
                        players[key];

                    if (
                        player &&
                        player.team === i
                    ) {

                        playerForTeam =
                            player;

                    }

                });


                if (playerForTeam) {

                    // BELANGRIJK:
                    // naam ook in teams[] zetten

                    teams[i].name =
                        playerForTeam.name;


                    display.innerText =
                        playerForTeam.name;


                    if (display.parentElement) {

                        display.parentElement.style.display =
                            "block";

                    }

                } else {

                    teams[i].name = "";

                    display.innerText = "";

                    if (display.parentElement) {

                        display.parentElement.style.display =
                            "none";

                    }

                }

            }


            // Beurt opnieuw tekenen
            if (
                typeof updateTurn === "function"
            ) {

                updateTurn();

            }

        });

}



/* =========================================================
   GAMESTATE - ALLE TELEFOONS
   ========================================================= */

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

            console.log("GAME DATA:", game);


            // =====================================
            // AANTAL TEAMS
            // =====================================

            if (game.activeTeams !== undefined) {

                activeTeams =
                    parseInt(game.activeTeams, 10);

            }


            // =====================================
            // TEAMNAMEN
            // =====================================

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


            // =====================================
            // MIJN TEAM
            // =====================================

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


            // =====================================
            // HUIDIGE BEURT
            // =====================================

            if (game.currentTurn !== undefined) {

                currentTeam =
                    parseInt(
                        game.currentTurn,
                        10
                    );

            }


            // =====================================
            // CATEGORIE
            // =====================================

            if (game.selectedCategory) {

                selectedCategory =
                    game.selectedCategory;

            }


            // =====================================
            // TEAMOVERZICHT
            // =====================================

            updateTurn();


            // =====================================
            // SPEL GESTART
            // =====================================

            if (game.gameState === "playing") {

                /*
                 * BELANGRIJK:
                 * De fase bepaalt nu welk scherm
                 * iedereen moet zien.
                 */


                // ---------------------------------
                // FASE: TURN
                // ---------------------------------

                if (game.phase === "turn") {

                    /*
                     * Oude vraag afsluiten
                     */

                    currentQuestion = null;

                    explanationText.innerText = "";

                    diceText.innerText = "";


                    /*
                     * Iedereen naar scherm 1
                     */

                    showScreen(screen1);


                    /*
                     * Alleen het team aan de beurt
                     * mag gooien.
                     */

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


                    /*
                     * Nieuwe beurt = opnieuw gooien toegestaan
                     */

                    window.diceRolled = false;

                    return;
                }


                // ---------------------------------
                // FASE: QUESTION
                // ---------------------------------

                if (game.phase === "question") {

                    /*
                     * Iedereen ziet dezelfde worp
                     */

                    if (game.roll !== undefined) {

                        lastRoll =
                            parseInt(
                                game.roll,
                                10
                            );

                        diceText.innerText =
                            "🎲 Je gooide: " +
                            lastRoll;

                    }


                    /*
                     * Iedereen naar vraag-scherm
                     */

                    showScreen(screen2);


                    /*
                     * Exact dezelfde vraag laden
                     */

                    if (
                        game.questionIndex !==
                        undefined
                    ) {

                        loadSynchronizedQuestion(
                            game.questionIndex
                        );

                    }

                    return;
                }

            }

        });

}
