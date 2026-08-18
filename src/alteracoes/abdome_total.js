// src/alteracoes/abdome_total.js — Biblioteca completa do Abdome Total

export default [
  {
    orgao: "Fígado",
    itens: [
      {
        rotulo: "Fígado normal",
        descricao: "Fígado: de dimensões, contornos, bordos e ecotextura parenquimatosa normais/habituais. Marcas vasculares preservadas. Sem lesões focais evidenciadas ao método.",
        impressao: ""
      },
      {
        rotulo: "Lobo de Riedel",
        descricao: "Fígado: de dimensões discretamente aumentadas à custa do lobo direito (variante lobo de Riedel), com contornos, ecotextura parenquimatosa e bordas normais. Marcas vasculares preservadas.",
        impressao: "Variante anatômica hepática (lobo de Riedel)."
      },
      {
        rotulo: "Esteatose leve",
        descricao: "Fígado: de dimensões, contornos e bordos normais, com ecotextura de fundo homogênea, exibindo leve aumento difuso da ecogenicidade. Marcas vasculares hepáticas preservadas. Não foram evidenciadas lesões focais ao método.",
        impressao: "Sinais sugestivos de esteatose hepática leve (grau I)."
      },
      {
        rotulo: "Esteatose moderada",
        descricao: "Fígado: de dimensões, contornos e bordos normais, com ecotextura de fundo homogênea, exibindo moderado aumento difuso da ecogenicidade. Marcas vasculares hepáticas preservadas. Não foram evidenciadas lesões focais ao método.",
        impressao: "Sinais sugestivos de esteatose hepática moderada (grau II)."
      },
      {
        rotulo: "Esteatose acentuada (com atenuação)",
        descricao: "Fígado: de dimensões, contornos e bordos normais, exibindo acentuado aumento difuso da ecogenicidade, com atenuação do feixe acústico posterior, que limita a avaliação de eventuais lesões focais/alterações da ecotextura parenquimatosa.",
        impressao: "Sinais sugestivos de esteatose hepática acentuada (grau III)."
      },
      {
        rotulo: "Esteatose acentuada (ecotextura normal)",
        descricao: "Fígado: de dimensões, contornos e bordos normais, exibindo acentuado aumento difuso da ecogenicidade, com ecotextura parenquimatosa de fundo habitual.",
        impressao: "Sinais sugestivos de esteatose hepática acentuada (grau III)."
      },
      {
        rotulo: "Esteatose difusa genérica",
        descricao: "Fígado: de morfologia, contornos e dimensões normais, apresentando leve/moderado/acentuado aumento difuso da ecogenicidade.",
        impressao: "Alterações sugestivas de leve/moderada/acentuada infiltração gordurosa hepática."
      },
      {
        rotulo: "Esteatose leve/mod. + Hepatomegalia",
        descricao: "Fígado: de dimensões aumentadas, com contornos e bordas normais, exibindo leve/moderado aumento difuso da ecogenicidade parenquimatosa. Marcas vasculares hepáticas preservadas. Não foram evidenciadas lesões focais ao método.",
        impressao: "Hepatomegalia associada a sinais sugestivos de esteatose hepática leve/moderada."
      },
      {
        rotulo: "Esteatose acentuada + Hepatomegalia",
        descricao: "Fígado: de dimensões aumentadas, com contornos e bordos normais, exibindo acentuado aumento difuso da ecogenicidade, com atenuação do feixe acústico posterior, que limita a avaliação de eventuais lesões focais/alterações da ecotextura parenquimatosa.",
        impressao: "Hepatomegalia associada a sinais sugestivos de esteatose hepática acentuada."
      },
      {
        rotulo: "Preservação focal única",
        requerInput: true,
        campos: ["segmento", "medidaX"],
        descricao: "Fígado: de dimensões, contornos e bordos normais, exibindo leve/moderado/acentuado aumento difuso da ecogenicidade e área hipoecoica, mal delimitada, sem aparente efeito de massa, localizada no segmento hepático , medindo cm, podendo representar área de preservação.",
        impressao: "Achados sugestivos de esteatose hepática, associados a área de preservação focal."
      },
      {
        rotulo: "Preservação focal perivesicular",
        descricao: "Fígado: de dimensões, contornos e bordos normais, exibindo leve/moderado/acentuado aumento difuso da ecogenicidade. Observam-se imagens hipoecogênicas, amorfas, perivesiculares, nos segmentos IVb e V, sugestivas de áreas de preservação de parênquima.",
        impressao: "Achados sugestivos de esteatose hepática, associados a áreas de preservação de parênquima."
      },
      {
        rotulo: "Hemangioma hepático",
        requerInput: true,
        campos: ["segmento", "medidaX", "medidaY"],
        descricao: "Fígado: de dimensões, contornos, bordos e ecotextura parenquimatosa normais/habituais, exceto pela presença de formação nodular sólida, hiperecogênica, de contornos bem definidos, sem fluxo ao Doppler, localizada no segmento hepático , medindo cm. Marcas vasculares preservadas.",
        impressao: "Nódulo hepático hiperecogênico, sugestivo de hemangioma."
      },
      {
        rotulo: "Cisto hepático simples",
        requerInput: true,
        campos: ["segmento", "medidaX"],
        descricao: "Fígado: de dimensões e ecotextura normais, notando-se formação cística de paredes finas e regulares, com conteúdo anecoide e homogêneo, localizada no segmento , medindo cm.",
        impressao: "Cisto hepático simples."
      },
      {
        rotulo: "Nódulos hepáticos secundários (Metástases)",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Fígado: com parênquima de ecotextura preservada, exibindo formações nodulares sólidas, de contornos bem definidos e arredondados, com conteúdo hipoecogênico e halo periférico, determinando efeito de massa e deslocamento vascular adjacente, medindo até cm.",
        impressao: "Múltiplos nódulos hepáticos, devendo-se considerar a possibilidade de lesões secundárias/metástases dentre os diferenciais."
      },
      {
        rotulo: "Hepatopatia crônica",
        descricao: "Fígado: de dimensões normais, exibindo bordos rombos, contornos irregulares e ecotextura heterogênea. Ausência de lesões focais ao método.",
        impressao: "Sinais de enfermidade parenquimatosa hepática / hepatopatia crônica."
      },
      {
        rotulo: "Cirrose + Atrofia",
        descricao: "Fígado: de dimensões reduzidas, com sinais de hipertrofia compensatória dos lobos caudado e esquerdo, exibindo bordos rombos, contornos serrilhados e ecotextura parenquimatosa difusamente heterogênea.",
        impressao: "Sinais de hepatopatia crônica em estágio avançado / cirrose."
      }
    ]
  },
  {
    orgao: "Vesícula Biliar",
    itens: [
      {
        rotulo: "Colecistolitíase",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vesícula Biliar: em situação habitual, normodistendida, de paredes finas, exibindo em seu interior imagem ecogênica móvel à mudança de decúbito, com sombra acústica posterior, medindo cm.",
        impressao: "Colecistolitíase."
      },
      {
        rotulo: "Complexo Parede-Eco-Sombra (WES sign)",
        descricao: "Vesícula Biliar: apresentando fino halo hipoecóico entre a sua parede anterior e a hiperrefringência interna, caracterizando o complexo 'parede-eco-sombra', relacionado a cálculo vultoso ou repletado por cálculos.",
        impressao: "Colecistopatia calculosa (complexo parede-eco-sombra)."
      },
      {
        rotulo: "Microlitíase biliar",
        descricao: "Vesícula Biliar: normodistendida, de paredes finas, exibindo em seu interior pequenas imagens hiperecogênicas milimétricas agrupadas na porção declive, produtoras de discreta sombra acústica posterior.",
        impressao: "Microlitíase biliar."
      },
      {
        rotulo: "Lama biliar",
        descricao: "Vesícula Biliar: em situação habitual, normodistendida, de paredes finas, contendo material ecogênico móvel durante mudança de decúbito no seu interior, sugestivo de lama biliar.",
        impressao: "Sinais de lama biliar."
      },
      {
        rotulo: "Pólipo de vesícula",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vesícula Biliar: normodistendida, de paredes finas, apresentando pequena imagem nodular hiperecogênica, fixa à parede, sem sombra acústica posterior, medindo cm.",
        impressao: "Pólipo de vesícula biliar."
      },
      {
        rotulo: "Colecistite aguda",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vesícula Biliar: distendida, com espessamento difuso e estratificado de suas paredes, líquido perivesicular e sinal de Murphy ultrassonográfico positivo, contendo cálculo impactado no infundíbulo medindo cm.",
        impressao: "Sinais ultrassonográficos compatíveis com colecistite aguda."
      },
      {
        rotulo: "Colecistectomia",
        descricao: "Vesícula Biliar: não caracterizada (status pós-operatório / colecistectomia).",
        impressao: "Status pós-colecistectomia."
      },
      {
        rotulo: "Hipodistendida",
        descricao: "Vesícula Biliar: hipodistendida, limitando a adequada avaliação ecográfica das suas paredes. Apresenta conteúdo anecoide, aparentemente sem cálculos.",
        impressao: ""
      }
    ]
  },
  {
    orgao: "Vias Biliares",
    itens: [
      {
        rotulo: "Ectasia do colédoco (s/ fator obstrutivo)",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vias Biliares: intra-hepáticas sem sinais de dilatação. Discreta ectasia do hepatocolédoco, calibre medindo cm, sem caracterização de fatores obstrutivos ao método.",
        impressao: "Discreta ectasia do hepatocolédoco, sem evidência ultrassonográfica de fator obstrutivo atual."
      },
      {
        rotulo: "Ectasia pós-colecistectomia",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vias Biliares: intra-hepáticas sem sinais de dilatação. Leve ectasia do hepatocolédoco, achado fisiológico no contexto clínico pós-colecistectomia. Hepatocolédoco medindo cm.",
        impressao: "Leve ectasia do hepatocolédoco, de aspecto fisiológico em paciente pós-colecistectomizado."
      },
      {
        rotulo: "Dilatação de vias biliares",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vias Biliares: intra e extra-hepáticas com calibres aumentados, notando-se o ducto colédoco medindo cm.",
        impressao: "Dilatação das vias biliares intra e extra-hepáticas."
      },
      {
        rotulo: "Coledocolitíase",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Vias Biliares: ducto colédoco de calibre aumentado, apresentando no seu terço distal imagem hiperecogênica com sombra acústica posterior, medindo cm.",
        impressao: "Dilatação do colédoco associada a imagem sugestiva de coledocolitíase."
      }
    ]
  },
  {
    orgao: "Rins",
    itens: [
      {
        rotulo: "Cisto renal simples",
        requerInput: true,
        campos: ["lado", "terço", "medidaX"],
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais. Diferenciação corticomedular preservada. Presença de cisto simples no rim , polo , medindo cm. Não foram caracterizados sinais de macrolitíase ou hidronefrose.",
        impressao: "Cisto renal simples no rim ."
      },
      {
        rotulo: "Cisto com fino septo",
        requerInput: true,
        campos: ["lado", "terço", "medidaX"],
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais. Diferenciação corticomedular preservada. Formação cística, de paredes finas, com fino septo, no terço do rim , medindo cm. Ausência de macrolitíase ou hidronefrose.",
        impressao: "Cisto renal com fino septo no rim ."
      },
      {
        rotulo: "Aumento ecogenicidade + Cisto simples",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais, com discreto aumento difuso da ecogenicidade parenquimatosa, com preservação da relação corticomedular. Notam-se cistos simples no rim , medindo cm.",
        impressao: "Discreto aumento difuso da ecogenicidade parenquimatosa renal bilateralmente.\n- Cisto renal simples no rim ."
      },
      {
        rotulo: "Aumento da ecogenicidade (com corr. lab)",
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais, com discreto aumento difuso da ecogenicidade parenquimatosa e preservação da diferenciação corticomedular.",
        impressao: "Leve aumento difuso da ecogenicidade parenquimatosa renal bilateralmente, podendo representar doença renal difusa. Convém correlação com dados clínico-laboratoriais."
      },
      {
        rotulo: "Doença renal crônica (Nefropatia)",
        descricao: "Rins: tópicos, de dimensões reduzidas, exibindo afilamento cortical, aumento difuso da ecogenicidade parenquimatosa e prejuízo da diferenciação corticomedular.",
        impressao: "Sinais ultrassonográficos de nefropatia parenquimatosa crônica."
      },
      {
        rotulo: "Nefrolitíase (único - com ectasia)",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Rins: tópicos, de dimensões e contornos normais. Presença de cálculo no grupamento calicinal médio do rim , medindo cm, gerando discreta dilatação pielocalicinal a montante.",
        impressao: "Cálculo renal no rim , condicionando discreta dilatação pielocalicinal a montante."
      },
      {
        rotulo: "Nefrolitíase (único - não obstrutivo)",
        requerInput: true,
        campos: ["lado", "terço", "medidaX"],
        descricao: "Rins: tópicos, de forma, dimensões, contornos e ecotextura normais. Presença de cálculo renal localizado no terço do rim , medindo cm, sem sinais de hidronefrose.",
        impressao: "Achados sugestivos de nefrolitíase não obstrutiva no rim ."
      },
      {
        rotulo: "Múltiplos cálculos (maior medida)",
        requerInput: true,
        campos: ["lado", "terço", "medidaX"],
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais. Observam-se múltiplos cálculos renais no rim , o maior medindo até cm, localizado no terço . Ausência de sinais de hidronefrose.",
        impressao: "Achados sugestivos de nefrolitíase múltipla não obstrutiva no rim ."
      },
      {
        rotulo: "Múltiplos cálculos (por grupamento)",
        requerInput: true,
        campos: ["lado", "medidaX", "medidaY"],
        descricao: "Rins: tópicos, de forma, dimensões e contornos normais. Observam-se múltiplos cálculos renais no rim , assim dispostos:\n- grupamento superior, medindo cm;\n- grupamento médio, medindo cm.",
        impressao: "Nefrolitíase múltipla no rim , conforme descrito."
      },
      {
        rotulo: "Dilatação pielocalicinal (Hidronefrose)",
        requerInput: true,
        campos: ["grau", "lado"],
        descricao: "Rins: tópicos, de forma, dimensões e ecotextura parenquimatosa habituais. Diferenciação corticomedular preservada. Não se observam sinais de macrolitíase. Nota-se leve/moderada/acentuada dilatação pielocalicinal no rim , sem caracterização de fatores obstrutivos ao método.",
        impressao: "Leve/Moderada/Acentuada hidronefrose no rim , sem evidência ultrassonográfica de fator obstrutivo atual."
      },
      {
        rotulo: "Dilatação pielocalicinal bilateral",
        requerInput: true,
        campos: ["grau"],
        descricao: "Rins: tópicos, de forma, dimensões e ecotextura parenquimatosa habituais. Diferenciação corticomedular preservada. Não se observam sinais de macrolitíase. Nota-se leve/moderada/acentuada dilatação pielocalicinal bilateralmente, sem caracterização de fatores obstrutivos ao método.",
        impressao: "Leve/Moderada/Acentuada hidronefrose bilateral, sem evidência ultrassonográfica de fator obstrutivo atual."
      },
      {
        rotulo: "Dilatação uretero-pielocalicinal (Ureterohidronefrose)",
        requerInput: true,
        campos: ["grau", "lado"],
        descricao: "Rins: tópicos, de forma, dimensões e ecotextura parenquimatosa habituais. Diferenciação corticomedular preservada. Presença de leve/moderada/acentuada dilatação uretero-pielocalicinal no rim , com ectasia do ureter visualizado, sem caracterização clara do fator obstrutivo ao método.",
        impressao: "Leve/Moderada/Acentuada ureterohidronefrose no rim , sem fator obstrutivo caracterizado ao método."
      },
      {
        rotulo: "Dilatação uretero-pielocalicinal bilateral",
        requerInput: true,
        campos: ["grau"],
        descricao: "Rins: tópicos, de forma, dimensões e ecotextura parenquimatosa habituais. Diferenciação corticomedular preservada. Presença de leve/moderada/acentuada dilatação uretero-pielocalicinal bilateralmente, sem caracterização clara do fator obstrutivo ao método.",
        impressao: "Leve/Moderada/Acentuada ureterohidronefrose bilateral, sem fator obstrutivo caracterizado ao método."
      },
      {
        rotulo: "Retração cortical focal (Cicatriz/Sequela)",
        requerInput: true,
        campos: ["lado", "terço"],
        descricao: "Rins: tópicos, de forma, dimensões e ecotextura parenquimatosa habituais. Observa-se área de retração cortical focal do parênquima no terço do rim , de provável natureza residual / sequelar. Diferenciação corticomedular preservada nos demais segmentos. Ausência de macrolitíase ou hidronefrose.",
        impressao: "Área de retração cortical focal no rim , de provável etiologia sequelar."
      },
      {
        rotulo: "Angiomiolipoma renal",
        requerInput: true,
        campos: ["lado", "terço", "medidaX"],
        descricao: "Rins: tópicos, apresentando no rim imagem nodular hiperecogênica, bem delimitada, homogênea, localizada no terço , medindo cm.",
        impressao: "Nódulo renal hiperecogênico no rim , altamente sugestivo de angiomiolipoma."
      }
    ]
  },
  {
    orgao: "Pâncreas",
    itens: [
      {
        rotulo: "Parcialmente visualizado (cabeça/corpo)",
        descricao: "Pâncreas: parcialmente visualizado em função de intensa interposição gasosa intestinal, sem anormalidades ao método nas porções caracterizadas (cabeça e parte do corpo).",
        impressao: ""
      },
      {
        rotulo: "Parcialmente visualizado (ducto normal)",
        descricao: "Pâncreas: parcialmente visualizado em virtude de interposição gasosa gastrointestinal, estando suas porções passíveis de análise com textura, dimensões e contornos normais. Ducto pancreático com calibre habitual nas porções visualizadas.",
        impressao: ""
      },
      {
        rotulo: "Pâncreas lipomatoso",
        descricao: "Pâncreas: de forma, contornos e dimensões preservadas, exibindo aumento difuso da sua ecogenicidade, achado compatível com substituição gordurosa / lipomatose.",
        impressao: "Aumento da ecogenicidade pancreática, sugestivo de lipomatose."
      }
    ]
  },
  {
    orgao: "Baço",
    itens: [
      {
        rotulo: "Baço acessório",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Baço: de dimensões e ecotextura normais, notando-se formação nodular sólida, de contornos bem definidos, isoecogênica ao parênquima esplênico, localizada inferomedialmente ao baço, medindo cm, compatível com baço acessório.",
        impressao: "Formação nodular sugestiva de baço acessório (variante anatômica)."
      },
      {
        rotulo: "Calcificação esplênica (Granulomas)",
        descricao: "Baço: com dimensões conservadas, morfologia habitual e ecotextura homogênea, exceto por pequenos granulomas residuais calcificados esparsos pelo parênquima.",
        impressao: "Pequenas calcificações no parênquima esplênico, de aspecto sequelar."
      },
      {
        rotulo: "Cisto esplênico",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Baço: de dimensões normais e ecotextura homogênea, exceto por formação anecoica, de paredes finas e regulares, com reforço acústico posterior, medindo cm.",
        impressao: "Formação cística esplênica."
      },
      {
        rotulo: "Esplenectomia pós-operatória",
        descricao: "Baço: não caracterizado (status pós-operatório / esplenectomia).",
        impressao: "Status pós-esplenectomia total."
      },
      {
        rotulo: "Auto-esplenectomia",
        descricao: "Baço: não caracterizado na loja esplênica, devendo-se considerar a hipótese de auto-esplenectomia no contexto clínico adequado.",
        impressao: "Achado sugestivo de auto-esplenectomia."
      },
      {
        rotulo: "Esplenectomia com Esplenose",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Baço: não caracterizado (status pós-operatório). Notam-se na loja esplênica formações nodulares sólidas, de contornos arredondados, com ecotextura semelhante à esplênica, medindo até cm.",
        impressao: "Status pós-esplenectomia, com nodulações na loja esplênica sugestivas de esplenose / remanescentes esplênicos."
      },
      {
        rotulo: "Esplenomegalia (com medida)",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Baço: de morfologia, contornos e ecotextura normais, com dimensões aumentadas, medindo cm em seu maior eixo longitudinal.",
        impressao: "Esplenomegalia homogênea."
      }
    ]
  },
  {
    orgao: "Aorta",
    itens: [
      {
        rotulo: "Avaliação prejudicada (gás)",
        descricao: "Aorta e Veia Cava Inferior: de avaliação prejudicada pela intensa interposição gasosa intestinal, apresentando calibre e trajeto normais nas porções passíveis de análise.",
        impressao: "Interposição gasosa intestinal limitando a avaliação ecográfica completa da aorta abdominal e veia cava inferior."
      },
      {
        rotulo: "Ateromatose aórtica",
        descricao: "Aorta Abdominal: de trajeto e calibre normais, apresentando placas ateromatosas parietais.",
        impressao: "Ateromatose aórtica."
      },
      {
        rotulo: "Aneurisma de aorta infra-renal (com fluxo)",
        requerInput: true,
        campos: ["medidaX", "medidaY"],
        descricao: "Aorta Abdominal: apresentando dilatação aneurismática fusiforme no seu segmento infra-renal, medindo cm de diâmetro transverso máximo e extensão longitudinal de cm. Ao estudo Doppler, observa-se fluxo turbilhonado com padrão espectral bidirecional no interior da dilatação.",
        impressao: "Aneurisma fusiforme da aorta abdominal no segmento infra-renal."
      },
      {
        rotulo: "Aneurisma de aorta infra-renal (simples)",
        requerInput: true,
        campos: ["medidaX", "medidaY"],
        descricao: "Aorta Abdominal: observa-se dilatação fusiforme no seu segmento infra-renal, com calibre máximo medindo cm e extensão longitudinal aproximada de cm.",
        impressao: "Aneurisma fusiforme da aorta abdominal no segmento infra-renal."
      }
    ]
  },
  {
    orgao: "Bexiga",
    itens: [
      {
        rotulo: "Débris em suspensão",
        descricao: "Bexiga: repleta, de contornos regulares e paredes finas, apresentando conteúdo anecoide com débris e finos ecos em suspensão no seu interior.",
        impressao: "Conteúdo vesical com débris em suspensão, podendo corresponder a processo inflamatório/infeccioso (ex: cistite/cristalúria). Convém correlação com dados clínico-laboratoriais."
      },
      {
        rotulo: "Bexiga de esforço",
        descricao: "Bexiga: parcialmente repleta, com espessamento parietal difuso e discreta irregularidade do trabeculado mucoso.",
        impressao: "Espessamento parietal vesical difuso, podendo corresponder a bexiga de esforço."
      },
      {
        rotulo: "Ureterocele",
        requerInput: true,
        campos: ["lado", "medidaX"],
        descricao: "Bexiga: repleta, notando-se formação cística de paredes finas projetando-se para o interior do lúmen vesical na junção ureterovesical , medindo cm.",
        impressao: "Imagem sugestiva de ureterocele."
      }
    ]
  },
  {
    orgao: "Cavidade / Achados adicionais",
    itens: [
      {
        rotulo: "Adenite mesentérica",
        requerInput: true,
        campos: ["medidaX"],
        descricao: "Cavidade Abdominal: ao estudo complementar com sonda linear na região das fossas ilíacas e periumbilical, evidenciam-se linfonodos mesentéricos levemente aumentados, com centro hilares preservados, medindo até cm, sem alterações significativas da gordura adjacente.",
        impressao: "Linfonodos intraperitoneais levemente aumentados, sugestivos de adenite mesentérica."
      },
      {
        rotulo: "Obs: Limitação por gás (pâncreas/aorta)",
        descricao: "Observação: Limitação técnica à avaliação do pâncreas, da aorta e do retroperitônio por interposição gasosa intestinal.",
        impressao: ""
      },
      {
        rotulo: "Líquido livre (Cavidade e Retroperitônio)",
        descricao: "Cavidade Abdominal: presença de líquido livre na cavidade peritoneal e no retroperitônio.",
        impressao: "Líquido livre intraperitoneal e retroperitoneal."
      },
      {
        rotulo: "Ascite / Líquido livre intraperitoneal",
        descricao: "Cavidade Abdominal: presença de líquido livre anecoide e homogêneo intraperitoneal em pequeno/moderado/acentuado volume.",
        impressao: "Ascite / líquido livre intraperitoneal."
      },
      {
        rotulo: "Líquido livre pélvico fisiológico",
        descricao: "Cavidade Abdominal: pequena quantidade de líquido livre na cavidade pélvica, de aspecto fisiológico.",
        impressao: ""
      },
      {
        rotulo: "Derrame pleural pequeno à direita",
        descricao: "Cavidade Abdominal: identificada pequena lâmina de derrame pleural no espaço costo-frênico posterior à direita.",
        impressao: "Pequeno derrame pleural à direita."
      },
      {
        rotulo: "Hérnia umbilical",
        requerInput: true,
        campos: ["medidaX", "medidaY"],
        descricao: "Parede Abdominal: presença de hérnia umbilical com saco herniário medindo cm e colo medindo cm, contendo gordura pré-peritoneal não redutível às manobras de compressão, sem sinais de sofrimento agudo.",
        impressao: "Hérnia umbilical, conforme descrito."
      }
    ]
  }
];
