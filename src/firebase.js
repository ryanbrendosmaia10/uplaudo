// firebase.js — inicialização do projeto Firebase (Fase 2 do Visao.md: login
// e máscaras/alterações na nuvem). Config vem de variáveis de ambiente
// VITE_FIREBASE_* (ver .env.example) — não são segredo, a segurança de quem
// pode ler/escrever cada dado fica nas regras do Firestore (firestore.rules).

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Config ausente (ex.: alguém rodando sem .env): a nuvem fica desligada, mas
// o app continua funcionando 100% localmente (localStorage), como sempre.
export const firebaseDisponivel = !!firebaseConfig.apiKey;

const app = firebaseDisponivel ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
