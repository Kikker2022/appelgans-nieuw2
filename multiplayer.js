function createGame() {

    const code =
        document.getElementById("gameCode").value;

    const hostName =
        document.getElementById("hostName").value;

    firebase.database().ref("games/" + code).set({
        host: hostName,
        players: {
            host: {
                name: hostName
            }
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
