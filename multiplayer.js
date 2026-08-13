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


            // Host blijft op scherm 0.
            // Deelnemers kunnen zich hier aanmelden.

            listenToPlayers(code);

            listenToGameState();


            // Startknop alleen voor de host zichtbaar maken

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

function joinGame() {

    const code =
        document.getElementById("joinCode").value.trim();

    const name =
        document.getElementById("joinName").value.trim();

    if (!code || !name) {
        alert("Vul naam en spelcode in");
        return;
    }

    const gameRef =
        firebase.database().ref("games/" + code);

    gameRef.once("value")
        .then(snapshot => {

            const game = snapshot.val();

            if (!game) {
                alert("Spel bestaat niet.");
                return;
            }

            const players =
                game.players || {};

            const playerIds =
                Object.keys(players);

            if (playerIds.length >= 4) {
                alert("Er kunnen maximaal 4 teams meedoen.");
                return;
            }

            // Eerste vrije team/kleur
            const usedTeams =
                playerIds.map(id => players[id].team);

            let team = 0;

            while (usedTeams.includes(team) && team < 4) {
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

                    window.currentGameCode = code;
                    window.isHost = false;

                    window.myPlayerId = playerId;
                    window.myTeam = team;
                    window.myColor = colors[team];

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

            alert(
                "Deelnemen mislukt:\n\n" +
                error.message
            );

        });
}

function listenToPlayers(code) {

    firebase.database()
        .ref("games/" + code + "/players")
        .on("value", snapshot => {

            const players = snapshot.val();

            const list =
                document.getElementById("playersList");

            if (!list) return;

            list.innerHTML = "";

            if (!players) return;

            Object.keys(players).forEach(key => {

                const player = players[key];

                const div =
                    document.createElement("div");

                div.innerText = player.name;

                list.appendChild(div);

            });

        });

}

// =========================
// AANTAL TEAMS
// =========================

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


            // Host blijft op scherm 0.
            // Deelnemers kunnen zich hier aanmelden.

            listenToPlayers(code);

            listenToGameState();


            // Startknop alleen voor de host zichtbaar maken

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

function joinGame() {

    const code =
        document.getElementById("joinCode").value.trim();

    const name =
        document.getElementById("joinName").value.trim();

    if (!code || !name) {
        alert("Vul naam en spelcode in");
        return;
    }

    const gameRef =
        firebase.database().ref("games/" + code);

    gameRef.once("value")
        .then(snapshot => {

            const game = snapshot.val();

            if (!game) {
                alert("Spel bestaat niet.");
                return;
            }

            const players =
                game.players || {};

            const playerIds =
                Object.keys(players);

            if (playerIds.length >= 4) {
                alert("Er kunnen maximaal 4 teams meedoen.");
                return;
            }

            // Eerste vrije team/kleur
            const usedTeams =
                playerIds.map(id => players[id].team);

            let team = 0;

            while (usedTeams.includes(team) && team < 4) {
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

                    window.currentGameCode = code;
                    window.isHost = false;

                    window.myPlayerId = playerId;
                    window.myTeam = team;
                    window.myColor = colors[team];

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

            alert(
                "Deelnemen mislukt:\n\n" +
                error.message
            );

        });
}

function listenToPlayers(code) {

    firebase.database()
        .ref("games/" + code + "/players")
        .on("value", snapshot => {

            const players = snapshot.val();

            const list =
                document.getElementById("playersList");

            if (!list) return;

            list.innerHTML = "";

            if (!players) return;

            Object.keys(players).forEach(key => {

                const player = players[key];

                const div =
                    document.createElement("div");

                div.innerText = player.name;

                list.appendChild(div);

            });

        });

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

            console.log("GAME DATA:", game);


            // =========================
            // AANTAL TEAMS
            // =========================

            if (game.activeTeams !== undefined) {

                activeTeams =
                    parseInt(game.activeTeams);

            }


            // =========================
            // TEAMNAMEN UIT FIREBASE
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
                    parseInt(game.currentTurn);

            }


            // =========================
            // TEAMNAMEN OP SCHERM ZETTEN
            // =========================

            for (let i = 0; i < 4; i++) {

                const display =
                    document.getElementById(
                        "displayTeam" + (i + 1)
                    );

                if (!display) {
                    continue;
                }


                // Alleen actieve teams tonen

                if (i < activeTeams) {

                    display.innerText =
                        teams[i].name;

                    // De <p> waarin het team staat
                    // zichtbaar houden

                    if (display.parentElement) {

                        display.parentElement.style.display =
                            "block";

                    }

                } else {

                    // Niet gebruikte teams verbergen

                    if (display.parentElement) {

                        display.parentElement.style.display =
                            "none";

                    }

                }

            }


            // =========================
            // SPELSTATUS
            // =========================

            if (game.gameState === "playing") {

                // Deelnemers gaan automatisch
                // naar scherm 1.

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

        });

}

