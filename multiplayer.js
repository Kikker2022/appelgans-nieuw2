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
    .ref("games/" + window.currentGameCode)
    .update({

        gameState: "playing",

        currentTurn: 0,

        activeTeams: activeTeams,

        selectedCategory: selectedCategory,

        teamNames: {
            0: teams[0].name,
            1: teams[1].name,
            2: teams[2].name,
            3: teams[3].name
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

            // Alleen de host krijgt de startknop
            document.getElementById("startGameButton").style.display = "block";

            alert("Spel aangemaakt: " + code);

        })
        .catch(error => {

            console.error("FOUT BIJ CREATE GAME:", error);

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

            console.log("🔥 GAME DATA:", game);

            // =========================
            // TEAMNAMEN SYNCHRONISEREN
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
            // AANTAL TEAMS SYNCHRONISEREN
            // =========================

            if (game.activeTeams !== undefined) {

                activeTeams =
                    parseInt(game.activeTeams);

            }


            // =========================
            // BEURT SYNCHRONISEREN
            // =========================

            if (game.currentTurn !== undefined) {

                currentTeam =
                    parseInt(game.currentTurn);

            }


            // =========================
            // SPELSTATUS
            // =========================

            const state =
                game.gameState;

            console.log(
                "GAME STATE:",
                state
            );


            if (state === "playing") {

                showScreen(screen1);

                updateTurn();

                const category =
                    game.selectedCategory;

                if (category) {

                    selectedCategory =
                        category;

                    document.getElementById(
                        "currentCategory"
                    ).innerText =
                        "Categorie: " +
                        selectedCategory;

                }

            }

        });

}
