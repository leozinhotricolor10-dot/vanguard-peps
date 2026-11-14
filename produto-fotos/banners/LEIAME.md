# Banners informativos dos produtos

Gera um banner vertical (igual ao modelo do Ipamorelin) para qualquer produto.

## Jeito principal: banner em HTML (recomendado)

O banner é uma página HTML (`modelo_banner.html`) preenchida com os textos do produto e fotografada pelo
Chrome em PNG. Funciona **mesmo com o ComfyUI fechado**: o fundo neon com DNA é desenhado pelo próprio HTML.
Se existir arte do ComfyUI para aquele produto (pasta `arte\`), ela entra automaticamente no fundo e nos cards.

1. Copie `dados\tsm5.json` para `dados\<produto>.json` e troque os textos (veja o passo 3 da seção abaixo).
2. Abra o **Prompt de Comando** na pasta `produto-fotos\banners` e rode:

   ```
   python banner_html.py dados/tsm5.json
   ```

   (troque `tsm5` pelo nome do seu arquivo)
3. O banner sai em `saida\<produto>_banner_html.png` (2048x3072) e `saida\<produto>_banner_html.webp` (1024x1536).
   A página usada fica em `saida\<produto>_banner.html` (dá para abrir no navegador).

| Quero... | Comando |
|---|---|
| Só o fundo neon, sem a arte da IA | `python banner_html.py dados/tsm5.json --sem-arte` |
| Criar arte nova no ComfyUI e já usar (ComfyUI aberto) | `python banner_html.py dados/tsm5.json --gerar-arte` |
| Outra variação de arte | `python banner_html.py dados/tsm5.json --seed 123` |

O programa confere sozinho se todo texto coube, se nada ficou por cima de outra coisa, se as fontes e as fotos
carregaram. Se aparecer `ATENCAO - revise antes de usar`, encurte o texto indicado.

### Versão enxuta para celular (stories 1080x1920)

Uma imagem só, letra grande, pouco texto: nome, 4 benefícios, dosagem em 3 linhas e o aviso curto.

```
python banner_html.py dados/tsm5.json --enxuto
```

Sai em `saida\<produto>_enxuto.png` e `saida\<produto>_enxuto.webp` (1080x1920). `--sem-arte` também funciona aqui.

Os textos curtos ficam no bloco `"enxuto"` do JSON (`beneficios`, `dosagem`, `aviso`). Se o bloco não existir,
o programa usa os 4 primeiros benefícios e as 3 primeiras linhas de dosagem do banner completo.
Nesta versão a letra **não diminui**: se o programa disser `nao coube (encurte o texto)`, encurte a frase no JSON.
Ele também avisa se alguma letra ficar menor que o mínimo para celular ou cair perto das bordas do stories.

---

## Jeito alternativo: `banner.py` (desenho por código, exige arte do ComfyUI)

**Como funciona:** o ComfyUI (no seu PC) cria só a **arte**: fundo neon, DNA, as pessoas e as 4 fotos dos cards.
Todo o **texto**, as caixas, os ícones, a logo e a **foto real do frasco** são colocados pelo programa `banner.py`.
Por isso o texto sai sempre exatamente como você escreveu, com acento e sem erro.

## Gerar o banner de outro produto (passo a passo)

1. **Abra o ComfyUI** (programa Comfy Desktop) e espere ele terminar de carregar.
2. Na pasta `produto-fotos\banners\dados\`, **copie** o arquivo `tsm5.json` e dê o nome do novo produto,
   por exemplo `rt15.json`.
3. Abra o arquivo novo no Bloco de Notas e **troque os textos** que estão entre aspas:
   - `"sku"` e `"foto"`: o código e a foto do frasco (as fotos ficam em `assets\produtos\`, ex.: `rt15-v2.webp`).
   - `"titulo"`, `"subtitulo"`, `"descricao"`, `"mecanismo"`, `"dosagem"`, `"beneficios"`, `"aplicacoes"`, `"stacks"`.
   - `"arte"` de cada aplicação e `"arte_fundo"`: descrição **em inglês** da imagem que a IA deve criar. Não escreva textos para aparecer na imagem.
   - Mantenha as aspas, vírgulas e colchetes no lugar. Se der erro, compare com o `tsm5.json`.
4. Abra o **Prompt de Comando** dentro da pasta `produto-fotos\banners` e rode:

   ```
   python banner.py dados/rt15.json
   ```

5. Pronto. O banner aparece em `produto-fotos\banners\saida\rt15_banner.png` (grande, 2048x3072)
   e `rt15_banner.webp` (leve, 1024x1536, para site e redes). Leva cerca de 1 minuto.

## Outras opções

| Quero... | Comando |
|---|---|
| Outra versão da arte (fotos diferentes) | `python banner.py dados/rt15.json --seed 123` (qualquer número) |
| Só corrigir um texto, sem gerar arte nova | edite o JSON e rode `python banner.py dados/rt15.json` de novo (a arte já salva é reaproveitada, leva 5 segundos) |
| Gerar arte nova com a mesma semente | `python banner.py dados/rt15.json --nova-arte` |

Quando gostar de uma arte, anote o número usado em `--seed` no campo `"seed"` do JSON para poder repetir depois.

## Avisos do programa

No final o programa confere sozinho se **todo texto coube** na sua caixa, se nada ficou **por cima** de outra coisa
e se não há **letra faltando** na fonte. Se aparecer `ATENCAO - revise antes de usar`, ele diz qual caixa deu problema.
Normalmente basta encurtar aquele texto.

Mesmo assim, **olhe o banner antes de publicar**: o programa garante a grafia, mas não confere se a informação está certa.

## Ícones disponíveis

Use no campo `"icone"`: `alvo`, `pulso`, `calendario`, `relogio`, `lua`, `raio`, `coracao`, `escudo`, `folha`,
`brilho`, `lampada`, `grafico`, `termometro`, `historico`, `molecula`, `cubo`, `prancheta`, `documento`,
`capelo`, `pessoas`, `engrenagem`, `check`, `aviso`.

## Arquivos desta pasta

- `banner_html.py` + `modelo_banner.html`: o banner em HTML (jeito principal).
- `banner.py`: a versão desenhada por código e o cliente do ComfyUI usado pelos dois.
- `assets\logo_v.png`: o símbolo V recortado da logo oficial.
- `dados\*.json`: os textos de cada produto.
- `workflow_arte_api.json`: o workflow do ComfyUI que o programa usa (com marcadores `{{...}}` trocados pelos dados).
- `workflow_arte_ui.json`: o mesmo workflow, já preenchido com o Tesamorelin, para abrir na tela do ComfyUI
  (arraste o arquivo para a janela). Também está salvo na biblioteca do ComfyUI como `vanguard_banner_arte.json`.
- `arte\`: as artes geradas pela IA (fundo e cards).
- `saida\`: os banners prontos.

Precisa de: Comfy Desktop com o modelo **Z-Image Turbo** (já instalado), Python com Pillow e numpy (já instalados),
fontes Montserrat e Barlow Condensed (já instaladas) e Windows 11 (ícones da fonte Segoe Fluent Icons).
