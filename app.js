import { alleVragen } from "./data/vragen.js";

const dobbelsteenKnop = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const vraagTekst = document.getElementById("vraag");
const antwoordTekst = document.getElementById("antwoord");
const bord = document.getElementById("bord");

let positie = 1;
let huidigeVraag = null;

// ganzen vakjes
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

// reset bord
for (let i = 1; i <= 42; i++) {

const vak = document.getElementById("vak-" + i);

if (ganzenVakjes.includes(i)) {
vak.textContent = "🪿 " + i;
} else {
vak.textContent = i;
}

vak.classList.remove("speler");
}

// speler plaatsen
const spelerVak = document.getElementById("vak-" + positie);
spelerVak.textContent = "🟢 " + positie;
spelerVak.classList.add("speler");

}

// startpositie
updateBord();

dobbelsteenKnop.addEventListener("click", () => {

const worp = Math.floor(Math.random() * 6) + 1;

positie += worp;

if (positie > 42) {
positie = 42;
}

// ganzenvakjes
if (positie === 6 || positie === 31) {
worpTekst.textContent = "🪿 Ganzenvak! Gooi nog een keer!";
updateBord();
return;
}

// vooruit vakje
if (positie === 12) {
positie += 3;
worpTekst.textContent = "Bonus! 3 vakjes vooruit";
}

// terug vakje
if (positie === 19) {
positie = 10;
worpTekst.textContent = "Terug naar vak 10";
}

// finish
if (positie === 42) {
worpTekst.textContent = "🎉 Je hebt gewonnen!";
}

worpTekst.textContent += " | Positie: " + positie;

updateBord();

huidigeVraag = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraagTekst.textContent = "Vraag: " + huidigeVraag.vraag;
antwoordTekst.textContent = "";

});

vraagTekst.addEventListener("click", () => {

if (huidigeVraag) {
antwoordTekst.textContent = "Antwoord: " + huidigeVraag.antwoord;
}

});
