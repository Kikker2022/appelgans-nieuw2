/* =========================================================
   APPELGANS - MULTIPLAYER
   ========================================================= */


/* =========================================================
   SPEL AANMAKEN
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


            listenToPlayers(code);

            listenToGameState();


            /* Alleen host krijgt Start spel */

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


            /* Spel mag alleen tijdens lobby betreden worden */

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
                    "Er kunnen maximaal 4 teams meedoen."
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


                    listenToPlayers(code);

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

        .ref(
            "games/" +
            code +
            "/players"
        )

        .on(
            "value",
            snapshot => {

                const players =
                    snapshot.val();


                const list =
                    document.getElementById(
                        "playersList"
                    );


                if (!list) {

                    return;
                }


                list.innerHTML = "";


                if (!players) {

                    return;
                }


                Object.keys(players)
                    .forEach(key => {

                        const player =
                            players[key];


                        const div =
                            document.createElement(
                                "div"
                            );


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

            }

        );

}


/* =========================================================
   FIREBASE SPELSTATUS
   ========================================================= */

function listenToGameState() {

    if (!window.currentGameCode) {

        return;
    }


    firebase.database()

        .ref(
            "games/" +
            window.currentGameCode
        )

        .on(
            "value",
            snapshot => {

                const game =
                    snapshot.val();


                if (!game) {

                    return;
                }


                console.log(
                    "GAME DATA:",
                    game
                );


                /* =========================
                   AANTAL TEAMS
                   ========================= */

                if (
                    game.activeTeams !==
                    undefined
                ) {

                    activeTeams =
                        parseInt(
                            game.activeTeams
                        );

                }


                /* =========================
                   TEAMNAMEN
                   ========================= */

                if (game.teamNames) {

                    for (
                        let i = 0;
                        i < 4;
                        i++
                    ) {

                        if (
                            game.teamNames[i] !==
                                undefined &&
                            teams[i]
                        ) {

                            teams[i].name =
                                game.teamNames[i];

                        }

                    }

                }


                /* =========================
                   CATEGORIE
                   ========================= */

                if (
                    game.selectedCategory
                ) {

                    selectedCategory =
                        game.selectedCategory;

                }


                /* =========================
                   BEURT
                   ========================= */

                if (
                    game.currentTurn !==
                    undefined
                ) {

                    currentTeam =
                        parseInt(
                            game.currentTurn
                        );

                }


                /* =========================
                   TEAMOVERZICHT
                   ========================= */

                for (
                    let i = 0;
                    i < 4;
                    i++
                ) {

                    const display =
                        document.getElementById(
                            "displayTeam" +
                            (i + 1)
                        );


                    if (!display) {

                        continue;
                    }


                    const row =
                        display.parentElement;


                    if (
                        i < activeTeams
                    ) {

                        display.innerText =
                            teams[i].name;


                        if (row) {

                            row.style.display =
                                "block";

                        }

                    } else {

                        if (row) {

                            row.style.display =
                                "none";

                        }

                    }

                }


                /* =========================
                   SPEL GESTART
                   ========================= */

                if (
                    game.gameState ===
                    "playing"
                ) {


                    /*
                     * Deelnemers gaan automatisch
                     * naar scherm 1.
                     */

                    if (!window.isHost) {

                        showScreen(screen1);

                    }


                    updateTurn();


                    const categoryText =
                        document.getElementById(
                            "currentCategory"
                        );


                    if (categoryText) {

                        categoryText.innerText =
                            "Categorie: " +
                            selectedCategory;

                    }

                }

            }

        );

}
