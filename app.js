function gooiDobbelsteen() {

  let worp = Math.floor(Math.random() * 6) + 1;
  document.getElementById("dobbel").innerText = "Je gooide: " + worp;

  let vraag = vragen[Math.floor(Math.random() * vragen.length)];

  document.getElementById("vraag").innerText = vraag.vraag;
  document.getElementById("antwoord").innerText = vraag.antwoord;

}

window.gooiDobbelsteen = gooiDobbelsteen;
