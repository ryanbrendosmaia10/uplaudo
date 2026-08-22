// Biblioteca ADITIVA de alterações clicáveis, um arquivo por exame.
// Para adicionar um exame novo: crie src/alteracoes/<exame>.js exportando o
// array de grupos (export default [...]) e acrescente UMA linha de import e
// UMA entrada no objeto ALTERACOES abaixo. Não é preciso tocar nos exames
// existentes. A chave de cada exame é o mesmo id usado em src/mascaras.js
// (chave única — nunca duplicar por nome por extenso, isso é fonte de bugs
// de chave divergente entre o select e o objeto).

import abdomeTotal from "./abdome_total.js";
import viasUrinarias from "./vias_urinarias.js";
import mama from "./mama.js";
import prostata from "./prostata.js";
import transvaginal from "./transvaginal.js";
import pelvicaAbdominal from "./pelvica_abdominal.js";

export const ALTERACOES = {
  abdome_total: abdomeTotal,
  vias_urinarias: viasUrinarias,
  mama,
  prostata,
  transvaginal,
  pelvica_abdominal: pelvicaAbdominal,
};
