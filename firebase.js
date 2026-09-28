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

// ===============================
// Anonieme Firebase Authentication
// ===============================
//
// Iedere telefoon krijgt automatisch een eigen Firebase-identiteit.
// De speler hoeft hiervoor geen account, e-mailadres of wachtwoord
// in te vullen.

firebase.auth().onAuthStateChanged((user) => {

  if (user) {

    window.firebaseUser = user;
    window.firebaseUid = user.uid;

    console.log("🔐 Anoniem aangemeld");
    console.log("Firebase UID:", user.uid);

  } else {

    firebase.auth().signInAnonymously()
      .catch((error) => {
        console.error(
          "❌ Anoniem aanmelden mislukt:",
          error
        );
      });
  }
});

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
