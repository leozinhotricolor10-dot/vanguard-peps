// ── CALCULATOR DATA ────────────────────────────────────────────────────────────
const CALC_PEP_DB = {
  tirzepatide:{ name:'Tirzepatida',  tags:['Injetável','GLP-1/GIP'] },
  retatrutide:{ name:'Retatrutida',  tags:['Injetável','GLP-1'] },
  ghkcu:      { name:'GHK-Cu',       tags:['Injetável','Tópico','Pele'] },
  snap8:      { name:'SNAP-8',       tags:['Tópico','Creme/Sérum'] },
  tesamorelin:{ name:'Tesamorelin',  tags:['Injetável','GHRH'] },
  epithalon:  { name:'Epithalon',    tags:['Injetável','Longevidade'] },
  pt141:      { name:'PT-141',       tags:['Injetável','Libido'] },
  selank:     { name:'Selank',       tags:['Nasal','Ansiolítico'] },
  bpc157:     { name:'BPC-157',      tags:['Injetável','Reparo'] },
  tb500:      { name:'TB-500',       tags:['Injetável','Sistêmico'] },
  semaglutide:{ name:'Semaglutida',  tags:['Injetável','GLP-1'] },
  ipamorelin: { name:'Ipamorelin',   tags:['Injetável','GH'] },
  cjc1295:    { name:'CJC-1295',     tags:['Injetável','GHRH'] },
  semax:      { name:'Semax',        tags:['Nasal','Cognitivo'] },
  aod9604:    { name:'AOD-9604',     tags:['Injetável','Lipólise'] },
  motsc:      { name:'MOTS-c',       tags:['Injetável','Mitocondrial'] },
  humanin:    { name:'Humanin',      tags:['Injetável','Longevidade'] },
  foxo4dri:   { name:'FOXO4-DRI',    tags:['Injetável','Senolítico'] },
  thymosinA1: { name:'Timosina α1',  tags:['Injetável','Imunidade'] },
  mt2:        { name:'Melanotan II', tags:['Injetável','Melanocortina'] },
};

const CALC_DOSES = {
  bpc157:     { doses:[200,300,500,1000], freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2},{l:'3x/dia',t:3}], dfi:1, vials:[2,5,10,60], unit:'mcg' },
  tb500:      { doses:[2000,5000],        freqs:[{l:'2x/sem',t:0.29},{l:'1x/sem',t:0.14},{l:'Quinzenal',t:0.07}], dfi:0, vials:[2,5,10,60], unit:'mcg' },
  ghkcu:      { doses:[1000,2000],        freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:0, vials:[5,10,50,60], unit:'mcg' },
  snap8:      { topical:true, conc:'3–8%', veh:'creme/sérum' },
  semaglutide:{ doses:[250,500,1000,2400],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[1,2.4], unit:'mcg' },
  tirzepatide:{ doses:[2500,5000,10000,15000],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[2.5,5,10,15], unit:'mcg' },
  tesamorelin:{ doses:[1000,2000],        freqs:[{l:'1x/dia',t:1}], dfi:0, vials:[2,5], unit:'mcg' },
  retatrutide:{ doses:[2000,4000,8000,12000],freqs:[{l:'1x/sem',t:0.14}], dfi:0, vials:[2,5,12], unit:'mcg' },
  ipamorelin: { doses:[100,200,300],      freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2},{l:'3x/dia',t:3}], dfi:1, vials:[2,5], unit:'mcg' },
  cjc1295:    { doses:[100,200,300],      freqs:[{l:'3x/dia',t:3},{l:'2x/dia',t:2},{l:'1x/sem (DAC)',t:0.14}], dfi:0, vials:[2,5], unit:'mcg' },
  epithalon:  { doses:[5000,10000],       freqs:[{l:'1x/dia (ciclo)',t:1},{l:'2x/dia (ciclo)',t:2}], dfi:0, vials:[10,20,60], unit:'mcg' },
  pt141:      { doses:[1000,2000],        freqs:[{l:'Pontual (uso)',t:1},{l:'2x/sem',t:0.29}], dfi:0, vials:[2,10], unit:'mcg' },
  selank:     { doses:[250,500,1000],     freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:1, vials:[5,10,60], unit:'mcg', nasal:true },
  semax:      { doses:[200,300,600],      freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:1, vials:[2,5], unit:'mcg', nasal:true },
  aod9604:    { doses:[300,500],          freqs:[{l:'1x/dia',t:1},{l:'2x/dia',t:2}], dfi:0, vials:[2,5], unit:'mcg' },
  motsc:      { doses:[5000,10000],       freqs:[{l:'1x/sem',t:0.14},{l:'2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
  humanin:    { doses:[2000,5000,10000],  freqs:[{l:'1x/sem',t:0.14},{l:'2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
  foxo4dri:   { doses:[1000,3000,5000],   freqs:[{l:'3x/sem (ciclo)',t:0.43}], dfi:0, vials:[5,10,60], unit:'mcg' },
  thymosinA1: { doses:[1600,3200],        freqs:[{l:'2x/sem',t:0.29},{l:'3x/sem',t:0.43}], dfi:0, vials:[5], unit:'mcg' },
  mt2:        { doses:[250,500,1000],     freqs:[{l:'Carregamento diário',t:1},{l:'Manutenção 2x/sem',t:0.29}], dfi:0, vials:[5,10,60], unit:'mcg' },
};


const PROTOCOLS = {
  tirzepatide: {
    doseMin: '2,5 mg', doseMax: '15 mg',
    freq: '1x por semana', ciclo: '12–24 semanas',
    inicio: 'Começar em 2,5 mg/sem por 4 semanas antes de aumentar',
    nota: 'Titular a dose a cada 4 semanas conforme tolerância. Injeção subcutânea no abdômen, coxa ou braço. Manter hidratação e proteína ≥1,2g/kg.'
  },
  retatrutide: {
    doseMin: '2 mg', doseMax: '12 mg',
    freq: '1x por semana', ciclo: '16–24 semanas',
    inicio: 'Começar com 2 mg/sem e titular mensalmente',
    nota: 'Agonista triplo GLP-1/GIP/glucagon. Potente efeito lipolítico. Monitorar náusea nas primeiras semanas. Injeção subcutânea.'
  },
  ghkcu: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: '1–2x por dia', ciclo: '4–8 semanas',
    inicio: 'Começar com 1 mg/dia e avaliar resposta',
    nota: 'Injeção subcutânea próxima à área alvo (cicatrizes, articulações). Uso tópico em paralelo amplifica os resultados.'
  },
  snap8: {
    doseMin: '3%', doseMax: '8%',
    freq: '1–2x por dia', ciclo: 'Uso contínuo',
    inicio: 'Aplicar em creme/sérum 1x/dia nas primeiras 2 semanas',
    nota: 'Análogo do Argireline. Uso exclusivamente tópico. Aplicar na área de expressão facial. Evitar contato com os olhos.'
  },
  tesamorelin: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: '1x por dia', ciclo: '12–26 semanas',
    inicio: 'Dose padrão de 2 mg/dia para gordura visceral',
    nota: 'GHRH aprovado pela FDA para lipodistrofia. Injeção subcutânea no abdômen. Melhor resultado quando injetado em jejum ou pré-sono.'
  },
  epithalon: {
    doseMin: '5 mg', doseMax: '10 mg',
    freq: '1–2x por dia (em ciclo)', ciclo: '10–20 dias, 2x/ano',
    inicio: 'Ciclo de 10 dias: 10 mg/dia divididos em 2 doses',
    nota: 'Peptídeo pineal e telomerase. Injeção subcutânea ou IV. Ciclos curtos com intervalo de meses são mais eficazes. Avaliar após 2 ciclos.'
  },
  pt141: {
    doseMin: '1 mg', doseMax: '2 mg',
    freq: 'Conforme necessidade (uso pontual)', ciclo: 'Não contínuo',
    inicio: 'Dose inicial de 1 mg, 45–60 min antes da atividade',
    nota: 'Agonista de melanocortina (MC3R/MC4R). Injeção subcutânea. Efeito esperado em 30–90 min. Pode causar rubor facial e náusea leve nas primeiras doses.'
  },
  selank: {
    doseMin: '250 mcg', doseMax: '1 mg',
    freq: '1–2x por dia', ciclo: '2–4 semanas',
    inicio: 'Começar com 250 mcg/dia, intranasalmente',
    nota: 'Ansiolítico/nootrópico. Uso intranasal (spray). Efeito percebido rapidamente. Ciclos curtos com pausas de 1–2 semanas são recomendados.'
  },
  bpc157: {
    doseMin: '200 mcg', doseMax: '1 mg',
    freq: '1–2x por dia', ciclo: '4–12 semanas',
    inicio: 'Injetar preferencialmente próximo à área lesionada',
    nota: 'Peptídeo de reparo tecidual. Injeção subcutânea ou intramuscular. Sistêmico ou local. Resultados visíveis a partir de 2–4 semanas.'
  },
  tb500: {
    doseMin: '2 mg', doseMax: '5 mg',
    freq: '2x por semana (fase carga), 1x/sem manutenção', ciclo: '4–6 semanas carga + manutenção',
    inicio: 'Fase de carga: 2,5 mg, 2x/sem por 4–6 semanas',
    nota: 'Fração da Timosina-β4. Ação sistêmica anti-inflamatória e de reparo. Injeção SC ou IM. Excelente para lesões musculares e articulares crônicas.'
  },
  semaglutide: {
    doseMin: '0,25 mg', doseMax: '2,4 mg',
    freq: '1x por semana', ciclo: '16–52 semanas',
    inicio: 'Começar com 0,25 mg/sem por 4 semanas, titular a cada mês',
    nota: 'GLP-1 de longa ação. Injeção subcutânea 1x/semana. Titular gradualmente para minimizar efeitos GI. Manter proteína elevada na dieta.'
  },
  ipamorelin: {
    doseMin: '100 mcg', doseMax: '300 mcg',
    freq: '1–3x por dia', ciclo: '8–16 semanas',
    inicio: 'Melhor utilizado em jejum ou pré-sono (200 mcg)',
    nota: 'Secretagogo de GH seletivo. Injeção subcutânea. Combinação clássica com CJC-1295 potencializa o pulso de GH. Não causa pico de cortisol ou prolactina.'
  },
  cjc1295: {
    doseMin: '100 mcg', doseMax: '300 mcg',
    freq: '1–3x por dia (sem DAC) / 1x/sem (com DAC)', ciclo: '8–16 semanas',
    inicio: 'Sem DAC: 100–200 mcg pré-sono. Com DAC: 2 mg/sem',
    nota: 'GHRH de longa ação. Injeção subcutânea. Combinação com Ipamorelin é a mais popular. Com DAC, meia-vida estendida para ~8 dias.'
  },
  semax: {
    doseMin: '200 mcg', doseMax: '600 mcg',
    freq: '1–2x por dia', ciclo: '2–4 semanas',
    inicio: 'Começar com 200 mcg/dia intranasal, avaliar resposta cognitiva',
    nota: 'Análogo do ACTH(4-7). Uso intranasal. Efeito nootrópico e neuroprotetor. Ciclos de 2 semanas com pausa de 1 semana são bem tolerados.'
  },
  aod9604: {
    doseMin: '300 mcg', doseMax: '500 mcg',
    freq: '1–2x por dia', ciclo: '12–16 semanas',
    inicio: 'Injetar em jejum, preferencialmente próximo à área de gordura alvo',
    nota: 'Fragmento do HGH com efeito lipolítico. Injeção subcutânea. Eficaz combinado com dieta calórica controlada. Sem efeitos sobre IGF-1.'
  },
  motsc: {
    doseMin: '5 mg', doseMax: '10 mg',
    freq: '1–2x por semana', ciclo: '8–12 semanas',
    inicio: 'Começar com 5 mg/sem e ajustar conforme resposta metabólica',
    nota: 'Peptídeo mitocondrial. Injeção subcutânea ou IV. Melhora sensibilidade à insulina e metabolismo energético. Melhor associado com exercício.'
  },
  humanin: {
    doseMin: '2 mg', doseMax: '10 mg',
    freq: '1–2x por semana', ciclo: '8–12 semanas',
    inicio: 'Dose de 2 mg/sem como início, titular conforme tolerância',
    nota: 'Peptídeo mitocondrial com ação neuroprotetora e anti-apoptótica. Injeção subcutânea. Resultados metabólicos e cognitivos observados a partir de 4–6 semanas.'
  },
  foxo4dri: {
    doseMin: '1 mg', doseMax: '5 mg',
    freq: '3x por semana (durante ciclo)', ciclo: '3–4 semanas, intervalos longos',
    inicio: 'Protocolo de Klein: 1 mg/dia por 3 dias consecutivos/semana',
    nota: 'Peptídeo senolítico — elimina células senescentes. Ciclos curtos com pausas de meses. Injeção subcutânea ou IV. Uso ainda experimental em humanos.'
  },
  thymosinA1: {
    doseMin: '1,6 mg', doseMax: '3,2 mg',
    freq: '2–3x por semana', ciclo: '4–12 semanas',
    inicio: 'Dose padrão de 1,6 mg, 2x/semana por 4 semanas',
    nota: 'Imunomodulador derivado do timo. Injeção subcutânea. Utilizado em terapias de imunodeficiência. Aumentar para 3,2 mg em protocolos de fortalecimento imune.'
  },
  mt2: {
    doseMin: '250 mcg', doseMax: '1 mg',
    freq: 'Diário (carga) / 2x/sem (manutenção)', ciclo: 'Carga: 2–4 semanas / Manutenção: indefinido',
    inicio: 'Carga: 0,25–0,5 mg/dia até atingir bronzeado desejado',
    nota: 'Agonista de melanocortina. Injeção subcutânea. Requer exposição solar para ativar pigmentação. Pode causar náusea e ereção espontânea no início do uso.'
  },
};

// Guia educativo por produto — exibido em accordion na página do produto
const PRODUCT_GUIDES = {
  ghkcu: [
    {
      title: '💧 Reconstituição (como preparar)',
      body: `Para vial de 50 mg:
• 5 ml de água bacteriostática → 10 mg/ml → 1 mg a cada 10 u na seringa de insulina
• 10 ml → 5 mg/ml → 500 mcg a cada 10 u
• 20 ml → 2,5 mg/ml → 250 mcg a cada 10 u
• 25 ml → 2 mg/ml → 100 mcg a cada 5 u

Para vial de 100 mg:
• 10 ml → 10 mg/ml → 1 mg a cada 10 u
• 20 ml → 5 mg/ml → 500 mcg a cada 10 u
• 25 ml → 4 mg/ml → 200 mcg a cada 5 u

Use seringa de insulina U-100. Gire suavemente o vial — não agite. Armazene refrigerado (2–8 °C) após reconstituído.`
    },
    {
      title: '📋 Protocolos de Uso',
      body: `Dose baixa diária (100–500 mcg SC)
Indicações: rejuvenescimento da pele, crescimento capilar leve, cicatrização de feridas, manutenção anti-idade.
• Iniciantes: 100–200 mcg/dia
• Intermediário: 300 mcg/dia
• Avançado: até 500 mcg/dia
Aplicar subcutâneo próximo à área alvo (face, couro cabeludo, cicatrizes).

Dose intermitente (1–2 mg SC, 2–3x/semana)
Indicações: anti-idade sistêmica, crescimento capilar mais agressivo, reparo de lesões, pós-cirúrgico.
• 1 mg por aplicação, 2–3x/semana, OU
• 2 mg por aplicação, 2x/semana (teto por injeção)

Uso tópico em paralelo potencializa resultados na pele e no cabelo.`
    },
    {
      title: '🔄 Ciclo Recomendado',
      body: `Protocolo padrão: 8 semanas ON / 8 semanas OFF
• Ciclos mais longos que 8 semanas podem reduzir a resposta
• Janela OFF permite reset dos receptores e evita acúmulo
• Reavaliar resultados ao final de cada ciclo antes de repetir

Combinações comuns:
• GHK-Cu + BPC-157 → reparo tecidual + regeneração
• GHK-Cu + Tesamorelin → anti-idade sistêmica
• GHK-Cu tópico + injetável → máximo efeito na pele/cabelo`
    },
    {
      title: '⚠️ Segurança e Doses Máximas',
      body: `Limites importantes:
• Teto diário: ≤ 1 mg/dia (dose baixa contínua)
• Teto por injeção: ≤ 2 mg (nunca injetar mais de 2 mg de uma vez)
• Não combinar dose diária alta + intermitente no mesmo dia

Efeitos colaterais possíveis:
• Irritação, vermelhidão ou coceira no local da injeção
• Gosto metálico na boca logo após aplicar (passageiro)
• Queda transitória de pressão em doses altas

Contraindicações:
• Alergia a cobre
• Doença de Wilson (acúmulo de cobre)
• Gravidez e amamentação

⚠️ Conteúdo educativo. Não substitui orientação médica. Research use only.`
    }
  ]
};

const ALERTS = {
  tirzepatide: {
    exames: ['Glicemia em jejum / HbA1c', 'Perfil lipídico', 'Função renal (creatinina)', 'Peso e IMC mensal'],
    contraindicacoes: ['Histórico de pancreatite', 'Carcinoma medular da tireoide (pessoal ou familiar)', 'Síndrome MEN2', 'Gravidez ou amamentação'],
    alertas: ['Náusea e vômito nas primeiras semanas — titular lentamente', 'Risco de hipoglicemia se combinado com insulina', 'Monitorar frequência cardíaca (taquicardia relatada)'],
  },
  retatrutide: {
    exames: ['Glicemia / HbA1c', 'Lipase e amilase (pancreatite)', 'TSH e T4 livre', 'Peso e circunferência abdominal'],
    contraindicacoes: ['Pancreatite ativa ou histórico', 'Carcinoma de tireoide', 'Gravidez', 'Insuficiência renal grave'],
    alertas: ['Efeito mais potente que semaglutida — titular com cuidado', 'Pode causar perda de massa magra — manter treino e proteína alta', 'Monitorar sintomas GI: diarreia, constipação'],
  },
  ghkcu: {
    exames: ['Nenhum exame específico obrigatório', 'Hemograma para uso prolongado', 'Cobre sérico (uso > 12 semanas)'],
    contraindicacoes: ['Câncer ativo (estimula crescimento celular)', 'Gravidez', 'Hipersensibilidade ao cobre'],
    alertas: ['Excesso de cobre pode causar toxicidade — ciclar o uso', 'Não usar em lesões com infecção ativa', 'Evitar dose excessiva para não inibir os próprios efeitos'],
  },
  snap8: {
    exames: ['Nenhum exame específico'],
    contraindicacoes: ['Hipersensibilidade a peptídeos', 'Pele com feridas abertas ou infeccionada', 'Uso próximo aos olhos'],
    alertas: ['Uso exclusivamente tópico — nunca injetável', 'Testar em pequena área antes do uso amplo', 'Evitar combinar com ácidos muito concentrados'],
  },
  tesamorelin: {
    exames: ['IGF-1 basal e durante uso', 'Glicemia e insulina de jejum', 'Cortisol (interferência no eixo)', 'Exame de lipodistrofia por imagem se disponível'],
    contraindicacoes: ['Câncer ativo ou histórico recente', 'Gravidez', 'Hipotireoidismo não tratado', 'Retinopatia diabética'],
    alertas: ['Pode elevar glicemia — monitorar em diabéticos', 'Pode aumentar IGF-1 — não usar se elevado', 'Evitar injeção em pele irritada ou com lipohipertrofia'],
  },
  epithalon: {
    exames: ['Nenhum exame essencial para ciclos curtos', 'Hemograma completo antes de ciclos longos', 'Painel hormonal (GH/IGF-1) se uso frequente'],
    contraindicacoes: ['Câncer ativo (estimula telomerase)', 'Doenças autoimunes graves', 'Gravidez'],
    alertas: ['Ciclos muito frequentes podem ser contraprodutivos', 'Uso IV deve ser feito com assepsia rigorosa', 'Dados em humanos ainda limitados — uso experimental'],
  },
  pt141: {
    exames: ['Pressão arterial (pode elevar PA)', 'Avaliação cardiovascular prévia'],
    contraindicacoes: ['Hipertensão não controlada', 'Doenças cardiovasculares graves', 'Uso concomitante de nitratos', 'Gravidez'],
    alertas: ['Pode causar rubor, náusea e cefaleias nas primeiras doses', 'Não combinar com inibidores de PDE5 (Viagra, Cialis)', 'Evitar dose excessiva — priapismo relatado em homens'],
  },
  selank: {
    exames: ['Nenhum exame específico para ciclos curtos', 'Avaliação psiquiátrica em uso prolongado'],
    contraindicacoes: ['Gravidez e amamentação', 'Epilepsia não controlada', 'Uso concomitante de benzodiazepínicos em dose alta'],
    alertas: ['Não interromper abruptamente após uso prolongado', 'Pode potencializar sedativos — cuidado com álcool', 'Dados de longo prazo limitados em humanos'],
  },
  bpc157: {
    exames: ['Nenhum exame obrigatório para ciclos curtos', 'Hemograma e função hepática para uso > 12 semanas'],
    contraindicacoes: ['Câncer ativo (potencial de estimular crescimento vascular)', 'Gravidez', 'Cirurgias recentes em áreas com tumor'],
    alertas: ['Evitar em histórico de câncer recente', 'Pode acelerar cicatrização em excessso — monitorar feridas', 'Manter refrigerado após reconstituição (usar em até 30 dias)'],
  },
  tb500: {
    exames: ['Nenhum exame essencial para ciclos padrão', 'Hemograma em uso prolongado', 'Marcadores inflamatórios (PCR, VHS)'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Trombocitose (excesso de plaquetas)'],
    alertas: ['Pode mascarar inflamação — não usar em infecções ativas', 'Conservar refrigerado e protegido da luz', 'Evitar injeção intravascular acidental'],
  },
  semaglutide: {
    exames: ['Glicemia em jejum / HbA1c', 'Perfil lipídico', 'Função renal e hepática', 'Lipase e amilase'],
    contraindicacoes: ['Carcinoma medular da tireoide', 'Síndrome MEN2', 'Pancreatite ativa', 'Gravidez'],
    alertas: ['Titular obrigatoriamente — nunca iniciar na dose máxima', 'Pode causar desaceleração do esvaziamento gástrico', 'Monitorar perda de massa magra — proteína e treino são essenciais'],
  },
  ipamorelin: {
    exames: ['IGF-1 basal e periódico', 'Glicemia em jejum', 'Cortisol (menor impacto, mas avaliar)'],
    contraindicacoes: ['Câncer ativo (GH estimula crescimento)', 'Retinopatia diabética', 'Hipotireoidismo não tratado', 'Gravidez'],
    alertas: ['Não usar pós-refeição — insulina reduz eficácia', 'Verificar IGF-1 se > 3 meses de uso', 'Combinar com CJC-1295 aumenta potência — reduzir dose individual'],
  },
  cjc1295: {
    exames: ['IGF-1', 'Glicemia', 'GH basal (se disponível)', 'Cortisol matinal'],
    contraindicacoes: ['Câncer ativo', 'Acromegalia ou histórico', 'Gravidez', 'Diabetes tipo 1 descontrolado'],
    alertas: ['Com DAC: meia-vida longa, monitorar supersupressão', 'Evitar dose noturna excessiva — pode causar sonhos vívidos', 'IGF-1 acima do normal: pausar e reavaliar'],
  },
  semax: {
    exames: ['Nenhum exame obrigatório para ciclos curtos', 'Avaliação neurológica/psiquiátrica prévia se histórico de transtornos'],
    contraindicacoes: ['Epilepsia não controlada', 'Esquizofrenia ou psicose', 'Gravidez', 'Hipertensão grave'],
    alertas: ['Pode causar ansiedade em doses altas', 'Efeitos cognitivos variam individualmente', 'Dados de longo prazo limitados — usar em ciclos'],
  },
  aod9604: {
    exames: ['Glicemia e insulina em jejum', 'Perfil lipídico basal', 'Peso e composição corporal'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Hipersensibilidade a análogos do GH'],
    alertas: ['Eficácia reduzida sem déficit calórico', 'Não eleva IGF-1 — seguro nesse aspecto', 'Resultados mais lentos que GH — expectativa realista'],
  },
  motsc: {
    exames: ['Glicemia / HbA1c', 'Perfil lipídico', 'Função mitocondrial indireta (lactato, piruvato)'],
    contraindicacoes: ['Gravidez', 'Doenças mitocondriais hereditárias graves', 'Câncer ativo (metabolismo energético)'],
    alertas: ['Substância muito nova — dados humanos limitados', 'Potencial interação com metformina', 'Exercício físico potencializa os efeitos'],
  },
  humanin: {
    exames: ['Glicemia e insulina', 'Marcadores inflamatórios (IL-6, TNF-α)', 'Cognição basal (se uso nootrópico)'],
    contraindicacoes: ['Câncer ativo', 'Gravidez', 'Insuficiência hepática grave'],
    alertas: ['Evidências ainda majoritariamente in vitro e animal', 'Conservar a -20°C antes da reconstituição', 'Uso experimental — acompanhamento médico altamente recomendado'],
  },
  foxo4dri: {
    exames: ['Hemograma completo', 'Função hepática e renal', 'Marcadores de senescência se disponíveis (p21, p16)'],
    contraindicacoes: ['Câncer ativo (senólise pode liberar citocinas inflamatórias)', 'Doenças autoimunes ativas', 'Gravidez', 'Pós-operatório recente'],
    alertas: ['Pode causar fadiga intensa nas primeiras doses (senescence burst)', 'Nunca iniciar ciclo sem check-up médico completo', 'Intervalos longos entre ciclos são obrigatórios'],
  },
  thymosinA1: {
    exames: ['Hemograma com diferencial', 'Imunoglobulinas (IgG, IgM, IgA)', 'Subpopulações linfocitárias (CD4/CD8)', 'PCR e VHS'],
    contraindicacoes: ['Transplantados em imunossupressão (risco de rejeição)', 'Doenças autoimunes ativas graves', 'Gravidez'],
    alertas: ['Monitorar resposta imune em imunodeficientes — pode ser vigorosa', 'Não usar concomitante com quimioterapia sem orientação médica', 'Reações no local da injeção são comuns'],
  },
  mt2: {
    exames: ['Dermatoscopia pré-uso (avaliar nevos existentes)', 'Pressão arterial', 'Avaliação urológica em homens (função erétil)'],
    contraindicacoes: ['Histórico de melanoma ou nevos atípicos', 'Hipertensão não controlada', 'Doenças cardiovasculares', 'Gravidez'],
    alertas: ['Risco de escurecimento/mudança de nevos — acompanhar dermatologicamente', 'Pode causar ereções prolongadas — reduzir dose', 'Proteger nevos com protetor solar durante o uso'],
  },
};


const DEFAULT_ARTICLES = [
  {
    id: 'art-ghkcu',
    emoji: '✨',
    tag: 'Beleza & Pele',
    title: 'GHK-Cu: o peptídeo do cobre que rejuvenesce a pele',
    subtitle: 'Descubra como o GHK-Cu age na síntese de colágeno, reparo celular e reversão dos sinais do envelhecimento.',
    date: '18 Fev 2025',
    relatedProductId: 'ghkcu',
    body: `<h3>O que é o GHK-Cu?</h3>
<p>O GHK-Cu (Glicil-L-Histidil-L-Lisina Cobre) é um peptídeo tripleto naturalmente presente no plasma humano, saliva e urina. Descoberto em 1973 pelo Dr. Loren Pickart, ele é responsável por sinalizar ao organismo que é hora de regenerar e renovar tecidos.</p>
<h3>Como funciona no organismo</h3>
<p>O GHK-Cu age em múltiplas frentes:</p>
<ul>
<li><strong>Síntese de colágeno</strong> — estimula fibroblastos a produzirem colágeno I, III e IV, aumentando firmeza e elasticidade.</li>
<li><strong>Atividade antioxidante</strong> — neutraliza radicais livres e reduz inflamação crônica de baixo grau.</li>
<li><strong>Reparo de DNA</strong> — ativa genes de reparo celular, com efeitos observados em mais de 4.000 genes humanos.</li>
<li><strong>Angiogênese</strong> — estimula formação de novos vasos sanguíneos, melhorando nutrição e oxigenação da pele.</li>
</ul>
<h3>Resultados esperados em pesquisa</h3>
<p>Estudos in vitro e in vivo demonstram redução de rugas finas, melhora na densidade da pele, cicatrização acelerada e crescimento capilar. Efeitos observados tipicamente entre 4–8 semanas de uso consistente.</p>
<h3>Como é administrado</h3>
<p>Via subcutânea ou intradérmica, frequência de 1–2x/semana. A reconstituição deve ser feita com água bacteriostática e o produto mantido refrigerado após aberto.</p>`
  },
  {
    id: 'art-tirz',
    emoji: '⚡',
    tag: 'Emagrecedores',
    title: 'Tirzepatida: a revolução dual GIP/GLP-1 no controle de peso',
    subtitle: 'Entenda o mecanismo de ação do agonista duplo que está redefinindo os estudos de obesidade e metabolismo.',
    date: '15 Fev 2025',
    relatedProductId: 'tirzepatida',
    body: `<h3>O que é a Tirzepatida?</h3>
<p>A Tirzepatida é um peptídeo agonista dual dos receptores GIP (peptídeo insulinotrópico dependente de glicose) e GLP-1 (peptídeo semelhante ao glucagon tipo 1). Essa dupla ação a diferencia de moléculas anteriores, com resultados superiores em estudos de controle de peso.</p>
<h3>Mecanismo de ação</h3>
<p>A ação simultânea em dois receptores cria um efeito sinérgico:</p>
<ul>
<li><strong>GLP-1</strong> — retarda o esvaziamento gástrico, reduz apetite e melhora sensibilidade à insulina.</li>
<li><strong>GIP</strong> — potencializa a secreção de insulina e pode reduzir efeitos adversos gastrointestinais do GLP-1 isolado.</li>
</ul>
<h3>Protocolo em estudos</h3>
<p>Administração subcutânea semanal, iniciando em doses baixas (2,5 mg/semana) com titulação gradual a cada 4 semanas para minimizar efeitos adversos como náuseas e vômitos.</p>
<h3>Perfil de segurança</h3>
<p>Os principais efeitos observados em pesquisa são gastrointestinais: náusea, diarreia e vômito, geralmente transitórios e correlacionados ao período de titulação. A titulação lenta é fundamental para adaptação.</p>`
  },
  {
    id: 'art-bpc',
    emoji: '🔧',
    tag: 'Recuperação',
    title: 'BPC-157: o peptídeo da cura que acelera a recuperação tecidual',
    subtitle: 'Do intestino aos tendões: como o BPC-157 age nos diferentes tecidos e por que é um dos peptídeos mais estudados em regeneração.',
    date: '10 Fev 2025',
    relatedProductId: 'glow',
    body: `<h3>O que é o BPC-157?</h3>
<p>O BPC-157 (Body Protection Compound 157) é um pentadecapeptídeo derivado de uma proteína de proteção gástrica. Composto por 15 aminoácidos, demonstra estabilidade excepcional e amplo espectro de ação em modelos de pesquisa.</p>
<h3>Mecanismos de regeneração</h3>
<p>O BPC-157 atua por múltiplas vias:</p>
<ul>
<li><strong>Angiogênese acelerada</strong> — estimula formação de novos vasos, essencial para o reparo de tendões e ligamentos, tecidos de vascularização naturalmente baixa.</li>
<li><strong>Upregulation do receptor EGR-1</strong> — amplifica expressão de fatores de crescimento locais.</li>
<li><strong>Proteção gastrointestinal</strong> — cicatrização de úlceras, modulação do eixo intestino-cérebro.</li>
<li><strong>Ação anti-inflamatória</strong> — redução de marcadores inflamatórios sem imunossupressão.</li>
</ul>
<h3>Aplicações mais estudadas</h3>
<p>As áreas com maior volume de pesquisa incluem: lesões de tendões e ligamentos, úlceras gástricas, lesões musculares, reparo ósseo e neuroproteção.</p>
<h3>Vias de administração</h3>
<p>Subcutânea (próximo ao local da lesão quando possível) ou oral para efeitos gastrointestinais. Ciclos típicos de 4–8 semanas com dose diária ou a cada dois dias.</p>`
  }
];

