console.log("Nieuwe versie geladen");

// elementen
let dobbelKnop = document.getElementById("dobbel");
let worpTekst = document.getElementById("worp");
let bord = document.getElementById("bord");
let beurtTekst = document.getElementById("beurt");
let meldingTekst = document.getElementById("melding");

let score1 = document.getElementById("score1");
let score2 = document.getElementById("score2");

// spelers
let positie1 = 1;
let positie2 = 1;

let huidigeSpeler = 1;

// bord maken

function maakBord() {

bord.innerHTML = "";

for (let i = 1; i <= 42; i++) {

let vak = document.createElement("div");
vak.classList.add("vak");
vak.textContent = i;

if (i === positie1) {
vak.textContent = "🪿";
vak.classList.add("team1");
}

if (i === positie2) {
vak.textContent = "🪿";
vak.classList.add("team2");
}

bord.appendChild(vak);

}

}

maakBord();

// dobbelsteen

dobbelKnop.addEventListener("click", function () {

let worp = Math.floor(Math.random() * 6) + 1;

meldingTekst.textContent = "";

if (huidigeSpeler === 1) {

positie1 += worp;

if (positie1 > 42) positie1 = 42;

ganzenVakjes(1);

score1.textContent = positie1;

}

else {

positie2 += worp;

if (positie2 > 42) positie2 = 42;

ganzenVakjes(2);

score2.textContent = positie2;

}

worpTekst.textContent = "Je gooide " + worp;

wisselSpeler();

maakBord();

});

// ganzenvakjes

function ganzenVakjes(speler) {

let positie = speler === 1 ? positie1 : positie2;

if (positie === 6) {
positie += 12;
meldingTekst.textContent = "⭐ 12 vakjes vooruit";
}

if (positie === 12) {
positie += 3;
meldingTekst.textContent = "⭐ 3 vakjes vooruit";
}

if (positie === 19) {
positie = 10;
meldingTekst.textContent = "↩️ Terug naar 10";
}

if (positie === 31) {
meldingTekst.textContent = "⭐ Nog een keer";
return;
}

if (speler === 1) positie1 = positie;
else positie2 = positie;

}

// wissel speler

function wisselSpeler() {

if (huidigeSpeler === 1) {
huidigeSpeler = 2;
beurtTekst.textContent = "Team 2 is aan de beurt";
}
else {
huidigeSpeler = 1;
beurtTekst.textContent = "Team 1 is aan de beurt";
}

}
