import vragen from "./data/vragen.js";

const bord = document.getElementById("bord");
const vraagEl = document.getElementById("vraag");
const antwoordEl = document.getElementById("antwoord");
const gooiBtn = document.getElementById("gooi");
const beurtEl = document.getElementById("beurt");
const dobbelsteen = document.getElementById("dobbelsteen");

const finish = 140;

// 4 teams
let posities = [0,0,0,0];
let skip = [0,0,0,0];

let team = 0;

// vakken
const putten = [13, 38, 64, 89, 115];
const bruggen = [6, 52, 97];
const gevangenissen = [31, 78, 124];

const ganzen = [];
for (let i = 9; i < finish; i += 9) {
ganzen.push(i);
}

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

// spelers plaatsen
posities.forEach((positie, index)=>{

if(positie > 0){
const vak = document.getElementById("vak"+positie);

const speler = document.createElement("div");
speler.classList.add("speler","team"+(index+1));

vak.appendChild(speler);
}

});

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
alert("🎉 Team " + (index+1) + " wint!");
gooiBtn.disabled = true;
}

});

}

function updateBeurt(){

beurtEl.textContent = "Team " + (team+1) + " is aan de beurt";

}

gooiBtn.addEventListener("click", () => {

if(skip[team] > 0){
skip[team]--;
team++;

if(team > 3) team = 0;

updateBeurt();
return;
}

const worp = Math.floor(Math.random()*6)+1;

dobbelsteen.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][worp-1];

posities[team] += worp;
posities[team] = bounceBack(posities[team]);

// gans
if(ganzen.includes(posities[team])){
alert("🪿 Gans! Nog een keer vooruit");
posities[team] += worp;
}

// put
if(putten.includes(posities[team])){
alert("🪣 In de put! Beurt overslaan");
skip[team] = 1;
}

// gevangenis
if(gevangenissen.includes(posities[team])){
alert("🔒 Gevangenis! 2 beurten overslaan");
skip[team] = 2;
}

// brug
if(bruggen.includes(posities[team])){
alert("🌉 Brug! Extra vooruit");
posities[team] += 5;
}

team++;

if(team > 3){
team = 0;
}

updateBord();
nieuweVraag();
checkFinish();
updateBeurt();

});

maakBord();
updateBeurt();
