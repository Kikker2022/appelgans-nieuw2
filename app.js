import vragen from "./data/vragen.js";

const bord = document.getElementById("bord");
const vraagEl = document.getElementById("vraag");
const antwoordEl = document.getElementById("antwoord");
const gooiBtn = document.getElementById("gooi");
const beurtEl = document.getElementById("beurt");
const dobbelsteen = document.getElementById("dobbelsteen");
const scoreEl = document.getElementById("score");

const melding = document.getElementById("melding");
const meldingTekst = document.getElementById("melding-tekst");
const meldingOk = document.getElementById("melding-ok");

const finish = 140;

// geluiden
const geluidDobbel = new Audio("./sounds/dobbel.mp3");
const geluidGans = new Audio("./sounds/gans.mp3");
const geluidFinish = new Audio("./sounds/finish.mp3");

let posities = [0,0,0,0];
let skip = [0,0,0,0];

let team = 0;

const putten = [13, 38, 64, 89, 115];
const bruggen = [6, 52, 97];
const gevangenissen = [31, 78, 124];

const ganzen = [];
for (let i = 9; i < finish; i += 9) {
ganzen.push(i);
}

function teamNaam(){
return "Team " + (team+1);
}

function toonMelding(tekst){
meldingTekst.textContent = tekst;
melding.style.display = "flex";
}

meldingOk.addEventListener("click", () => {
melding.style.display = "none";
});

function maakBord(){

bord.innerHTML = "";

let nummer = 1;

for(let rij = 0; rij < 14; rij++){

let rijArray = [];

for(let kolom = 0; kolom < 10; kolom++){
rijArray.push(nummer);
nummer++;
}

if(rij % 2 === 1){
rijArray.reverse();
}

rijArray.forEach(nr => {

const vak = document.createElement("div");
vak.classList.add("vak");
vak.id = "vak" + nr;

if(nr === finish) vak.innerHTML = "🏁";
else if(putten.includes(nr)) vak.innerHTML = "<span>🪣</span>";
else if(bruggen.includes(nr)) vak.innerHTML = "<span>🌉</span>";
else if(gevangenissen.includes(nr)) vak.innerHTML = "<span>🔒</span>";
else if(ganzen.includes(nr)) vak.innerHTML = "<span>🪿</span>";
else vak.innerHTML = nr;

bord.appendChild(vak);

});

}

}

function updateBord(){

document.querySelectorAll(".vak").forEach(v => {

const nr = Number(v.id.replace("vak",""));

if(nr === finish) v.innerHTML = "🏁";
else if(putten.includes(nr)) v.innerHTML = "<span>🪣</span>";
else if(bruggen.includes(nr)) v.innerHTML = "<span>🌉</span>";
else if(gevangenissen.includes(nr)) v.innerHTML = "<span>🔒</span>";
else if(ganzen.includes(nr)) v.innerHTML = "<span>🪿</span>";
else v.innerHTML = nr;

});

posities.forEach((positie, index)=>{

if(positie > 0){

const vak = document.getElementById("vak"+positie);

const speler = document.createElement("div");
speler.classList.add("speler","team"+(index+1));

vak.appendChild(speler);

}

});

}

function updateScore(){

scoreEl.innerHTML = `
Team 1: ${posities[0]}
Team 2: ${posities[1]}
Team 3: ${posities[2]}
Team 4: ${posities[3]}
`;

}

function bounceBack(pos){
if(pos > finish){
return finish - (pos - finish);
}
return pos;
}

function nieuweVraag(){

const random = vragen[Math.floor(Math.random()*vragen.length)];

vraagEl.textContent = random.vraag;
antwoordEl.textContent = random.antwoord;

}

function checkFinish(){

posities.forEach((pos,index)=>{

if(pos === finish){

geluidFinish.play();
toonMelding("🎉 Team " + (index+1) + " wint!");

gooiBtn.disabled = true;

}

});

}

function updateBeurt(){
beurtEl.textContent = teamNaam() + " is aan de beurt";
}

gooiBtn.addEventListener("click", () => {

if(skip[team] > 0){

toonMelding(teamNaam() + " moet een beurt overslaan");

skip[team]--;

team++;
if(team > 3) team = 0;

updateBeurt();

return;
}

const worp = Math.floor(Math.random()*6)+1;

geluidDobbel.play();

dobbelsteen.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][worp-1];

posities[team] += worp;
posities[team] = bounceBack(posities[team]);

updateBord();

setTimeout(() => {

if(ganzen.includes(posities[team])){

geluidGans.play();
toonMelding("🪿 " + teamNaam() + " op een gans!");

updateBord();

setTimeout(()=>{

posities[team] += worp;
updateBord();

},600);

}

if(bruggen.includes(posities[team])){

toonMelding("🌉 " + teamNaam() + " over de brug +5");

updateBord();

setTimeout(()=>{

posities[team] += 5;
updateBord();

},600);

}

if(putten.includes(posities[team])){

toonMelding("🪣 " + teamNaam() + " zit in de put");
skip[team] = 1;

}

if(gevangenissen.includes(posities[team])){

toonMelding("🔒 " + teamNaam() + " in gevangenis");
skip[team] = 2;

}

checkFinish();

team++;
if(team > 3) team = 0;

updateScore();
updateBeurt();
nieuweVraag();

},600);

});

maakBord();
updateScore();
updateBeurt();
