// src/alteracoes/vias_urinarias.js — USG de Vias Urinárias (Reaproveita Rins e Bexiga do Abdome)

import abdomeTotal from "./abdome_total.js";

const orgaosViasUrinarias = ["Rins", "Bexiga"];

export default abdomeTotal.filter(grupo => orgaosViasUrinarias.includes(grupo.orgao));
