import { alleVragen } from "./data/vragen.js";

const dobbelsteen = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const bord = document.getElementById("bord");
const beurtTekst = document.getElementById("beurt");
const melding = document.getElementById("melding");

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");

const vraag = document.getElementById("vraag");
const antwoord = document.getElementById("antwoord");

let positie1 = 1;
let positie2 = 1;

let speler = 1;
let nogEenKeer = false;


// team kleuren tonen

score1.innerHTML = "🔵 1";
score2.innerHTML = "🔴 1";


// bord tekenen

function tekenBord() {

bord.innerHTML = "";

for (let i = 1; i <= 42; i++) {

let vak = document.createElement("div");
vak.classList.add("vakje");

let inhoud = i;

if (i === positie1) inhoud = "🔵";
if (i === positie2) inhoud = "🔴";

if (i === positie1 && i === positie2) {
inhoud = "🔵 🔴";
}

vak.innerHTML = inhoud;

bord.appendChild(vak);

}

}


// ganzenbord slangvorm

bord.style.display = "grid";
bord.style.gridTemplateColumns = "repeat(7, 70px)";

tekenBord();


// dobbelsteen

dobbelsteen.addEventListener("click", () => {

let worp = Math.floor(Math.random() * 6) + 1;

worpTekst.textContent = "Je gooide " + worp;

melding.textContent = "";

if (speler === 1) {

positie1 += worp;
ganzen(1);
score1.innerHTML = "🔵 " + positie1;

} else {

positie2 += worp;
ganzen(2);
score2.innerHTML = "🔴 " + positie2;

}

toonVraag();

tekenBord();

if (!nogEenKeer) {
speler = speler === 1 ? 2 : 1;
}

beurtTekst.textContent = "Team " + speler + " is aan de beurt";

nogEenKeer = false;

});


// vragen

function toonVraag() {

let random = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraag.textContent = "Vraag: " + random.vraag;

antwoord.innerHTML = "<button id='antwoordBtn'>Toon antwoord</button>";

document.getElementById("antwoordBtn").onclick = () => {
antwoord.innerHTML = "Antwoord: " + random.antwoord;
};

}


// ganzenvakjes

function ganzen(s) {

let pos = s === 1 ? positie1 : positie2;

if (pos === 6) {
pos += 12;
melding.textContent = "⭐ 12 vooruit";
}

if (pos === 12) {
pos += 3;
melding.textContent = "⭐ 3 vooruit";
}

if (pos === 19) {
pos = 10;
melding.textContent = "↩️ terug naar 10";
}

if (pos === 31) {
melding.textContent = "⭐ nog een keer";
nogEenKeer = true;
}

if (s === 1) positie1 = pos;
else positie2 = pos;

}
