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

            host: hostName,

            gameState: "lobby",

            currentTeam: 0,

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

    if (!window.currentGameCode) return;

    firebase.database()
        .ref("games/" + window.currentGameCode + "/gameState")
        .on("value", snapshot => {

            const state = snapshot.val();

            // ===== TEST =====
            alert("GAME " + window.currentGameCode + " = " + state);
            // ================

            if (state === "playing") {
                
            alert("MULTIPLAYER ontvangt PLAYING");

                showScreen(screen1);

                if (typeof updateTurn === "function") {
                    updateTurn();
                }

                if (typeof selectedCategory !== "undefined") {
                    document.getElementById("currentCategory").innerText =
                        "Categorie: " + selectedCategory;
                }

            }

        });

}
