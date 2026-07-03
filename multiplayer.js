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
