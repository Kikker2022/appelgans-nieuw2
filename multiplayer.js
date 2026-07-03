function createGame() {

    const code =
        document.getElementById("gameCode").value;

    const hostName =
        document.getElementById("hostName").value;

    if (!code || !hostName) {
        alert("Vul naam en 4-cijferige code in");
        return;
    }

    firebase.database().ref("games/" + code).set({
        host: hostName,
        players: {
            host: {
                name: hostName
            }
        },
        createdAt: Date.now()
    });

    alert("Spel aangemaakt! Code: " + code);

}

function joinGame() {

    const code =
        document.getElementById("joinCode").value;

    const name =
        document.getElementById("joinName").value;

    if (!code || !name) {
        alert("Vul naam en code in");
        return;
    }

    const playersRef =
        firebase.database().ref("games/" + code + "/players");

    playersRef.once("value").then(snapshot => {

        const count = snapshot.numChildren();

        if (count >= 4) {
            alert("Spel is vol");
            return;
        }

        const playerId = "p" + Date.now();

        playersRef.child(playerId).set({
            name: name
        });

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

        Object.values(data).forEach(player => {

            const div =
                document.createElement("div");

            div.innerText = "👤 " + player.name;

            list.appendChild(div);

        });

    });

}
