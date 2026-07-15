function createGame() {

    const code =
        document.getElementById("gameCode").value.trim();

    const hostName =
        document.getElementById("hostName").value.trim();

    if (!code || !hostName) {
        alert("Vul naam en spelcode in");
        return;
    }

    firebase.database().ref("games/" + code).set({

        host: hostName,

        gameState: "lobby",

        players: {
            host: {
                name: hostName
            }
        }

    });

    window.currentGameCode = code;
    window.isHost = true;

    listenToPlayers(code);
    listenToGameState();

    document.getElementById("startGameButton").style.display = "block";
    
    alert("Spel aangemaakt: " + code);

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

    const playerId =
        "p" + Date.now();

    firebase.database()
        .ref("games/" + code + "/players/" + playerId)
        .set({
            name: name
        });

    window.currentGameCode = code;
    window.isHost = false;

    listenToPlayers(code);
    listenToGameState();

    document.getElementById("startGameButton").style.display = "none";
    
    alert("Je doet mee!");

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
