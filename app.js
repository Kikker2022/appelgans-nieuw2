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

let skip1 = false;
let skip2 = false;

let team = 1;

const finish = 42;
const put = 19;
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

if (nr === finish) {
vak.textContent = "🏁";
}
else if (nr === put) {
vak.innerHTML = `<span class="put">🪣</span>`;
}
else if (ganzen.includes(nr)) {
vak.innerHTML = `<span class="gans">🪿</span>`;
}
else {
vak.textContent = nr;
}

bord.appendChild(vak);

});

}

}

function updateBord() {

document.querySelectorAll(".vak").forEach(v => {

const nr = Number(v.id.replace("vak", ""));

if (nr === finish) {
v.textContent = "🏁";
}
else if (nr === put) {
v.innerHTML = `<span class="put">🪣</span>`;
}
else if (ganzen.includes(nr)) {
v.innerHTML = `<span class="gans">🪿</span>`;
}
else {
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

function checkFinish() {
if (positie1 === finish) {
alert("🎉 Team 1 wint!");
gooiBtn.disabled = true;
}
if (positie2 === finish) {
alert("🎉 Team 2 wint!");
gooiBtn.disabled = true;
}
}

function bounceBack(pos) {
if (pos > finish) {
return finish - (pos - finish);
}
return pos;
}

gooiBtn.addEventListener("click", () => {

if (team === 1 && skip1) {
skip1 = false;
team = 2;
beurtEl.textContent = "Team 2 is aan de beurt";
return;
}

if (team === 2 && skip2) {
skip2 = false;
team = 1;
beurtEl.textContent = "Team 1 is aan de beurt";
return;
}

const worp = Math.floor(Math.random() * 6) + 1;

if (team === 1) {

positie1 += worp;
positie1 = bounceBack(positie1);

updateBord();

if (positie1 === put) {
alert("🪣 Team 1 valt in de put! Beurt overslaan");
skip1 = true;
}

if (ganzen.includes(positie1)) {

setTimeout(() => {
positie1 += worp;
positie1 = bounceBack(positie1);
updateBord();
checkFinish();
}, 900);

}

score1++;
score1El.textContent = score1;
team = 2;

} else {

positie2 += worp;
positie2 = bounceBack(positie2);

updateBord();

if (positie2 === put) {
alert("🪣 Team 2 valt in de put! Beurt overslaan");
skip2 = true;
}

if (ganzen.includes(positie2)) {

setTimeout(() => {
positie2 += worp;
positie2 = bounceBack(positie2);
updateBord();
checkFinish();
}, 900);

}

score2++;
score2El.textContent = score2;
team = 1;

}

nieuweVraag();
checkFinish();

beurtEl.textContent = "Team " + team + " is aan de beurt";

});

maakBord();
