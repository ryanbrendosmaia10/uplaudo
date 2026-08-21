// src/alteracoes/pelvica_abdominal.js — USG Pélvica (via abdominal).
// Biblioteca inicial: só os 2 itens pedidos pelo Dr. Ryan (histerectomia
// total no Útero, cisto simples no Ovário). Mesmos textos de
// transvaginal.js, já que a máscara desta modalidade usa os mesmos rótulos
// de parágrafo ("Útero:", "Ovários:").

export default [
  {
    orgao: "Útero",
    itens: [
      {
        rotulo: "Histerectomia total (útero não caracterizado)",
        descricao: "Útero: não caracterizado, em conformidade com relato de cirurgia prévia. Ausência de lesões expansivas na loja uterina.",
        impressao: "Sinais de histerectomia total."
      }
    ]
  },
  {
    orgao: "Ovários",
    itens: [
      {
        rotulo: "Cisto simples",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Ovários: de contornos regulares e ecotextura habitual, com dimensões aumentadas no ovário à custa de formação cística anecoica, unilocular, de paredes finas e regulares, medindo cm.",
        impressao: "Cisto de aspecto simples no ovário ."
      }
    ]
  }
];
