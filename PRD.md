# PRD — Vanguard Peptides
**Versão atual:** v2.51ce39a
**Última atualização:** Março 2026
**Stack:** React 18 SPA (esbuild build pipeline) · Supabase JS v2 · localStorage · GitHub Actions CI/CD

---

## 1. Visão Geral

Vanguard Peptides é uma plataforma de e-commerce para venda de peptídeos e compostos de pesquisa. O sistema é composto por uma SPA (Single Page Application) em `index.html` que serve tanto a interface do cliente quanto o painel administrativo completo.

**Público-alvo:**
- **Clientes:** compradores de peptídeos via WhatsApp
- **Admin (operador):** gestão de pedidos, estoque, produtos, envios e financeiro

**Integrações externas:**
| Serviço | Uso |
|---------|-----|
| Supabase | Banco de dados, RLS, Edge Functions, real-time |
| Melhor Envios | Etiquetas e rastreamento |
| DominiPay | Geração de cobrança PIX |
| Mercado Pago | Cartão parcelado 2x |
| AwesomeAPI | Câmbio USD-BRL em tempo real |
| ViaCEP | Auto-preenchimento de endereço por CEP |
| WhatsApp (wa.me) | Envio de pedidos e notificações |

---

## 2. Arquitetura de Dados

### localStorage
| Chave | Conteúdo |
|-------|----------|
| `vg-products` | Catálogo de produtos |
| `vg-stock` | Quantidades em estoque |
| `vg-orders` | Pedidos (cache local) |
| `vg-imports` | Histórico de importações |
| `vg-preorders` | Reservas de pré-order |
| `vg-notices` | Avisos do sistema |
| `vg-coupons` | Cupons de desconto |
| `vg-customers` | Base de clientes (pontos) |
| `vg-articles` | Artigos/blog |
| `vg-points-config` | Config do sistema de pontos |
| `vg-expenses` | Despesas manuais registradas |
| `vg-shipping-costs` | Custos de frete ME por pedido (auto-preenchido) |
| `vg-me-settings` | Endereço remetente (Melhor Envios) |
| `vg-nome` | Nome do cliente (sessão) |

### Supabase (tabelas)
| Tabela | Campos principais |
|--------|-------------------|
| `orders` | id, code, buyerName, status, _total, _cpf, _address, _phone, _email, me_order_id, tracking_code, label_url |
| `products` | id, name, sku, category, price, cost_per_vial |
| `stock` | product_id, quantity |
| `preorders` | product_id, token, name, whatsapp, qty, status, expires_at |
| `customers` | cpf (PK), name, phone, email, points, total_spent |

### Supabase Edge Functions
| Função | Descrição |
|--------|-----------|
| `melhorenvios-proxy` | Proxy autenticado para API do Melhor Envios (sem JWT obrigatório) |
| `verify-admin` | Verificação server-side da senha admin via SHA-256 (hash nunca exposto no código) |

---

## 3. Painel Administrativo

O admin é acessado por senha diretamente na SPA. Possui **10 abas**:

---

### 3.1 Pedidos

**Tabela de pedidos com:**
- Código VG-XXXXXX (6 chars alfanuméricos sem ambíguos)
- Nome do comprador, data, status, total, forma de pagamento, itens

**Ciclo de status:**
```
pendente → pago → enviado → entregue
```
Clicar no badge de status avança para o próximo.

**Notificações automáticas via WhatsApp:**
- `pago` → "✅ Seu pagamento foi confirmado"
- `enviado` → "📦 Seu pedido foi enviado!"
- `entregue` → "🎉 Seu pedido foi entregue!"

**Ações por pedido:**
- **💳 PIX** — abre modal PIX para pedidos pendentes
- **🏷️ Etiqueta** — gera etiqueta via Melhor Envios para pedidos pagos
- **🗑️** — remove pedido

---

### 3.2 Estoque

- Grid de produtos com quantidade atual (Supabase real-time)
- Indicadores visuais: 🟢 ok / 🟠 baixo / 🔴 zerado
- Controles: +/- botões e input manual
- Decremento automático quando item é adicionado ao carrinho
- Incremento automático ao cancelar pedido ou pré-order

---

### 3.3 Produtos

- Cadastro e edição de produtos
- Campos: nome, SKU, preço (R$), descrição, categoria
- Integração com aba Importação para auto-criação de produtos do catálogo ADINA (148 produtos)
- `cost_per_vial` salvo no Supabase

---

### 3.4 Artigos

- Editor de artigos educativos sobre peptídeos
- Campos: título, subtítulo, emoji, tag, corpo (HTML), produto relacionado
- Artigos padrão restauráveis

---

### 3.5 Pré-Orders

- Reservas de produtos fora de estoque
- Status: `pending → notified → completed → cancelled`
- Notificação automática por WhatsApp quando estoque chega
- Expiração automática em 180 dias
- Visualização de demanda por produto
- Portal do cliente (acesso por token)

---

### 3.6 Avisos

- Criar avisos/alertas exibidos no topo da loja para todos os clientes
- Tipos: warning, info
- Dismissíveis pelo cliente

---

### 3.7 Financeiro

- Dashboard com totais por status (pendente / pago / enviado / entregue)
- Receita consolidada por status
- Projeção de pré-orders
- Histórico de importações com cálculos de custo

**Painel de Despesas (P&L):**
- Registro manual de despesas com categorias (frete, taxas, operacional, outros)
- Auto-registro de custos de envio Melhor Envios ao gerar etiqueta
- Auto-cálculo de taxas Mercado Pago por tipo de pagamento (PIX 0%, Cartão 4,98%, 2x ~9,7%)
- Resumo: receita confirmada vs. despesas registradas vs. lucro estimado
- Persistência em `vg-expenses` e `vg-shipping-costs` (localStorage)

---

### 3.8 Importação

- Câmbio USD-BRL via AwesomeAPI (auto-fetch)
- Campos: data, câmbio, frete USD, taxa FedEx (R$), desconto %, outros custos (R$), total invoice real
- Linhas de item: SKU, nome, spec, caixas, preço USD, sugestão de preço editável, preço de venda
- Lookup automático no ADINA_CATALOG (148 produtos)

**Custo por vial detalhado (4 componentes visíveis):**
```
custoUsdBrl = (precoUsd / 10) × câmbio          (produto)
freteAloc   = (freteUsd × câmbio × share) / vials
fedexAloc   = (fedexBrl × share) / vials
outrosAloc  = (outrosBrl × share) / vials
custoVial   = custoUsdBrl + freteAloc + fedexAloc + outrosAloc
```

**Reconciliação:** compara custo calculado vs. total real da invoice (diff colorido)

**Cotação ao vivo por produto:**
- Preço de venda inputável por item
- Exibe: margem bruta (R$), markup (%), margem (%), status (Excelente/Bom/Regular/Baixo)
- Simulador: quantos vials precisa vender para quitar o lote

**Histórico:**
- Edição de importações salvas
- Badge de margem média por importação
- `cost_per_vial` salvo no Supabase (`products.cost_per_vial`)

---

### 3.9 Cupons

- Criação e gestão de códigos de desconto
- Campos: código, tipo (% ou R$ fixo), valor, pedido mínimo, validade, ativo/inativo
- Pausar/retomar cupons sem excluir
- Validação no checkout: código, ativo, mínimo, validade

---

### 3.10 Clientes

- Base de clientes do Supabase (`customers`)
- Campos: CPF, nome, telefone, e-mail, saldo de pontos, total gasto
- Ajuste manual de pontos por cliente
- Configuração do sistema de pontos:
  - Taxa de conversão (padrão: 1 pt por R$ gasto)
  - Valor de resgate (padrão: R$ 5 por 100 pts)
- Sync com Supabase

---

## 4. Modal PIX (Admin)

**Fluxo para pedidos com status `pendente`:**

1. Admin clica em **💳 PIX**
2. Modal exibe: código do pedido, nome, telefone, CPF, total
3. Admin acessa DominiPay → gera cobrança → copia código PIX
4. Cola o código no campo do modal
5. Dois botões independentes:
   - **📲 ENVIAR MENSAGEM** — abre WhatsApp com mensagem de texto (valor, pedido, aviso de 10 min de expiração)
   - **📋 COPIAR CÓDIGO** — copia apenas o código PIX para colar como segunda mensagem

**Mensagem enviada:**
```
✅ Olá, [Nome]! Segue o PIX para pagamento do seu pedido Vanguard Peptides.

📋 Pedido: VG-XXXXXX
💰 Valor: R$ X.XXX,XX

Vou te mandar o código PIX agora, é só copiar e colar no seu banco!
⚠️ O código expira em 10 minutos!
Vanguard Peptides 🧬
```

---

## 5. Etiqueta Melhor Envios (Admin)

**Disponível para pedidos com status `pago`.**

### Fluxo completo:

```
[🏷️ Etiqueta] → Buscar serviços → Selecionar serviço → Confirmar → Gerar
```

**Passo 1 — Busca de serviços (automático):**
- Chama `/me/shipment/calculate` via Edge Function
- Parâmetros usados: CEP origem/destino, dimensões, peso, valor declarado
- Exibe todos os serviços disponíveis com: logo da transportadora, nome, preço, prazo em dias úteis

**Passo 2 — Seleção:**
- Admin escolhe o serviço desejado na lista

**Passo 3 — Confirmação (campos editáveis):**

| Seção | Campo | Default |
|-------|-------|---------|
| 📄 Declaração de conteúdo | Nome do conteúdo | Peptídeo |
| | Quantidade | 1 |
| | Valor declarado (R$) | Total do pedido |
| 📦 Embalagem | Peso (kg) | 0,3 |
| | Comprimento (cm) | 12 |
| | Largura (cm) | 6 |
| | Altura (cm) | 5 |
| 📮 Remetente | Todos os campos | Salvo no localStorage |

O card **📮 Remetente** é expansível inline — edite e salve sem sair da tela.

**Passo 4 — Geração:**
- `POST /me/cart` → cria envio
- `POST /me/shipment/checkout` → debita saldo ME
- `POST /me/shipment/generate` → gera etiqueta
- `POST /me/shipment/print` → obtém URL do PDF
- Salva no Supabase: `me_order_id`, `tracking_code`, `label_url`

**Resultado:** botão 🖨️ IMPRIMIR ETIQUETA + código de rastreio

---

## 6. Loja (Cliente)

### Abas do cliente:
| Aba | Descrição |
|-----|-----------|
| HOME | Catálogo de produtos |
| 💊 CALC | Calculadora de dose para seringas |
| 🛒 CARRINHO | Carrinho de compras |
| 📦 PEDIDO | Rastreamento de pedidos |
| FAQ | Dúvidas frequentes |

---

### 6.1 Catálogo

- Grid de produtos com filtro por categoria
- Categorias: Emagrecedores, Beleza, Corpo, Longevidade, Neuro, Libido, Insumos
- Busca por nome e tags (fuzzy, tempo real)
- Badges: 🔥 hot, ⭐ destaque, ESGOTADO
- Promoções com preço original riscado
- Bundles com desconto
- Botão "Reservar" para produtos sem estoque (abre pré-order)

---

### 6.2 Calculadora de Dose

- Seleciona peptídeo do catálogo
- Define tamanho da seringa (1/2/3mL)
- Input de dose com unidade adaptativa (mg ou mcg conforme escala do peptídeo)
- Visualização gráfica da seringa
- Exibe mg e mcg simultaneamente

---

### 6.3 Carrinho

- Lista de itens com controles de quantidade
- Resumo: subtotal, frete, desconto PIX, cupom, pontos, **total**
- Botão "Finalizar compra" → abre modal de checkout

---

### 6.4 Rastreamento de Pedidos

- Busca por: código VG-XXXXXX, CPF ou WhatsApp
- Modal com detalhes completos do pedido
- Exibe: status, itens, endereço, forma de pagamento, código de rastreio ME, link da etiqueta

---

## 7. Checkout (Cliente)

### Fluxo:
```
Dados pessoais → Endereço → Pagamento → Cupom → Pontos → Resumo → Enviar WhatsApp
```

### Campos:

**Dados pessoais:**
- Nome completo (obrigatório)
- CPF (obrigatório, 11 dígitos — também aciona lookup de pontos)
- Telefone / WhatsApp (obrigatório)
- E-mail (opcional)

**Endereço:**
- CEP → auto-preenchimento via ViaCEP (UF, cidade, bairro, rua)
- Número, complemento

**Pagamento:**
| Opção | Desconto/Taxa | Observação |
|-------|--------------|------------|
| PIX | -10% | 💚 RECOMENDADO |
| Cartão 2x | +4,98% + 4,59% (compostos) | Via Mercado Pago |

**Cupom:**
- Input de código → validação → desconto aplicado no resumo

**Vanguard Points:**
- Lookup automático por CPF
- Botões rápidos: 100 / 200 / 500 pts / usar tudo
- Conversão: 100 pts → R$ (configurável pelo admin)

**Frete:**
- Calculado por UF
- Grátis para estados selecionados, R$ 60 para outros

**Envio:**
- Salva pedido no Supabase (`orders`)
- Gera código VG-XXXXXX único
- Envia mensagem formatada para WhatsApp do cliente com todos os detalhes
- Resgata pontos se aplicado
- Limpa formulário após sucesso

---

## 8. Vanguard Points (Fidelidade)

### Regras:
- **Ganho:** `pts = floor(total_pedido × taxa)` — creditados quando status → `pago`
- **Resgate:** 100 pts = R$ X (configurável, padrão R$ 5)
- **Mínimo para resgate:** 100 pts
- CPF é o identificador único do cliente

### Admin:
- Aba Clientes: visualiza todos os clientes com saldo
- Ajuste manual de pontos (+ ou -)
- Configuração de taxa e valor de resgate

### Cliente:
- Informa CPF no checkout → saldo exibido automaticamente
- Aplica desconto antes de finalizar

---

## 9. Sistema de Taxas (Mercado Pago)

| Cenário | Taxa |
|---------|------|
| Recebimento imediato | 4,98% |
| Parcelamento 2x | 4,59% (sobre o total já com taxa anterior) |
| PIX | 0% (desconto de 10% ao cliente) |

Cálculo exibido no checkout:
```
total_com_taxas = total × 1.0498 × 1.0459
```

---

## 10. Catálogo ADINA

- 148 produtos fixos (constante `ADINA_CATALOG`)
- Mapeamento: SKU → { name, spec, priceUsd }
- Usado no lookup de importação e pré-preenchimento de sugestão de preço
- Produtos principais: Semaglutide, Tirzepatide, Retatrutide, BPC-157, TB-500, GHK-Cu, PT-141, Selank, Epithalon, e outros

---

## 11. Notificações WhatsApp (Automáticas)

| Evento | Mensagem enviada |
|--------|-----------------|
| Pedido criado | Resumo completo do pedido |
| Status → pago | Confirmação de pagamento |
| Status → enviado | Pedido enviado + rastreio |
| Status → entregue | Pedido entregue |
| Pré-order disponível | Produto em estoque, link para compra |
| PIX gerado | Mensagem + código PIX (2 mensagens separadas) |

---

## 12. Build Pipeline & Deploy

### Fluxo automático:
```
git push main → GitHub Action → npm ci → esbuild → dist/ → gh-pages → GitHub Pages
```

### O que o build faz:
- Extrai JSX do `<script type="text/babel">` e compila com esbuild (minificado, ES2020)
- Remove Babel standalone (~500KB economia)
- Troca CDN Supabase: unpkg → jsDelivr `.min.js` (mais rápido e cacheado)
- Adiciona `defer crossorigin` em React, ReactDOM e Supabase — elimina bloqueio de render
- Injeta preconnect + dns-prefetch hints no `<head>`
- Injeta loading screen CSS pura (aparece antes do JS carregar)
- Salva em `dist/index.html` + copia `CNAME`

### Segurança:
- `ADMIN_PASS_HASH` nunca aparece no código — verificado server-side via Edge Function `verify-admin`
- `MELHORENVIOS_TOKEN` guardado como secret no Supabase
- Senha admin: SHA-256 da senha salvo como env secret no Supabase dashboard

---

## 13. Roadmap / Pendências

- [ ] Saldo na carteira Melhor Envios (necessário para gerar etiquetas)
- [ ] Integração de nota fiscal ou DANFe (quando aplicável)
- [ ] App mobile / PWA

---

## 14. Versões

| Versão | Commit | Descrição |
|--------|--------|-----------|
| v2.51ce39a | `51ce39a` | fix: loading bar travada em 85% — poll fallback + timeout de segurança |
| v2.8405a64 | `8405a64` | feat: barra de progresso real no loading screen (marcos de carregamento) |
| v2.e71cd4b | `e71cd4b` | perf: defer nos CDN scripts (React/ReactDOM/Supabase), Supabase .min.js |
| v2.9a6bc4f | `9a6bc4f` | Mapa 3 zonas: RMSP motoboy (origem SBC), SP interior, outros estados |
| v2.e49b0da | `e49b0da` | Previsão de demanda de pré-orders na aba Mapa |
| v2.5ffc33a | `5ffc33a` | Mapa de calor — pedidos por estado, zonas motoboy SP vs Correios |
| v2.6a854a7 | `6a854a7` | Segurança: senha admin verificada via Edge Function server-side |
| v2.db55e5 | `db55e5c` | Build pipeline esbuild + GitHub Actions CI/CD |
| v2.5ecc36a | `5ecc36a` | Painel de despesas P&L no financeiro |
| v2.7d6148e | `7d6148e` | Importação: edição, breakdown de custo, reconciliação, cotação ao vivo |
| v2.c92df65 | `c92df65` | Sistema de notificações admin (sino) |
| v2.e557a29 | `e557a29` | Editor inline de remetente na confirmação de etiqueta |
| v2.a4e1f69 | `a4e1f69` | Campos editáveis de declaração e embalagem |
| v2.1d3c82c | `1d3c82c` | Declaração de conteúdo editável |
| v2.82f3c32 | `82f3c32` | Modal de seleção de serviço ME |
| v2.a17fb9e | `a17fb9e` | Aviso de 10 min de expiração no PIX |
| v2.c665bf3 | `c665bf3` | Dois botões separados no modal PIX |
| v2.40e6565 | `40e6565` | Modal PIX com envio por WhatsApp |
| v2.de2343c | `de2343c` | Sistema Vanguard Points completo |
| v2.17d4867 | `17d4867` | Taxas MP compostas (4,98% + 4,59%) |
