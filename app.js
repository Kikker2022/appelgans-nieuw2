let currentTeam = 0;
}

}

if(tile === "brug"){

while(positions[currentTeam] < 30){

positions[currentTeam]++;

updateBoard();

await sleep(150);

}

}

if(positions[currentTeam] >= 140){

alert("🏆 Team wint!");

return;

}

setTimeout(function(){

nextTeam();

showScreen(1);

}, 2500);

}


function nextTeam(){

currentTeam++;

if(currentTeam > 3){
currentTeam = 0;
}

const teamNames = [
"Rood",
"Blauw",
"Groen",
"Geel"
];

turnText.innerText =
"Team " +
teamNames[currentTeam] +
" is aan de beurt";

}


function sleep(ms){

return new Promise(resolve =>
setTimeout(resolve, ms)
);

}


updateBoard();
updateCategoryDisplay();
showScreen(1);
