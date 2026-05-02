// ===== DATA IMPORT =====
import vragen from "./data/vragen.js";

// ===== ELEMENTEN =====
const bordEl = document.getElementById("bord");
const vraagEl = document.getElementById("vraag");
const antwoordEl = document.getElementById("antwoord");
const gooiBtn = document.getElementById("gooi");
const beurtEl = document.getElementById("beurt");
const scoreEl = document.getElementById("score");
const dobbelsteenEl = document.getElementById("dobbelsteen");

// ===== SPEL STATUS =====
let spelers = [
  { naam: "Team 1", positie: 0, score: 0 },
  { naam: "Team 2", positie: 0, score: 0 }
];

let huidigeSpeler = 0;
const finish = 42;

// ===== GELUID =====
const sounds = {
  dobbel: new Audio("/dobbel.mp3"),
  gans: new Audio("/gans.mp3"),
  finish: new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg")
};

Object.values(sounds).forEach(s => {
  s.preload = "auto";
  s.volume = 0.8;
});

function speelGeluid(sound) {
  try {
    sound.currentTime = 0;
    sound.play().catch(() => {});
  } catch (e) {
    console.log("Geluid fout:", e);
  }
}

// ===== BORD MAKEN =====
function maakBord() {
  bordEl.innerHTML = "";
  for (let i = 1; i <= finish; i++) {
    const vak = document.createElement("div");
    vak.classList.add("vak");
    vak.textContent = i;
    vak.id = "vak-" + i;
    bordEl.appendChild(vak);
  }
}

// ===== SPELER TONEN =====
function updateBord() {
  document.querySelectorAll(".vak").forEach(v => v.classList.remove("speler1", "speler2"));

  spelers.forEach((speler, index) => {
    if (speler.positie > 0) {
      const vak = document.getElementById("vak-" + speler.positie);
      if (vak) vak.classList.add("speler" + (index + 1));
    }
  });
}

// ===== SCORE =====
function updateScore() {
  scoreEl.innerHTML = spelers
    .map(s => `${s.naam}: ${s.score}`)
    .join(" | ");
}

// ===== BEURT =====
function updateBeurt() {
  beurtEl.textContent = spelers[huidigeSpeler].naam + " is aan de beurt";
}

// ===== DOBBEL =====
function gooiDobbelsteen() {
  const worp = Math.floor(Math.random() * 6) + 1;
  dobbelsteenEl.textContent = worp;

  speelGeluid(sounds.dobbel);

  let speler = spelers[huidigeSpeler];
  speler.positie += worp;

  if (speler.positie > finish) {
    speler.positie = finish - (speler.positie - finish); // terugkaatsen
  }

  checkSpecialeVakjes(speler);
  updateBord();

  toonVraag();

  updateScore();
}

// ===== GANZEN VAKJES =====
function checkSpecialeVakjes(speler) {
  const ganzen = [5, 9, 14, 18, 23, 27, 32, 36];

  if (ganzen.includes(speler.positie)) {
    speelGeluid(sounds.gans);
    speler.positie += 3;
  }

  if (speler.positie >= finish) {
    speler.positie = finish;
    speelGeluid(sounds.finish);
    alert(speler.naam + " heeft gewonnen!");
  }
}

// ===== VRAGEN =====
function toonVraag() {
  const random = vragen[Math.floor(Math.random() * vragen.length)];

  vraagEl.textContent = random.vraag;
  antwoordEl.textContent = "";

  // klik om antwoord te tonen
  antwoordEl.onclick = () => {
    antwoordEl.textContent = random.antwoord;
    volgendeBeurt();
  };
}

// ===== VOLGENDE BEURT =====
function volgendeBeurt() {
  huidigeSpeler = (huidigeSpeler + 1) % spelers.length;
  updateBeurt();
}

// ===== INIT =====
gooiBtn.addEventListener("click", gooiDobbelsteen);

maakBord();
updateBord();


updateScore();
updateBeurt();
