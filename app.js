import vragen from "./data/vragen.js";

const bord = document.getElementById("bord");
const vraagEl = document.getElementById("vraag");
const antwoordEl = document.getElementById("antwoord");
const gooiBtn = document.getElementById("gooi");
const beurtEl = document.getElementById("beurt");

const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

let positie1 = 0;
let positie2 = 0;
let score1 = 0;
let score2 = 0;
let team = 1;

const ganzen = [5, 9, 14, 18, 23, 27, 32, 36, 41];

function maakBord() {

bord.innerHTML = "";

let nummer = 1;

for (let rij = 0; rij < 6; rij++) {

let rijArray = [];

for (let kolom = 0; kolom < 7; kolom++) {
rijArray.push(nummer);
nummer++;
}

if (rij % 2 === 1) {
rijArray.reverse();
}

rijArray.forEach(nr => {

const vak = document.createElement("div");
vak.classList.add("vak");
vak.id = "vak" + nr;

if (ganzen.includes(nr)) {
vak.innerHTML = `<span class="gans">🪿</span>`;
} else {
vak.textContent = nr;
}

bord.appendChild(vak);

});

}

}

function updateBord() {

document.querySelectorAll(".vak").forEach(v => {

const nr = v.id.replace("vak", "");

if (ganzen.includes(Number(nr))) {
v.innerHTML = `<span class="gans">🪿</span>`;
} else {
v.innerHTML = nr;
}

});

if (positie1 > 0) {
const vak = document.getElementById("vak" + positie1);
if (vak) {
const bol = document.createElement("div");
bol.classList.add("speler", "team1");
vak.appendChild(bol);
}
}

if (positie2 > 0) {
const vak = document.getElementById("vak" + positie2);
if (vak) {
const bol = document.createElement("div");
bol.classList.add("speler", "team2");
vak.appendChild(bol);
}
}

}

function nieuweVraag() {
const random = vragen[Math.floor(Math.random() * vragen.length)];
vraagEl.textContent = random.vraag;
antwoordEl.textContent = random.antwoord;
}

gooiBtn.addEventListener("click", () => {

const worp = Math.floor(Math.random() * 6) + 1;

if (team === 1) {

positie1 += worp;

if (ganzen.includes(positie1)) {
positie1 += worp;
}

score1++;
score1El.textContent = score1;
team = 2;

} else {

positie2 += worp;

if (ganzen.includes(positie2)) {
positie2 += worp;
}

score2++;
score2El.textContent = score2;
team = 1;

}

updateBord();
nieuweVraag();

beurtEl.textContent = "Team " + team + " is aan de beurt";

});

maakBord();
