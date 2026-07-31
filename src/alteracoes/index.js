// Biblioteca ADITIVA de alterações clicáveis, um arquivo por exame.
// Para adicionar um exame novo: crie src/alteracoes/<exame>.js exportando o
// array de grupos (export default [...]) e acrescente UMA linha de import e
// UMA entrada no objeto ALTERACOES abaixo. Não é preciso tocar nos exames
// existentes. A chave de cada exame é o mesmo id usado em src/mascaras.js.

import abdome_total from "./abdome_total.js";
import vias_urinarias from "./vias_urinarias.js";

export const ALTERACOES = {
  abdome_total,
  vias_urinarias,
};
