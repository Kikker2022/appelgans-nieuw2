// ===============================
// Firebase configuratie
// ===============================

const firebaseConfig = {
  apiKey: "AIzaSyCtLCDt4kT0mSmeDm0pHFprsU-zmOMrYkg",
  authDomain: "appelgans-dfbdb.firebaseapp.com",
  databaseURL: "https://appelgans-dfbdb-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "appelgans-dfbdb",
  storageBucket: "appelgans-dfbdb.firebasestorage.app",
  messagingSenderId: "121163726885",
  appId: "1:121163726885:web:0c8a76c2fe671df5a4bfcc",
  measurementId: "G-EGJT48F990"
};

// Firebase starten
firebase.initializeApp(firebaseConfig);

// Database openen
const db = firebase.database();

// Verbinding testen
db.ref("test").set({
  bericht: "Firebase werkt!",
  tijd: new Date().toISOString()
})
.then(() => {
  console.log("✅ Firebase verbonden");
})
.catch((error) => {
  console.error("❌ Firebase fout:", error);
});

games/1234 = {
    currentTeamIndex: 0,
    turnOrder: ["team1", "team2", "team3", "team4"],
    phase: "question"
}
