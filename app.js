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

// bord maken (slangvorm)
let vakjes = [];

for (let i = 1; i <= 42; i++) {
vakjes.push(i);
}

// slangvorm maken
let slang = [];
while (vakjes.length) {
let rij = vakjes.splice(0,7);
if (slang.length % 2 === 1) rij.reverse();
slang.push(rij);
}

slang.flat().forEach(i => {
const vakje = document.createElement("div");
vakje.classList.add("vakje");
vakje.id = "vak-" + i;

if (ganzenVakjes.includes(i)) {
vakje.textContent = "🪿 " + i;
} else {
vakje.textContent = i;
}

bord.appendChild(vakje);
});

function updateBord() {

for (let i = 1; i <= 42; i++) {

const vak = document.getElementById("vak-" + i);

if (ganzenVakjes.includes(i)) {
vak.textContent = "🪿 " + i;
} else {
vak.textContent = i;
}

}

// speler 1
const speler1 = document.getElementById("vak-" + positie1);
speler1.textContent = "🔵 " + positie1;

// speler 2
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

let bericht = "";

// speciale vakjes

if (positie === 6 || positie === 31) {
bericht = "🪿 Ganzenvak! Nog een keer!";
}

if (positie === 12) {
positie += 3;
bericht = "⭐ 3 vakjes vooruit!";
}

if (positie === 19) {
positie = 10;
bericht = "⬅️ Terug naar 10";
}

if (positie === 25) {
bericht = "⚡ Nog een beurt!";
}

if (positie === 37) {
positie -= 5;
bericht = "⬅️ 5 vakjes terug";
}

if (positie >= 42) {
bericht = "🎉 Team " + beurt + " wint!";
}

if (beurt === 1) positie1 = positie;
else positie2 = positie;

worpTekst.textContent = "Team " + beurt + " gooide: " + worp;

if (bericht !== "") {

worpTekst.textContent += " | " + bericht;

if (beurt === 1) {
worpTekst.style.color = "blue";
} else {
worpTekst.style.color = "red";
}

} else {
worpTekst.style.color = "black";
}

updateBord();

if (positie >= 42) return;

huidigeVraag = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraagTekst.textContent = "Vraag: " + huidigeVraag.vraag;
antwoordTekst.textContent = "";

if (!(positie === 6 || positie === 31 || positie === 25)) {
beurt = beurt === 1 ? 2 : 1;
}

});

vraagTekst.addEventListener("click", () => {

if (huidigeVraag) {
antwoordTekst.textContent = "Antwoord: " + huidigeVraag.antwoord;
}

});
