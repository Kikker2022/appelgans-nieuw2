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
const dobbelGeluid = new Audio("sounds/dobbel.mp3");
const finishGeluid = new Audio("sounds/finish.mp3");
const gansGeluid = new Audio("sounds/gans.mp3");

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
    const kleuren = ["🔴 Rood", "🔵 Blauw", "🟢 Groen", "🟠 Oranje"];
    return kleuren[team];
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
            else if(putten.includes(nr)) vak.innerHTML = "🪣";
            else if(bruggen.includes(nr)) vak.innerHTML = "🌉";
            else if(gevangenissen.includes(nr)) vak.innerHTML = "🔒";
            else if(ganzen.includes(nr)) vak.innerHTML = "🪿";
            else vak.innerHTML = nr;

            bord.appendChild(vak);
        });
    }
}

function updateBord(){
    document.querySelectorAll(".vak").forEach(v => {
        const nr = Number(v.id.replace("vak",""));

        if(nr === finish) v.innerHTML = "🏁";
        else if(putten.includes(nr)) v.innerHTML = "🪣";
        else if(bruggen.includes(nr)) v.innerHTML = "🌉";
        else if(gevangenissen.includes(nr)) v.innerHTML = "🔒";
        else if(ganzen.includes(nr)) v.innerHTML = "🪿";
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
    🔴 ${posities[0]} | 🔵 ${posities[1]} | 🟢 ${posities[2]} | 🟠 ${posities[3]}
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
            finishGeluid.currentTime = 0;
            finishGeluid.play();
            toonMelding("🎉 " + ["🔴","🔵","🟢","🟠"][index] + " wint!");
            gooiBtn.disabled = true;
        }
    });
}

function updateBeurt(){
    beurtEl.innerHTML = `<strong>${teamNaam()}</strong> is aan de beurt`;
}

// 🔥 NIEUW: animatie
function beweegSpeler(stappen, callback){
    let teller = 0;

    const interval = setInterval(() => {

        posities[team]++;
        posities[team] = bounceBack(posities[team]);

        updateBord();

        teller++;

        if(teller >= stappen){
            clearInterval(interval);
            if(callback) callback();
        }

    }, 300);
}

gooiBtn.addEventListener("click", () => {

    if(skip[team] > 0){
        toonMelding(teamNaam() + " moet een beurt overslaan");
        skip[team]--;

        team = (team + 1) % 4;
        updateBeurt();
        return;
    }

    const worp = Math.floor(Math.random()*6)+1;

    dobbelGeluid.currentTime = 0;
    dobbelGeluid.play();

    dobbelsteen.textContent = ["⚀","⚁","⚂","⚃","⚄","⚅"][worp-1];

    // 🔥 animatie
    beweegSpeler(worp, () => {

        if(ganzen.includes(posities[team])){
            gansGeluid.currentTime = 0;
            gansGeluid.play();

            toonMelding("🪿 " + teamNaam() + " → nog eens " + worp);

            beweegSpeler(worp, () => vervolg());
        } else {
            vervolg();
        }

    });

    function vervolg(){

        if(bruggen.includes(posities[team])){
            toonMelding("🌉 " + teamNaam() + " → +5");

            beweegSpeler(5, () => afronden());
        } else {
            afronden();
        }
    }

    function afronden(){

        if(putten.includes(posities[team])){
            toonMelding("🪣 " + teamNaam() + " → 1 beurt overslaan");
            skip[team] = 1;
        }

        if(gevangenissen.includes(posities[team])){
            toonMelding("🔒 " + teamNaam() + " → 2 beurten overslaan");
            skip[team] = 2;
        }

        checkFinish();

        team = (team + 1) % 4;

        updateScore();
        updateBeurt();
        nieuweVraag();
    }

});

maakBord();
updateScore();
updateBeurt();
