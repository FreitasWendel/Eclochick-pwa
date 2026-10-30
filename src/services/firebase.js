// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {

  apiKey: "AIzaSyDWMjcGFsA6hbnc5yp1bEmIFJGvP8Zmxz8",

  authDomain: "testeprototipo-74ae9.firebaseapp.com",

  databaseURL: "https://testeprototipo-74ae9-default-rtdb.firebaseio.com",

  projectId: "testeprototipo-74ae9",

  storageBucket: "testeprototipo-74ae9.firebasestorage.app",

  messagingSenderId: "419764444892",

  appId: "1:419764444892:web:f12c1e7322dd0db2eb1e19"

};


// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta o banco de dados para usarmos nas telas
export const db = getDatabase(app);