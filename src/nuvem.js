// nuvem.js — Fase 2 (Visao.md): login e dados na nuvem, por usuário.
// Guarda só o que o médico customiza (máscaras próprias e alterações
// próprias) — nunca laudos gerados nem dados de paciente. Sem login, o app
// continua 100% local (localStorage), como sempre; a nuvem é um extra.

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { auth, db, firebaseDisponivel } from "./firebase.js";

export { firebaseDisponivel };

export function assinarUsuario(callback) {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

export async function criarConta(email, senha) {
  await createUserWithEmailAndPassword(auth, email, senha);
}

export async function entrar(email, senha) {
  await signInWithEmailAndPassword(auth, email, senha);
}

export async function sair() {
  await signOut(auth);
}

export function gerarIdCustom() {
  return "custom_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
}

// ---- Máscaras customizadas (override de máscara fixa OU exame novo) ----
// usuarios/{uid}/mascaras/{id} — id = id de MASCARAS (override) ou "custom_..." (exame novo).
// Campos: { nome?, texto, customizada: bool, atualizadoEm }

function colMascaras(uid) {
  return collection(db, "usuarios", uid, "mascaras");
}

export function assinarMascaras(uid, callback) {
  return onSnapshot(colMascaras(uid), (snap) => {
    const porId = {};
    snap.forEach((d) => { porId[d.id] = d.data(); });
    callback(porId);
  });
}

// Leitura única (não-reativa) — usada só na migração local→nuvem do login,
// pra não decidir com base num snapshot ainda vazio da assinatura reativa.
export async function obterMascaras(uid) {
  const snap = await getDocs(colMascaras(uid));
  const porId = {};
  snap.forEach((d) => { porId[d.id] = d.data(); });
  return porId;
}

export async function salvarMascara(uid, id, dados) {
  await setDoc(doc(colMascaras(uid), id), { ...dados, atualizadoEm: serverTimestamp() }, { merge: true });
}

export async function excluirMascara(uid, id) {
  await deleteDoc(doc(colMascaras(uid), id));
}

// ---- Alterações customizadas (rótulo + frase livre, sem campos estruturados) ----
// usuarios/{uid}/alteracoes/{id} — Campos: { mascaraId, orgao, rotulo, descricao, impressao, atualizadoEm }

function colAlteracoes(uid) {
  return collection(db, "usuarios", uid, "alteracoes");
}

export function assinarAlteracoes(uid, callback) {
  return onSnapshot(colAlteracoes(uid), (snap) => {
    const lista = [];
    snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));
    callback(lista);
  });
}

export async function obterAlteracoes(uid) {
  const snap = await getDocs(colAlteracoes(uid));
  const lista = [];
  snap.forEach((d) => lista.push({ id: d.id, ...d.data() }));
  return lista;
}

export async function salvarAlteracao(uid, id, dados) {
  await setDoc(doc(colAlteracoes(uid), id), { ...dados, atualizadoEm: serverTimestamp() }, { merge: true });
}

export async function excluirAlteracao(uid, id) {
  await deleteDoc(doc(colAlteracoes(uid), id));
}
