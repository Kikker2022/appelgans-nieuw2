/* =========================================================
   APPELGANS - MULTIPLAYER.JS
   ========================================================= */

/* =========================================================
   APPELGANS - HERSTART / VERBINDING BEVEILIGING
   ========================================================= */

const PLAYER_STORAGE_PREFIX = "appelgansPlayer_";
const DISCONNECTED_TURN_WAIT_MS = 30000;
const HOST_SKIP_DECISION_MS = 30000;

function getPlayerStorageKey(code) {
    return PLAYER_STORAGE_PREFIX + String(code).trim();
}

function getSavedPlayerId(code) {
    try {
        return localStorage.getItem(getPlayerStorageKey(code));
    } catch (error) {
        console.warn("Lokale speler-ID kon niet worden gelezen:", error);
        return null;
    }
}

function savePlayerId(code, playerId) {
    try {
        localStorage.setItem(getPlayerStorageKey(code), playerId);
        localStorage.setItem("appelgansLastGameCode", String(code).trim());
    } catch (error) {
        console.warn("Lokale speler-ID kon niet worden opgeslagen:", error);
    }
}

function getLastGameCode() {
    try {
        return localStorage.getItem("appelgansLastGameCode");
    } catch (error) {
        return null;
    }
}

function setupPlayerPresence(code, playerId) {

    if (!code || !playerId) return;

    const playerRef = firebase.database()
        .ref("games/" + code + "/players/" + playerId);

    const presenceKey = String(code).trim() + "_" + String(playerId);

    window._appelgansPresence = window._appelgansPresence || {};

    // Als deze pagina al een presence-bewaking voor deze speler heeft,
    // maken we niet nog een tweede listener/timer aan.
    if (window._appelgansPresence[presenceKey]) {
        return;
    }

    const sessionId =
        Date.now().toString(36) + "_" +
        Math.random().toString(36).slice(2, 10);

    const presenceState = {
        sessionId: sessionId,
        heartbeatTimer: null
    };

    window._appelgansPresence[presenceKey] = presenceState;

    function writeOnlineStatus() {
        return playerRef.update({
            connected: true,
            presenceSession: sessionId,
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.warn("Aanwezigheid kon niet worden opgeslagen:", error);
        });
    }

    firebase.database().ref(".info/connected").on("value", snapshot => {

        if (snapshot.val() !== true) {
            return;
        }

        /*
         * BELANGRIJK:
         * We laten een oude browser/Firebase-verbinding niet meer rechtstreeks
         * connected:false schrijven. Een oude onDisconnect kon anders een
         * nieuwere verbinding van dezelfde telefoon ten onrechte offline zetten.
         *
         * De actieve telefoon bevestigt elke 10 seconden zijn aanwezigheid.
         * De bestaande 30+30-logica gebruikt lastSeen om een werkelijk verdwenen
         * speler pas na de ingestelde wachttijd over te slaan.
         */
        playerRef.onDisconnect().update({
            lastSeen: firebase.database.ServerValue.TIMESTAMP
        }).catch(error => {
            console.warn("onDisconnect kon niet worden ingesteld:", error);
        });

        writeOnlineStatus();

        if (presenceState.heartbeatTimer) {
            clearInterval(presenceState.heartbeatTimer);
        }

        presenceState.heartbeatTimer = setInterval(() => {
            writeOnlineStatus();
        }, 10000);
    });
}

function findConnectedPlayerForTeam(players, team) {

    if (!players) return null;

    const keys = Object.keys(players);

    for (const key of keys) {
        const player = players[key];

        if (
            player &&
            parseInt(player.team, 10) === parseInt(team, 10) &&
            player.connected !== false
        ) {
            return key;
        }
    }

    return null;
}

function getOfflineTeamLabel(team) {
    const colors = ["🔵 Blauw", "🔴 Rood", "🟢 Groen", "🟣 Paars"];
    return colors[parseInt(team, 10)] || ("Team " + (parseInt(team, 10) + 1));
}

function showClearTurnIndicator(isMyTurn) {

    if (!statusMessage) return;

    const teamIndex = parseInt(currentTeam, 10);
    const team = teams[teamIndex];

    if (!team) return;

    const teamName = team.name || ("Team " + (teamIndex + 1));
    const colorName = (team.colorName || "").toUpperCase();
    const icon = team.icon || "";

    statusMessage.style.display = "block";
    statusMessage.style.width = "min(92vw, 520px)";
    statusMessage.style.boxSizing = "border-box";
    statusMessage.style.margin = "14px auto";
    statusMessage.style.padding = "14px 12px";
    statusMessage.style.borderRadius = "14px";
    statusMessage.style.textAlign = "center";
    statusMessage.style.fontSize = "clamp(1.05rem, 4.8vw, 1.45rem)";
    statusMessage.style.fontWeight = "800";
    statusMessage.style.lineHeight = "1.35";
    statusMessage.style.background = "rgba(255,255,255,0.96)";
    statusMessage.style.border = "3px solid " + (team.color || "#333");
    statusMessage.style.boxShadow = "0 3px 12px rgba(0,0,0,0.16)";

    if (isMyTurn) {
        statusMessage.innerText =
            icon + " " +
            colorName + " – " +
            teamName +
            "\n🎲 JIJ BENT AAN DE BEURT";
    } else {
        statusMessage.innerText =
            "⏳ Wachten op " +
            icon + " " +
            colorName + " – " +
            teamName;
    }
}

function removeOfflineWaitBanner() {
    const banner = document.getElementById("offlineWaitBanner");
    if (banner) banner.remove();
}

function renderOfflineWaitBanner(game) {
    const wait = game && game.offlineTurnWait;

    if (!wait || parseInt(wait.team, 10) !== parseInt(game.currentTurn, 10)) {
        removeOfflineWaitBanner();
        return;
    }

    let banner = document.getElementById("offlineWaitBanner");
    if (!banner) {
        banner = document.createElement("div");
        banner.id = "offlineWaitBanner";
        banner.style.position = "fixed";
        banner.style.left = "50%";
        banner.style.bottom = "18px";
        banner.style.transform = "translateX(-50%)";
        banner.style.zIndex = "99999";
        banner.style.width = "min(92vw, 520px)";
        banner.style.padding = "14px";
        banner.style.borderRadius = "14px";
        banner.style.background = "rgba(255,255,255,0.97)";
        banner.style.boxShadow = "0 4px 18px rgba(0,0,0,0.28)";
        banner.style.textAlign = "center";
        banner.style.fontWeight = "700";
        document.body.appendChild(banner);
    }

    const remaining = Math.max(0, Math.ceil((Number(wait.deadline) - Date.now()) / 1000));
    const label = getOfflineTeamLabel(wait.team);

    banner.innerHTML = "";

    const text = document.createElement("div");
    text.innerText = "⚠️ " + label + " is nog offline. Host kan dit team nog " + remaining + " sec. de tijd geven of nu overslaan.";
    banner.appendChild(text);

    if (window.isHost) {
        const button = document.createElement("button");
        button.type = "button";
        button.innerText = "Team nu overslaan";
        button.style.marginTop = "10px";
        button.style.padding = "10px 16px";
        button.style.fontWeight = "700";
        button.onclick = () => advancePastDisconnectedTeam(window.currentGameCode, wait.team);
        banner.appendChild(button);
    }
}

function clearOfflineTurnWait(code, expectedTeam) {
    if (!code) return;

    firebase.database()
        .ref("games/" + code)
        .transaction(game => {
            if (!game || !game.offlineTurnWait) return;

            if (
                expectedTeam !== undefined &&
                parseInt(game.offlineTurnWait.team, 10) !== parseInt(expectedTeam, 10)
            ) {
                return;
            }

            const copy = { ...game };
            delete copy.offlineTurnWait;
            return copy;
        })
        .catch(error => console.warn("Offline wachttijd kon niet worden gewist:", error));
}

function startHostDecisionWindow(code, expectedTeam) {
    if (!code) return;

    firebase.database()
        .ref("games/" + code)
        .transaction(game => {
            if (!game || game.gameState !== "playing") return;

            const current = parseInt(game.currentTurn, 10);
            if (current !== parseInt(expectedTeam, 10)) return;

            // Telefoon is binnen de eerste 30 seconden teruggekomen.
            if (findConnectedPlayerForTeam(game.players, current)) return;

            // Tweede wachttijd bestaat al.
            if (
                game.offlineTurnWait &&
                parseInt(game.offlineTurnWait.team, 10) === current
            ) {
                return;
            }

            const now = Date.now();
            return {
                ...game,
                offlineTurnWait: {
                    team: current,
                    startedAt: now,
                    deadline: now + HOST_SKIP_DECISION_MS
                }
            };
        })
        .catch(error => console.warn("Tweede offline wachttijd kon niet starten:", error));
}

function advancePastDisconnectedTeam(code, expectedTeam) {
    if (!code) return;

    firebase.database()
        .ref("games/" + code)
        .transaction(game => {
            if (!game || game.gameState !== "playing") return;

            if (game.phase !== "turn" && game.phase !== "rolled" && game.phase !== "question") {
                return;
            }

            const teamCount = parseInt(game.activeTeams, 10) || 0;
            const current = parseInt(game.currentTurn, 10);

            if (teamCount < 1 || !Number.isInteger(current)) return;
            if (expectedTeam !== undefined && current !== parseInt(expectedTeam, 10)) return;

            // Nooit overslaan als de telefoon inmiddels weer online is.
            if (findConnectedPlayerForTeam(game.players, current)) {
                const copy = { ...game };
                delete copy.offlineTurnWait;
                return copy;
            }

            let next = current;
            for (let i = 1; i <= teamCount; i++) {
                const candidate = (current + i) % teamCount;
                if (findConnectedPlayerForTeam(game.players, candidate)) {
                    next = candidate;
                    break;
                }
            }

            if (next === current) return;

            const updated = {
                ...game,
                currentTurn: next,
                phase: "turn",
                roll: null,
                questionIndex: null,
                disconnectedTurnSkippedAt: Date.now()
            };
            delete updated.offlineTurnWait;
            return updated;
        })
        .catch(error => console.warn("Offline beurt kon niet worden overgeslagen:", error));
}

function monitorCurrentPlayer(code, game) {
    if (!code || !game || game.gameState !== "playing") {
        removeOfflineWaitBanner();
        return;
    }

    const current = parseInt(game.currentTurn, 10);
    const playerId = findConnectedPlayerForTeam(game.players, current);

    // Speler is terug: een eventuele tweede wachttijd vervalt direct.
    if (playerId) {
        window._disconnectTimerMarker = null;
        window._autoSkipTimerMarker = null;
        removeOfflineWaitBanner();
        if (game.offlineTurnWait) clearOfflineTurnWait(code, current);
        return;
    }

    // FASE 2: na de eerste 30 seconden krijgt de host nog 30 seconden.
    if (
        game.offlineTurnWait &&
        parseInt(game.offlineTurnWait.team, 10) === current
    ) {
        renderOfflineWaitBanner(game);

        const deadline = Number(game.offlineTurnWait.deadline) || 0;
        const remaining = Math.max(0, deadline - Date.now());
        const marker = String(code) + "_auto_" + String(current) + "_" + String(deadline);

        if (window._autoSkipTimerMarker !== marker) {
            window._autoSkipTimerMarker = marker;
            setTimeout(() => {
                window._autoSkipTimerMarker = null;
                advancePastDisconnectedTeam(code, current);
            }, remaining);
        }
        return;
    }

    removeOfflineWaitBanner();

    // FASE 1: eerst 30 seconden alleen tijd geven om opnieuw te verbinden.
    const marker = String(code) + "_reconnect_" + String(current);
    if (window._disconnectTimerMarker === marker) return;

    window._disconnectTimerMarker = marker;

    setTimeout(() => {
        if (window._disconnectTimerMarker === marker) {
            window._disconnectTimerMarker = null;
            startHostDecisionWindow(code, current);
        }
    }, DISCONNECTED_TURN_WAIT_MS);
}



/* ===== AUTOMATISCH TERUGKEREN NA UITVAL ===== */

function tryAutomaticReconnect(){

    // Een QR-link met ?game=... krijgt voorrang.
    const params = new URLSearchParams(window.location.search);
    if(params.get("game")) return;

    const code = getLastGameCode();
    if(!code) return;

    const playerId = getSavedPlayerId(code);
    if(!playerId) return;

    const gameRef =
        firebase.database().ref("games/" + code);

    gameRef.once("value").then(snapshot=>{

        const game = snapshot.val();

        if(
            !game ||
            !game.players ||
            !game.players[playerId] ||
            (
                game.gameState !== "playing" &&
                game.gameState !== "lobby"
            )
        ){
            return;
        }

        const player = game.players[playerId];
        const firebaseUid = getCurrentFirebaseUid();

        if (!firebaseUid || (player.uid && player.uid !== firebaseUid)) {
            console.warn("Automatisch terugkeren geweigerd: Firebase UID komt niet overeen.");
            return;
        }

        // Herstel/registreer membership ook bij automatisch terugkeren.
        firebase.database()
            .ref("games/" + code + "/members/" + firebaseUid)
            .set(true);

        const team = parseInt(player.team,10);
        const colors = ["blue","red","green","purple"];

        window.currentGameCode = code;
        window.isHost = playerId === "host";
        window.myPlayerId = playerId;
        window.myTeam = team;
        window.myColor = player.color || colors[team];

        gameRef
            .child("players")
            .child(playerId)
            .update({
                uid: firebaseUid,
                connected: true,
                lastSeen:
                    firebase.database.ServerValue.TIMESTAMP
            });

        setupPlayerPresence(code,playerId);

        if(playerId !== "host"){
            prepareJoinedPlayerScreen();
        }

        listenToPlayers(code);
        listenToGameState();

        console.log(
            "✅ Automatisch teruggekeerd naar spel " +
            code +
            " als " +
            playerId
        );
    }).catch(error=>{
        console.warn(
            "Automatisch terugkeren lukte niet:",
            error
        );
    });
}

/* ===== PUNT 9: QR-CODE MET SPELCODE ===== */

function getAppelgansJoinUrl(code, joinToken){

    // Altijd het vaste openbare Appelgans-adres gebruiken.
    // Daardoor verwijst de QR nooit naar een Vercel preview/login-pagina.
    const url =
        new URL("https://appelgans-nieuw2.vercel.app/");

    url.searchParams.set("game", code);

        if (joinToken) {
            url.searchParams.set("join", joinToken);
        }

    return url.toString();
}

function showGameQrCode(code){

    let box = document.getElementById("gameQrBox");

    if(!box){
        box = document.createElement("div");
        box.id = "gameQrBox";
        box.style.cssText =
            "width:min(90vw,360px);margin:16px auto;padding:14px;" +
            "box-sizing:border-box;background:white;border:3px solid #333;" +
            "border-radius:16px;text-align:center;";

        const startButton =
            document.getElementById("startGameBtn");

        if(startButton && startButton.parentNode){
            startButton.parentNode.insertBefore(box,startButton);
        }else{
            document.body.appendChild(box);
        }
    }

    box.style.display = "block";

    const gameDataRef = firebase.database().ref("games/" + code + "/joinToken");

    gameDataRef.once("value").then(tokenSnapshot => {
        const joinToken = tokenSnapshot.val() || "";
        const joinUrl = getAppelgansJoinUrl(code, joinToken);

    const qrUrl =
        "https://api.qrserver.com/v1/create-qr-code/" +
        "?size=240x240&data=" +
        encodeURIComponent(joinUrl);

    box.innerHTML = `
        <div style="font-size:1.15rem;font-weight:900;margin-bottom:8px;">
            📱 Scan om mee te doen
        </div>

        <img
            src="${qrUrl}"
            alt="QR-code voor spel ${code}"
            width="240"
            height="240"
            style="max-width:72vw;height:auto;background:white;padding:5px;box-sizing:border-box;"
        >

        <div style="margin-top:8px;font-size:1rem;font-weight:800;">
            Spelcode: ${code}
        </div>

        <div style="margin-top:5px;font-size:.9rem;">
            Na het scannen staat de spelcode al ingevuld.
        </div>
    `;
    }).catch(error => {
        console.error("QR-code kon niet worden gemaakt:", error);
    });
}


function hideGameQrCode(force = false){
    if(window.hostQrManuallyShown && !force){
        return;
    }

    const box = document.getElementById("gameQrBox");
    if(box){
        box.style.display = "none";
    }
}

function toggleHostQrCode(){
    if(!window.currentGameCode) return;

    let box = document.getElementById("gameQrBox");

    if(!box){
        showGameQrCode(window.currentGameCode);
        box = document.getElementById("gameQrBox");
    }

    if(!box) return;

    if(box.style.display === "none"){
        window.hostQrManuallyShown = true;
        showGameQrCode(window.currentGameCode);
        box.style.display = "block";
    }else{
        window.hostQrManuallyShown = false;
        box.style.display = "none";
    }
}

function fillGameCodeFromQr(){

    const params =
        new URLSearchParams(window.location.search);

    const code = params.get("game");

    if(!code || !/^\d{4}$/.test(code)){
        return;
    }

    const joinCode =
        document.getElementById("joinCode");

    if(joinCode){
        joinCode.value = code;
    }

    // Dit is een deelnemer die via de QR binnenkomt.
    // Daarom meteen alleen de deelnemer-invoer tonen.
    prepareJoinedPlayerScreen();

    window.scannedGameCode = code;
}

if(document.readyState === "loading"){
    document.addEventListener(
        "DOMContentLoaded",
        ()=>{
            fillGameCodeFromQr();
            tryAutomaticReconnect();
        }
    );
}else{
    fillGameCodeFromQr();
    tryAutomaticReconnect();
}

function createSecureJoinToken() {
    const bytes = new Uint8Array(16);

    if (window.crypto && window.crypto.getRandomValues) {
        window.crypto.getRandomValues(bytes);
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    // Fallback voor zeer oude browsers.
    return (
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2) +
        Math.random().toString(36).slice(2)
    );
}


function getJoinTokenFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        return (params.get("join") || "").trim();
    } catch (error) {
        return "";
    }
}


function getCurrentFirebaseUid() {
    const user = firebase.auth().currentUser;
    if (!user || !user.uid) return null;
    return user.uid;
}


function createGame() {

    const code = document.getElementById("gameCode").value.trim();
    const hostName = document.getElementById("hostName").value.trim();
    const firebaseUid = getCurrentFirebaseUid();
    const joinToken = createSecureJoinToken();

    if (!code || !hostName) {
        alert("Vul naam en spelcode in");
        return;
    }

    if (!firebaseUid) {
        alert("Firebase-beveiliging is nog niet gereed. Wacht een paar seconden en probeer opnieuw.");
        return;
    }

    const hostPlayer = {
        name: hostName,
        team: 0,
        color: "blue",
        uid: firebaseUid,
        connected: true,
        lastSeen: firebase.database.ServerValue.TIMESTAMP
    };

    const gameRef = firebase.database().ref("games/" + code);

    /*
     * BEVEILIGING TEGEN DUBBELE SPELCODES
     *
     * Een spelcode blijft 24 uur in gebruik.
     * Binnen die 24 uur kan een tweede Host de code
     * niet opnieuw gebruiken.
     *
     * Na 24 uur wordt het oude spel als verlopen beschouwd
     * en mag dezelfde code opnieuw worden gebruikt.
     *
     * We gebruiken hiervoor een Firebase transaction,
     * zodat twee Hosts niet tegelijk dezelfde vrije code
     * kunnen claimen.
     */
    const CODE_GELDIGHEID_MS = 24 * 60 * 60 * 1000;

    gameRef.transaction(currentData => {

        if (currentData !== null) {

            /*
             * Controleer hoe oud het bestaande spel is.
             *
             * BELANGRIJK:
             * Oude spellen van vóór de 24-uurs-beveiliging hebben
             * geen createdAt. Die moeten NIET voor altijd een code
             * blokkeren. Daarom worden zulke oude spellen hier als
             * verlopen beschouwd en vervangen door het nieuwe spel.
             */
            if (typeof currentData.createdAt === "number") {

                const leeftijd = Date.now() - currentData.createdAt;

                if (leeftijd >= 0 && leeftijd < CODE_GELDIGHEID_MS) {
                    // Code is nog geen 24 uur oud en dus in gebruik.
                    return;
                }
            }

            // Geen createdAt, een ongeldige datum of 24 uur of ouder:
            // het oude spel is verlopen en mag worden vervangen.
        }

        // Code is vrij of het oude spel is verlopen.
        return {
            gameState: "lobby",
            createdAt: Date.now(),
            hostUid: firebaseUid,
            joinToken: joinToken,
            members: {
                [firebaseUid]: true
            },
            currentTurn: 0,
            activeTeams: 4,
            selectedCategory: null,
            phase: "lobby",
            roll: null,
            questionIndex: null,
            teamPositions: {0: 0, 1: 0, 2: 0, 3: 0},
            players: {
                host: hostPlayer
            }
        };

    }).then(result => {

        if (!result.committed) {
            alert(
                "Deze code is nog in gebruik.\n\n" +
                "Een spelcode blijft 24 uur gereserveerd.\n" +
                "Gebruik een andere code."
            );
            return;
        }

        window.currentGameCode = code;
        window.isHost = true;
        window.myPlayerId = "host";
        window.myTeam = 0;

        // Toon voor de andere teams een QR met deze spelcode.
        showGameQrCode(code);
        window.myColor = "blue";
        savePlayerId(code, "host");
        setupPlayerPresence(code, "host");

        const teamInputs = document.getElementById("teamInputs");
        if (teamInputs) teamInputs.style.display = "block";

        const startButton = document.getElementById("startGameButton");
        if (startButton) startButton.style.display = "block";

        listenToPlayers(code);
        listenToGameState();

        alert("Spel aangemaakt: " + code);

    }).catch(error => {

        console.error("FOUT BIJ CREATE GAME:", error);
        alert(
            "Spel kon niet worden aangemaakt:\n\n" +
            error.message
        );
    });
}

function joinGame() {

    const code = document.getElementById("joinCode").value.trim();
    const name = document.getElementById("joinName").value.trim();
    const firebaseUid = getCurrentFirebaseUid();
    const joinToken = getJoinTokenFromUrl();

    if (!code || !name) {
        alert("Vul naam en spelcode in");
        return;
    }

    if (!firebaseUid) {
        alert("Firebase-beveiliging is nog niet gereed. Wacht een paar seconden en probeer opnieuw.");
        return;
    }

    const gameRef = firebase.database().ref("games/" + code);

    gameRef.once("value")
        .then(snapshot => {

            const game = snapshot.val();

            if (!game) {
                alert("Spel bestaat niet.");
                return;
            }

            const players = game.players || {};

            const savedPlayerId = getSavedPlayerId(code);

            // ---------------------------------------------------------
            // BESTAANDE SPELER OPNIEUW VERBINDEN
            // ---------------------------------------------------------
            if (
                savedPlayerId &&
                players[savedPlayerId] &&
                (!players[savedPlayerId].uid || players[savedPlayerId].uid === firebaseUid)
            ) {

                const existingPlayer = players[savedPlayerId];
                const team = parseInt(existingPlayer.team, 10);
                const color = existingPlayer.color ||
                    ["blue", "red", "green", "purple"][team];

                return gameRef
                    .child("players")
                    .child(savedPlayerId)
                    .update({
                        name: name,
                        uid: firebaseUid,
                        connected: true,
                        lastSeen: firebase.database.ServerValue.TIMESTAMP
                    })
                    .then(() => {

                        window.currentGameCode = code;
                        window.isHost = savedPlayerId === "host";
                        window.myPlayerId = savedPlayerId;
                        window.myTeam = team;
                        window.myColor = color;

                        setupPlayerPresence(code, savedPlayerId);

                        if (savedPlayerId === "host" && game.gameState === "lobby") {
                            const teamInputs = document.getElementById("teamInputs");
                            if (teamInputs) teamInputs.style.display = "block";

                            const startButton = document.getElementById("startGameButton");
                            if (startButton) startButton.style.display = "block";
                        } else {
                            prepareJoinedPlayerScreen();
                        }

                        listenToPlayers(code);
                        listenToGameState();

                        alert(
                            "Je bent opnieuw verbonden!\n\n" +
                            "Team: " + (team + 1) +
                            "\nKleur: " + color +
                            "\n\nJe gaat verder vanaf je bestaande spelpositie."
                        );
                    });
            }

            // ---------------------------------------------------------
            // BEVEILIGDE TOETREDING VOOR EEN NIEUWE SPELER
            // ---------------------------------------------------------
            // De 4-cijferige spelcode alleen is niet genoeg.
            // Een nieuwe telefoon moet ook de geheime join-token uit de QR-link hebben.
            if (!joinToken || joinToken !== game.joinToken) {
                alert(
                    "Deze telefoon heeft geen geldige deelname-link.\n\n" +
                    "Scan de QR-code van de host opnieuw."
                );
                return;
            }

            // ---------------------------------------------------------
            // EEN NIEUWE SPELER MAG ALLEEN IN DE LOBBY INSTAPPEN
            // ---------------------------------------------------------
            if (game.gameState && game.gameState !== "lobby") {
                alert(
                    "Dit spel is al gestart.\n\n" +
                    "Als je al eerder met deze telefoon meespeelde, gebruik dan dezelfde spelcode en naam om opnieuw te verbinden."
                );
                return;
            }

            const playerIds = Object.keys(players);

            if (playerIds.length >= 4) {
                alert("Er kunnen maximaal 4 deelnemers meedoen.");
                return;
            }

            const usedTeams = playerIds.map(id =>
                parseInt(players[id].team, 10)
            );

            let team = 0;

            while (usedTeams.includes(team) && team < 4) {
                team++;
            }

            if (team >= 4) {
                alert("Alle teams zijn al bezet.");
                return;
            }

            const colors = ["blue", "red", "green", "purple"];
            const playerId = "p" + Date.now() + "_" +
                Math.random().toString(36).slice(2, 8);

            const player = {
                name: name,
                team: team,
                color: colors[team],
                uid: firebaseUid,
                connected: true,
                lastSeen: firebase.database.ServerValue.TIMESTAMP
            };

            const joinUpdates = {};
            joinUpdates["members/" + firebaseUid] = true;
            joinUpdates["players/" + playerId] = player;

            return gameRef
                .update(joinUpdates)
                .then(() => {

                    savePlayerId(code, playerId);

                    window.currentGameCode = code;
                    window.isHost = false;
                    window.myPlayerId = playerId;
                    window.myTeam = team;
                    window.myColor = colors[team];

                    setupPlayerPresence(code, playerId);
                    prepareJoinedPlayerScreen();
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
            alert("Deelnemen mislukt:\n\n" + error.message);
        });
}

function prepareJoinedPlayerScreen() {

    // Deelnemerstelefoons mogen de host-instellingen niet zien of wijzigen.
    // Alleen naam + (automatisch ingevulde) spelcode blijven beschikbaar.
    const idsToHide = [
        "teamInputs",
        "teamCount",
        "categorySelect",
        "startGameButton",
        "startGameBtn",
        "team1Name",
        "team2Name",
        "team3Name",
        "team4Name"
    ];

    idsToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = "none";
        }

        // Verberg ook een eventueel los HTML-label bij dit invoerveld.
        const label = document.querySelector('label[for="' + id + '"]');
        if (label) {
            label.style.display = "none";
        }
    });
}

function listenToPlayers(code) {

    firebase.database()
        .ref("games/" + code + "/players")
        .on("value", snapshot => {

            const players = snapshot.val();
            const list = document.getElementById("playersList");

            if (!list) return;

            list.innerHTML = "";

            if (!players) return;

            Object.keys(players).forEach(key => {
                const player = players[key];
                const div = document.createElement("div");

                const onlineText =
                    player.connected === false
                        ? " — offline"
                        : " — online";

                div.innerText =
                    key === "host"
                        ? "👑 Host: " + player.name + onlineText
                        : "👤 " + player.name + onlineText;

                list.appendChild(div);
            });
        });
}


/* ===== PUNT 7: HOST-INSTELLINGEN ===== */
function isAppelgansHost(){
    return window.myPlayerId === "host";
}

function closeHostSettings(event){
    if(event){
        event.preventDefault();
        event.stopPropagation();
    }

    const panel =
        document.getElementById("hostSettingsPanel");

    if(panel){
        panel.style.display = "none";
    }

    return false;
}

function ensureHostSettingsPanel(){
    let button=document.getElementById("hostSettingsButton");
    let panel=document.getElementById("hostSettingsPanel");

    if(!isAppelgansHost()){
        if(button) button.style.display="none";
        if(panel) panel.style.display="none";
        return;
    }

    if(!button){
        button=document.createElement("button");
        button.id="hostSettingsButton";
        button.innerText="⚙️ Instellingen";
        button.style.cssText="position:fixed;right:12px;bottom:12px;z-index:9997;padding:10px 14px;border-radius:12px;font-weight:800;";
        button.onclick=()=>{
            const p=document.getElementById("hostSettingsPanel");
            if(p) p.style.display=p.style.display==="block"?"none":"block";
        };
        document.body.appendChild(button);
    }
    button.style.display="block";

    if(!panel){
        panel=document.createElement("div");
        panel.id="hostSettingsPanel";
        panel.style.cssText="display:none;position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(90vw,420px);box-sizing:border-box;padding:18px;background:white;border:3px solid #333;border-radius:16px;z-index:9998;box-shadow:0 8px 30px rgba(0,0,0,.35);text-align:center;";
        panel.innerHTML=`
        <button id="hostCloseSettingsX"
                type="button"
                aria-label="Instellingen sluiten"
                style="position:absolute;right:8px;top:6px;border:3px solid #333;background:white;border-radius:50%;width:46px;height:46px;cursor:pointer;padding:0;z-index:2;display:flex;align-items:center;justify-content:center;">
            <span style="display:block;font-family:Arial,sans-serif;font-size:34px;font-weight:900;line-height:1;color:#111;transform:translateY(-1px);">×</span>
        </button>

        <div style="font-size:1.35rem;font-weight:900;margin-bottom:14px;padding-right:42px;">
            ⚙️ Host-instellingen
        </div>

        <div id="hostSettingsInfo" style="margin-bottom:14px;line-height:1.5;font-weight:700;"></div>

        <button type="button" id="hostSkipCurrentTeam" style="width:100%;padding:12px;margin:5px 0;font-weight:800;">⏭️ Huidig team overslaan</button>
        <button type="button" id="hostPauseGame" style="width:100%;padding:12px;margin:5px 0;font-weight:800;">⏸️ Spel pauzeren</button>
        <button type="button" id="hostSoundToggle" style="width:100%;padding:12px;margin:5px 0;font-weight:800;">🔊 Geluid aan</button>
        <button type="button" id="hostQrToggle" style="width:100%;padding:12px;margin:5px 0;font-weight:800;">📱 QR-code tonen / verbergen</button>

        <button type="button" id="hostCloseSettings"
                style="width:100%;padding:12px;margin-top:12px;font-weight:900;border:2px solid #333;border-radius:10px;">
            Alleen instellingen sluiten
        </button>`
        document.body.appendChild(panel);

        document.getElementById("hostCloseSettingsX").onclick=closeHostSettings;

        document.getElementById("hostCloseSettings").onclick=closeHostSettings;

        document.getElementById("hostSkipCurrentTeam").onclick=hostSkipCurrentTeam;
        document.getElementById("hostPauseGame").onclick=hostTogglePause;
        document.getElementById("hostSoundToggle").onclick=hostToggleSound;
        document.getElementById("hostQrToggle").onclick=(event)=>{
            event.preventDefault();
            event.stopPropagation();
            toggleHostQrCode();
        };
    }
}

function refreshHostSettings(game){
    ensureHostSettingsPanel();
    if(!isAppelgansHost()) return;

    const info=document.getElementById("hostSettingsInfo");
    const pauseButton=document.getElementById("hostPauseGame");
    const soundButton=document.getElementById("hostSoundToggle");
    const teamIndex=parseInt(game.currentTurn,10)||0;
    const team=teams[teamIndex];

    if(info){
        info.innerText="Spelcode: "+window.currentGameCode+
        "\nAan de beurt: "+(team?team.icon+" "+team.name:"onbekend");
    }
    if(pauseButton){
        pauseButton.innerText=game.gamePaused?"▶️ Spel hervatten":"⏸️ Spel pauzeren";
    }
    if(soundButton){
        soundButton.innerText=game.soundEnabled===false?"🔇 Geluid uit":"🔊 Geluid aan";
    }
}

function hostSkipCurrentTeam(){
    if(!isAppelgansHost()||!window.currentGameCode) return;

    firebase.database().ref("games/"+window.currentGameCode).transaction(game=>{
        if(!game||game.gameState!=="playing") return game;

        const current=parseInt(game.currentTurn,10)||0;
        const count=parseInt(game.activeTeams,10)||activeTeams||1;

        game.currentTurn=(current+1)%count;
        game.phase="turn";
        game.roll=null;
        game.questionIndex=null;
        game.offlineTurnWait=null;
        return game;
    });

    const panel=document.getElementById("hostSettingsPanel");
    if(panel) panel.style.display="none";
}

function hostTogglePause(){
    if(!isAppelgansHost()||!window.currentGameCode) return;
    const ref=firebase.database().ref("games/"+window.currentGameCode+"/gamePaused");
    ref.once("value").then(s=>ref.set(!s.val()));
}

function hostToggleSound(){
    if(!isAppelgansHost()||!window.currentGameCode) return;
    const ref=firebase.database().ref("games/"+window.currentGameCode+"/soundEnabled");
    ref.once("value").then(s=>ref.set(s.val()===false));
}

function renderSynchronizedBoard() {

    if (typeof updateBoard === "function") {
        updateBoard();
    }

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

            if (
                game.gameState === "finished" &&
                game.winnerTeam !== undefined
            ) {
                const winnerIndex =
                    parseInt(game.winnerTeam,10);

                if (
                    teams[winnerIndex] &&
                    typeof showFinishCelebration === "function"
                ) {
                    showScreen(screen3);
                    showFinishCelebration(
                        teams[winnerIndex]
                    );
                }

                return;
            }

            window.gamePaused = game.gamePaused === true;
            window.gameSoundEnabled = game.soundEnabled !== false;

            refreshHostSettings(game);

            if (
                game.gameState === "playing" &&
                isAppelgansHost()
            ) {
                hideGameQrCode();
            }

            if (window.gamePaused) {
                if (statusMessage) {
                    statusMessage.innerText = "⏸️ SPEL GEPAUZEERD DOOR DE HOST";
                }
                return;
            }

            // Als de huidige speler offline is, geef hem eerst 30 seconden
            // om opnieuw te verbinden. Daarna gaat het spel automatisch
            // verder met het eerstvolgende verbonden team.
            monitorCurrentPlayer(window.currentGameCode, game);


            // =========================
            // AANTAL TEAMS
            // =========================

            if (game.activeTeams !== undefined) {
                activeTeams =
                    parseInt(game.activeTeams, 10);
            }


            // =========================
            // TEAMNAMEN
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
                    parseInt(game.currentTurn, 10);
            }


            // =========================
            // MIJN TEAM
            // =========================

            if (
                game.players &&
                window.myPlayerId &&
                game.players[window.myPlayerId]
            ) {

                window.myTeam =
                    parseInt(
                        game.players[window.myPlayerId].team,
                        10
                    );
            }


            // =========================
            // BORDPOSITIES
            // =========================

            if (game.teamPositions) {

                for (let i = 0; i < 4; i++) {

                    if (
                        game.teamPositions[i] !== undefined &&
                        teams[i]
                    ) {

                        teams[i].position =
                            parseInt(
                                game.teamPositions[i],
                                10
                            );
                    }
                }
            }


            // =========================
            // BEURTEN OVERSLAAN
            // =========================

            if (game.teamSkipTurns) {

                for (let i = 0; i < 4; i++) {

                    if (
                        game.teamSkipTurns[i] !== undefined &&
                        teams[i]
                    ) {
                        teams[i].skipTurns =
                            parseInt(game.teamSkipTurns[i], 10) || 0;
                    }
                }
            }


            // =========================
            // CATEGORIE OP SCHERM
            // =========================

            const categoryText =
                document.getElementById("currentCategory");

            if (categoryText) {
                categoryText.innerText =
                    "Categorie: " +
                    selectedCategory;
            }


            updateTurn();


            if (game.gameState !== "playing") {
                return;
            }


            // =====================================
            // TURN = DOBBEL-SCHERM
            // =====================================

            if (game.phase === "turn") {

                currentQuestion = null;
                explanationText.innerText = "";
                diceText.innerText = "";
                diceText.style.fontSize = "";
                diceText.style.fontWeight = "";
                diceText.style.lineHeight = "";
                diceText.style.textAlign = "";
                diceText.style.margin = "";
                window.diceRolled = false;

                showScreen(screen1);

                if (
                    parseInt(currentTeam, 10) ===
                    parseInt(window.myTeam, 10)
                ) {

                    showClearTurnIndicator(true);

                } else {

                    showClearTurnIndicator(false);
                }

                renderSynchronizedBoard();
                return;
            }


            // =====================================
            // ROLLED = WORP ZICHTBAAR
            // =====================================

            if (game.phase === "rolled") {

                if (
                    game.roll !== undefined &&
                    game.roll !== null
                ) {

                    lastRoll =
                        parseInt(game.roll, 10);

                    diceText.innerText =
                        "🎲 " + lastRoll;

                    diceText.style.fontSize =
                        "clamp(4rem, 22vw, 8rem)";
                    diceText.style.fontWeight =
                        "900";
                    diceText.style.lineHeight =
                        "1";
                    diceText.style.textAlign =
                        "center";
                    diceText.style.margin =
                        "18px auto";
                }

                showScreen(screen1);

                if (
                    parseInt(currentTeam, 10) ===
                    parseInt(window.myTeam, 10)
                ) {

                    statusMessage.innerText =
                        "🎲 Je hebt gegooid.";

                } else {

                    statusMessage.innerText =
                        "⏳ Even wachten...";
                }

                return;
            }


            // =====================================
            // QUESTION = ZELFDE VRAAG
            // =====================================

            if (game.phase === "question") {

                if (
                    game.roll !== undefined &&
                    game.roll !== null
                ) {

                    lastRoll =
                        parseInt(game.roll, 10);

                    diceText.innerText =
                        "🎲 Je gooide: " +
                        lastRoll;
                }

                showScreen(screen2);

                if (
                    game.questionIndex !== undefined &&
                    typeof loadSynchronizedQuestion === "function"
                ) {

                    loadSynchronizedQuestion(
                        game.questionIndex
                    );
                }

                return;
            }


            // =====================================
            // BOARD = SPEELBORD
            // =====================================

            if (game.phase === "board") {

                currentQuestion = null;
                explanationText.innerText = "";

                showScreen(screen3);

                if (
                    typeof showBoardDice === "function" &&
                    game.roll !== undefined &&
                    game.roll !== null
                ) {
                    showBoardDice(game.roll);
                }

                renderSynchronizedBoard();
                return;
            }

        });
}
