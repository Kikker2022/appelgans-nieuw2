import { alleVragen } from "./data/vragen.js";

const dobbelsteenKnop = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const vraagTekst = document.getElementById("vraag");
const antwoordTekst = document.getElementById("antwoord");
const bord = document.getElementById("bord");
const beurtTekst = document.getElementById("beurt");
const score1Tekst = document.getElementById("score1");
const score2Tekst = document.getElementById("score2");

let positie1 = 1;
let positie2 = 1;
let beurt = 1;

let huidigeVraag = null;

const ganzenVakjes = [6, 31];

// bord maken
for (let i = 1; i <= 42; i++) {
const vakje = document.createElement("div");
vakje.classList.add("vakje");
vakje.id = "vak-" + i;

if (ganzenVakjes.includes(i)) {
vakje.textContent = "🪿 " + i;
} else {
vakje.textContent = i;
}

bord.appendChild(vakje);
}

function updateBord() {

for (let i = 1; i <= 42; i++) {

const vak = document.getElementById("vak-" + i);

if (ganzenVakjes.includes(i)) {
vak.textContent = "🪿 " + i;
} else {
vak.textContent = i;
}

vak.classList.remove("speler1");
vak.classList.remove("speler2");
}

const speler1 = document.getElementById("vak-" + positie1);
speler1.textContent = "🔵 " + positie1;

const speler2 = document.getElementById("vak-" + positie2);
speler2.textContent += " 🔴";

score1Tekst.textContent = "Team 1: " + positie1;
score2Tekst.textContent = "Team 2: " + positie2;

beurtTekst.textContent = "Team " + beurt + " is aan de beurt";

}

updateBord();

dobbelsteenKnop.addEventListener("click", () => {

let worp = Math.floor(Math.random() * 6) + 1;

let positie;

if (beurt === 1) {
positie1 += worp;
positie = positie1;
} else {
positie2 += worp;
positie = positie2;
}

if (positie > 42) positie = 42;

if (beurt === 1) positie1 = positie;
else positie2 = positie;

// speciale vakjes

if (positie === 6 || positie === 31) {
worpTekst.textContent = "🪿 Ganzenvak! Nog een keer!";
updateBord();
return;
}

if (positie === 12) {
positie += 3;
worpTekst.textContent = "⭐ 3 vakjes vooruit!";
}

if (positie === 19) {
positie = 10;
worpTekst.textContent = "⬅️ Terug naar 10";
}

if (positie === 25) {
worpTekst.textContent = "⚡ Nog een beurt!";
}

if (positie === 37) {
positie -= 5;
worpTekst.textContent = "⬅️ 5 vakjes terug";
}

if (positie >= 42) {
worpTekst.textContent = "🎉 Team " + beurt + " wint!";
updateBord();
return;
}

if (beurt === 1) positie1 = positie;
else positie2 = positie;

updateBord();

huidigeVraag = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraagTekst.textContent = "Vraag: " + huidigeVraag.vraag;
antwoordTekst.textContent = "";

// beurt wisselen behalve bij extra beurt

if (positie !== 25) {
beurt = beurt === 1 ? 2 : 1;
}

});

vraagTekst.addEventListener("click", () => {

if (huidigeVraag) {
antwoordTekst.textContent = "Antwoord: " + huidigeVraag.antwoord;
}

});
