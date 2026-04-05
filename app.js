import { alleVragen } from "./data/vragen.js";

const dobbelsteen = document.getElementById("dobbelsteen");
const worpTekst = document.getElementById("worp");
const bord = document.getElementById("bord");
const beurtTekst = document.getElementById("beurt");
const melding = document.getElementById("melding");

const score1 = document.getElementById("score1");
const score2 = document.getElementById("score2");

const vraag = document.getElementById("vraag");
const antwoord = document.getElementById("antwoord");

let positie1 = 1;
let positie2 = 1;

let speler = 1;
let nogEenKeer = false;

const ganzenVakjes = [6,12,19,31];

function tekenBord(){

bord.innerHTML="";

let volgorde = [];

for(let rij=0; rij<6; rij++){

let start = rij * 7 + 1;

let rijVakjes = [];

for(let i=0; i<7; i++){
rijVakjes.push(start + i);
}

if(rij % 2 === 1){
rijVakjes.reverse();
}

volgorde = volgorde.concat(rijVakjes);

}

volgorde.forEach(i=>{

let vak = document.createElement("div");
vak.classList.add("vakje");

if(i===1) vak.classList.add("start");
if(i===42) vak.classList.add("finish");

if(ganzenVakjes.includes(i)){
vak.classList.add("gans");
vak.textContent="🪿";
}else{
vak.textContent=i;
}

if(i===positie1){
vak.innerHTML="🔵";
}

if(i===positie2){
vak.innerHTML="🔴";
}

if(i===positie1 && i===positie2){
vak.innerHTML="🔵🔴";
}

bord.appendChild(vak);

});

}

tekenBord();

dobbelsteen.addEventListener("click",()=>{

let worp=Math.floor(Math.random()*6)+1;

worpTekst.textContent="Je gooide "+worp;

melding.textContent="";

if(speler===1){
positie1+=worp;
ganzen(1);
score1.textContent=positie1;
}else{
positie2+=worp;
ganzen(2);
score2.textContent=positie2;
}

toonVraag();

tekenBord();

if(!nogEenKeer){
speler=speler===1?2:1;
}

beurtTekst.textContent=(speler===1?"🔵":"🔴")+" Team "+speler+" is aan de beurt";

nogEenKeer=false;

});

function toonVraag(){

let random=alleVragen[Math.floor(Math.random()*alleVragen.length)];

vraag.textContent="Vraag: "+random.vraag;

antwoord.innerHTML="<button id='antwoordBtn'>Toon antwoord</button>";

document.getElementById("antwoordBtn").onclick=()=>{
antwoord.textContent="Antwoord: "+random.antwoord;
};

}

function ganzen(s){

let pos=s===1?positie1:positie2;

if(pos===6){
pos+=12;
melding.textContent="🪿 12 vooruit";
}

if(pos===12){
pos+=3;
melding.textContent="🪿 3 vooruit";
}

if(pos===19){
pos=10;
melding.textContent="↩️ terug naar 10";
}

if(pos===31){
melding.textContent="🪿 nog een keer";
nogEenKeer=true;
}

if(s===1) positie1=pos;
else positie2=pos;

}
