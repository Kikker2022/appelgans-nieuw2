function createGame() {

    const code = document.getElementById("gameCode").value;
    const hostName = document.getElementById("hostName").value;

    if (!code || !hostName) {
        alert("Vul naam en 4-cijferige code in");
        return;
    }

    console.log("CREATE GAME OK");

 firebase.database().ref("games/" + code).set({
    host: hostName,
    gameState: "lobby",
    currentTeamIndex: 0,
    turnOrder: ["team1","team2","team3","team4"],
    players: {
        host: { name: hostName }
    }
});

listenToPlayers(code);
    
alert("Spel aangemaakt: " + code);
}

function joinGame() {

    const code =
        document.getElementById("joinCode").value;

    const name =
        document.getElementById("joinName").value;

    const playersRef =
        firebase.database().ref("games/" + code + "/players");

    playersRef.once("value").then(snapshot => {

        if (snapshot.numChildren() >= 4) {
            alert("Spel is vol");
            return;
        }

        const playerId = "p" + Date.now();

        playersRef.child(playerId).set({
            name: name
        });

        // 👇 ook hier live luisteren starten
        listenToPlayers(code);

        alert("Je zit in het spel!");
    });
}

function listenToPlayers(code) {

    const playersRef =
        firebase.database().ref("games/" + code + "/players");

    playersRef.on("value", snapshot => {

        const data = snapshot.val();

        const list =
            document.getElementById("playerList");

        list.innerHTML = "";

        if (!data) return;

        Object.keys(data).forEach(key => {

            const player = data[key];

            const div =
                document.createElement("div");

            if (key === "host") {
                div.innerText = "👑 HOST: " + player.name;
            } else {
                div.innerText = "👤 " + player.name;
            }

            list.appendChild(div);

        });

    });

}

function nextTurn(code) {

    const gameRef = firebase.database().ref("games/" + code);

    gameRef.once("value").then(snapshot => {

        const game = snapshot.val();

        let index = game.currentTeamIndex || 0;

        index++;

        if (index >= game.turnOrder.length) {
            index = 0;
        }

        gameRef.update({
            currentTeamIndex: index,
            phase: "turnChanged"
        });

    });

}

function listenToTurns(code) {

    firebase.database().ref("games/" + code + "/currentTeamIndex")
    .on("value", snapshot => {

        const index = snapshot.val();

        showTurn(index);

    });

}

function startGame() {

    const code = document.getElementById("gameCode").value;

    firebase.database().ref("games/" + code).update({
        gameState: "playing"
    });

}
