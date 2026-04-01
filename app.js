import { alleVragen } from "./data/vragen.js";

const dobbelsteenKnop = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const vraagTekst = document.getElementById("vraag");
const antwoordTekst = document.getElementById("antwoord");
const bord = document.getElementById("bord");

let positie = 1;
let huidigeVraag = null;

// Bord maken
for (let i = 1; i <= 42; i++) {
const vakje = document.createElement("div");
vakje.className = "vakje";
vakje.id = "vak-" + i;
vakje.innerHTML = i;
bord.appendChild(vakje);
}

function updateBord() {

document.querySelectorAll(".vakje").forEach((vak, index) => {
vak.classList.remove("speler");
vak.innerHTML = index + 1;
});

const spelerVak = document.getElementById("vak-" + positie);
spelerVak.classList.add("speler");
spelerVak.innerHTML = "🪿<br>" + positie;

}

// speler meteen tonen
updateBord();

dobbelsteenKnop.addEventListener("click", () => {

const worp = Math.floor(Math.random() * 6) + 1;

positie += worp;

if (positie > 42) {
positie = 42;
}

worpTekst.textContent = "Je gooide: " + worp + " | Positie: " + positie;

updateBord();

huidigeVraag = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraagTekst.textContent = "Vraag: " + huidigeVraag.vraag;
antwoordTekst.textContent = "";

});

// Antwoord tonen bij klik op vraag
vraagTekst.addEventListener("click", () => {
if (huidigeVraag) {
antwoordTekst.textContent = "Antwoord: " + huidigeVraag.antwoord;
}
});
