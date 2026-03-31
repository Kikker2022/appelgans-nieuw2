import { alleVragen } from "./data/vragen.js";

const dobbelsteenKnop = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const vraagTekst = document.getElementById("vraag");
const antwoordTekst = document.getElementById("antwoord");

let positie = 0;

dobbelsteenKnop.addEventListener("click", () => {

let worp = Math.floor(Math.random() * 6) + 1;

positie += worp;

if (positie > 42) {
positie = 42;
}

worpTekst.textContent = "Je gooide: " + worp + " | Positie: " + positie;

let randomVraag = alleVragen[Math.floor(Math.random() * alleVragen.length)];

vraagTekst.textContent = "Vraag: " + randomVraag.vraag;
antwoordTekst.textContent = "Antwoord: " + randomVraag.antwoord;

});
