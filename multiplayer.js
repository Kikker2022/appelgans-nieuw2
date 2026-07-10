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
