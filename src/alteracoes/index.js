// src/alteracoes/index.js

import abdomeTotal from "./abdome_total.js";
import viasUrinarias from "./vias_urinarias.js";
import mama from "./mama.js";
import prostata from "./prostata.js";
import transvaginal from "./transvaginal.js";

export const ALTERACOES = {
  // Mapeamento por chave do ID da máscara
  "abdome_total": abdomeTotal,
  "vias_urinarias": viasUrinarias,
  "mama": mama,
  "prostata": prostata,
  "transvaginal": transvaginal,

  // Mapeamento por Nomes por extenso (garante compatibilidade total)
  "Abdome Total": abdomeTotal,
  "Vias Urinárias": viasUrinarias,
  "Mama": mama,
  "Próstata (Via Abdominal)": prostata,
  "Transvaginal": transvaginal,
  "Pélvica transvaginal": transvaginal
};

export const bibliotecasExames = ALTERACOES;
