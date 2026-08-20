// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD4MSbtXMO76hmg5EhCo_I-oe5yJLO6MIc",
  authDomain: "akvaryum-73799.firebaseapp.com",
  projectId: "akvaryum-73799",
  databaseURL: "https://akvaryum-73799-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "akvaryum-73799.firebasestorage.app",
  messagingSenderId: "339354615297",
  appId: "1:339354615297:web:ed73a9cc57404574334a00"
};

try {
    // Initialize Firebase
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const database = firebase.database();
    window.firebaseDB = database;
} catch (e) {
    console.error("Firebase init error:", e);
}