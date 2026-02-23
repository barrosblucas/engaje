# PRD: Engaje — Portal Digital Municipal de Eventos

## Introdução

O **Engaje** é um portal digital municipal para divulgação de eventos, inscrições e programas públicos da cidade de **Bandeirantes/MS**. Faz parte do projeto **Connect Bandeirantes**, iniciativa de digitalização e transformação dos serviços públicos municipais.

O problema central: cidadãos dependem de canais fragmentados (redes sociais, rádio, boca a boca) para descobrir eventos municipais e se inscrever neles. Gestores não têm visibilidade sobre a demanda real (quantas inscrições, quem se inscreveu) e perdem tempo com processos manuais (planilhas, listas em papel).

O Engaje resolve isso oferecendo um catálogo público de eventos indexável por buscadores, com inscrição online simplificada para cidadãos e um painel administrativo para gestores municipais.

**Entrega faseada:**
- **Fase 1:** Catálogo de eventos + inscrições + painel admin (criar/editar eventos, listar inscritos, exportar CSV)
- **Fase 2:** Programas governamentais com formulários dinâmicos (form builder) + dashboard de métricas + notificações por e-mail

Este PRD cobre **ambas as fases**, com user stories marcadas por fase.

---

## Objetivos

- Permitir que cidadãos descubram, busquem e se inscrevam em eventos municipais em menos de 3 minutos, mesmo sem conta prévia.
- Fornecer aos gestores municipais uma ferramenta simples para criar, publicar e gerenciar eventos e inscrições.
- Garantir que eventos sejam indexáveis pelo Google (SEO otimizado).
- Funcionar perfeitamente em celulares de baixo desempenho com conexão 3G (mobile-first, LCP < 2.5s).
- Atender critérios de acessibilidade WCAG 2.1 AA.
- Na Fase 2, permitir criação de programas governamentais com formulários customizáveis e envio de notificações via SMTP da prefeitura.

---

## User Stories

### FASE 1 — Eventos + Inscrições

---

#### US-001: Criar schema do banco de dados (eventos, inscrições, usuários)
**Descrição:** Como desenvolvedor, preciso definir o schema do banco de dados para armazenar eventos, inscrições, cidadãos e gestores.

**Acceptance Criteria:**
- [ ] Tabela `users` com campos: id, name, email, cpf (unique), phone, password_hash, role (citizen | admin | super_admin), google_id (nullable), created_at, updated_at
- [ ] Tabela `events` com campos: id, title, slug (unique), description, category (enum: festa, esporte, civico, saude, cultura, educacao), start_date, end_date, location_name, location_address, location_lat (nullable), location_lng (nullable), banner_url, banner_alt_text, total_slots (nullable = ilimitado), status (enum: draft, published, closed, cancelled), created_by (FK users), created_at, updated_at
- [ ] Tabela `event_images` com campos: id, event_id (FK), image_url, alt_text, display_order
- [ ] Tabela `registrations` com campos: id, event_id (FK), user_id (FK), protocol_number (unique), status (enum: confirmed, cancelled), created_at, cancelled_at (nullable)
- [ ] Índices em: events.slug, events.status+start_date, events.category, registrations.event_id+user_id (unique), registrations.protocol_number, users.cpf, users.email
- [ ] Migration gerada e aplicada com sucesso
- [ ] Typecheck passa

---

#### US-002: Cadastro de cidadão (CPF/e-mail + senha)
**Descrição:** Como cidadão, quero criar uma conta com meu CPF, e-mail e senha para poder me inscrever em eventos.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/auth/register` aceita: name, cpf, email, phone, password
- [ ] CPF validado (dígitos verificadores) e armazenado sem formatação
- [ ] E-mail validado com formato correto
- [ ] Senha mínimo 6 caracteres, armazenada com hash bcrypt
- [ ] Retorna erro 409 se CPF ou e-mail já existem
- [ ] Após registro, cria sessão (cookie httpOnly) automaticamente
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração para registro com sucesso, CPF duplicado, e-mail duplicado, CPF inválido
- [ ] Typecheck passa

---

#### US-003: Login de cidadão (CPF/e-mail + senha)
**Descrição:** Como cidadão com conta, quero fazer login para acessar meu histórico de inscrições.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/auth/login` aceita: identifier (CPF ou e-mail), password
- [ ] Retorna sessão via cookie httpOnly em caso de sucesso
- [ ] Retorna erro 401 com mensagem genérica ("Credenciais inválidas") se user não existe ou senha errada
- [ ] Endpoint `POST /v1/auth/logout` encerra sessão
- [ ] Endpoint `GET /v1/auth/me` retorna dados do usuário logado (sem password_hash)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração para login com CPF, login com e-mail, senha errada, logout
- [ ] Typecheck passa

---

#### US-004: Login de cidadão via Google OAuth
**Descrição:** Como cidadão, quero fazer login com minha conta Google para não precisar lembrar de mais uma senha.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/auth/google` redireciona para tela de consentimento do Google
- [ ] Endpoint `GET /v1/auth/google/callback` processa o retorno do Google
- [ ] Se e-mail do Google já está cadastrado, vincula google_id e faz login
- [ ] Se e-mail não existe, cria conta com dados do Google (name, email, google_id) — CPF/phone ficam pendentes para completar depois
- [ ] Sessão criada via cookie httpOnly
- [ ] Testes de integração (mock do Google OAuth)
- [ ] Typecheck passa

---

#### US-005: Login de gestor municipal (admin)
**Descrição:** Como gestor municipal, quero fazer login no painel administrativo com minhas credenciais institucionais.

**Acceptance Criteria:**
- [ ] Mesmo endpoint `POST /v1/auth/login` funciona para admins
- [ ] Usuários com role `admin` ou `super_admin` acessam rotas `/v1/admin/*`
- [ ] AuthGuard valida sessão + role em todas as rotas admin
- [ ] Conta de admin criada apenas por super_admin via `POST /v1/admin/users` (name, email, password, role)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração: login admin, acesso negado para cidadão em rota admin
- [ ] Typecheck passa

---

#### US-006: Seed de super-admin inicial
**Descrição:** Como desenvolvedor, preciso de um comando para criar o primeiro super_admin no banco, para bootstrap do sistema.

**Acceptance Criteria:**
- [ ] Script/seed que cria super_admin a partir de variáveis de ambiente (SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD)
- [ ] Não cria duplicata se já existir
- [ ] Documentado no README
- [ ] Typecheck passa

---

#### US-007: API pública — Listar eventos publicados
**Descrição:** Como visitante (sem login), quero ver a lista de eventos publicados para descobrir o que está acontecendo na cidade.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/public/events` retorna eventos com status `published` e start_date >= hoje (ou eventos em andamento)
- [ ] Suporta paginação: query params `page` (default 1) e `limit` (default 12, max 50)
- [ ] Suporta filtros: `category`, `startDate`, `endDate`, `search` (busca em title e description)
- [ ] Suporta ordenação: `sort` = `date_asc` | `date_desc` (default `date_asc`)
- [ ] Resposta inclui: id, title, slug, category, start_date, end_date, location_name, banner_url, banner_alt_text, available_slots (calculado: total_slots - inscrições confirmadas, ou null se ilimitado)
- [ ] Sem autenticação, rate limit por IP
- [ ] Headers de cache adequados
- [ ] Contrato Zod (PublicEventsRequestSchema, PublicEventsResponseSchema) em `packages/contracts`
- [ ] Testes de integração: listagem, filtro por categoria, busca textual, paginação
- [ ] Typecheck passa

---

#### US-008: API pública — Detalhe de um evento
**Descrição:** Como visitante, quero ver todos os detalhes de um evento específico.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/public/events/:slug` retorna evento completo
- [ ] Resposta inclui: todos os campos do evento + array de images (image_url, alt_text, display_order) + available_slots
- [ ] Retorna 404 se slug não existe ou evento não está publicado
- [ ] Sem autenticação, rate limit por IP
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-009: Página inicial pública (frontend)
**Descrição:** Como visitante, quero ver uma página inicial atraente com eventos em destaque, eventos próximos e categorias.

**Acceptance Criteria:**
- [ ] Seção hero com banner do Connect Bandeirantes e campo de busca
- [ ] Seção "Eventos em destaque" — até 4 eventos publicados mais próximos (cards com banner, título, data, local, categoria)
- [ ] Seção "Próximos eventos" — listagem paginada dos demais eventos
- [ ] Seção de categorias com ícones clicáveis (festa, esporte, cívico, saúde, cultura, educação)
- [ ] Página renderizada em SSR/SSG para SEO (rota pública)
- [ ] Mobile-first: layout funcional em telas 320px+
- [ ] LCP < 2.5s (imagens otimizadas, lazy loading abaixo do fold)
- [ ] Atende WCAG 2.1 AA (contraste, navegação por teclado, alt texts)
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-010: Página de listagem/busca de eventos (frontend)
**Descrição:** Como visitante, quero buscar e filtrar eventos para encontrar o que me interessa.

**Acceptance Criteria:**
- [ ] Campo de busca textual
- [ ] Filtros por categoria (checkboxes ou chips), data (calendário), localização
- [ ] Resultados em grid de cards responsivo
- [ ] Paginação
- [ ] Filtros refletidos na URL (query params) para permitir compartilhamento de busca
- [ ] SSR para SEO com hydration no client para interações de filtro
- [ ] Estado vazio: mensagem amigável quando nenhum evento encontrado
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-011: Página de detalhe do evento (frontend)
**Descrição:** Como visitante, quero ver todas as informações de um evento e decidir se quero me inscrever.

**Acceptance Criteria:**
- [ ] Exibe: banner (com alt text), título, categoria (badge), descrição completa (rich text), data/hora formatadas, local com link para Google Maps
- [ ] Galeria de fotos (se houver imagens adicionais)
- [ ] Indicador de vagas disponíveis (ou "Vagas ilimitadas")
- [ ] Botão "Inscrever-se" proeminente (redireciona para login se não autenticado)
- [ ] Botão desabilitado com label "Vagas esgotadas" quando applicable
- [ ] Botões de compartilhamento: WhatsApp, Facebook, copiar link
- [ ] Meta tags Open Graph e Twitter Card para compartilhamento rico
- [ ] SSR para SEO
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-012: Inscrição em evento (cidadão logado)
**Descrição:** Como cidadão logado, quero me inscrever em um evento com um clique.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/registrations` aceita: event_id
- [ ] Valida: evento publicado, vagas disponíveis, cidadão não já inscrito
- [ ] Gera protocol_number único (formato: EVT-YYYYMMDD-XXXXX)
- [ ] Retorna 409 se já inscrito, 422 se vagas esgotadas, 404 se evento inexistente
- [ ] Controle de concorrência para evitar overbooking (check atômico de vagas)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração: inscrição com sucesso, duplicada, vagas esgotadas, evento não publicado
- [ ] Typecheck passa

---

#### US-013: Inscrição rápida (cidadão sem conta)
**Descrição:** Como cidadão sem conta, quero me inscrever em um evento informando meus dados básicos, sem precisar criar uma conta separadamente.

**Acceptance Criteria:**
- [ ] No frontend, ao clicar "Inscrever-se" sem estar logado, exibe formulário: nome, CPF, telefone, e-mail, senha
- [ ] Ao submeter: cria conta + inscrição em uma única ação (backend: transação atômica)
- [ ] Se CPF/e-mail já existe, sugere fazer login
- [ ] Após conclusão, cidadão fica logado e vê confirmação
- [ ] Fluxo completo em menos de 3 minutos (requisito de usabilidade)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-014: Tela de confirmação de inscrição
**Descrição:** Como cidadão, após me inscrever, quero ver uma confirmação clara com meu número de protocolo.

**Acceptance Criteria:**
- [ ] Tela exibe: nome do evento, data/hora, local, número de protocolo, QR code contendo o protocolo
- [ ] QR code gerado no client (biblioteca JS)
- [ ] Botão "Salvar comprovante" (download como imagem/PDF simples)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-015: Histórico de inscrições do cidadão
**Descrição:** Como cidadão logado, quero ver meu histórico de inscrições.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/registrations` retorna inscrições do cidadão logado (paginado)
- [ ] Resposta inclui: event title, event date, protocol_number, status (confirmed/cancelled), created_at
- [ ] Ordenado por created_at desc
- [ ] Contrato Zod em `packages/contracts`
- [ ] Frontend: lista de cards com status visual (confirmado = verde, cancelado = cinza)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-016: Cancelamento de inscrição pelo cidadão
**Descrição:** Como cidadão logado, quero cancelar minha inscrição em um evento.

**Acceptance Criteria:**
- [ ] Endpoint `PATCH /v1/registrations/:id/cancel`
- [ ] Valida: inscrição pertence ao cidadão logado, status atual é `confirmed`, evento ainda não ocorreu
- [ ] Atualiza status para `cancelled` e preenche `cancelled_at`
- [ ] Vaga liberada (available_slots incrementa)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Frontend: botão "Cancelar inscrição" com diálogo de confirmação
- [ ] Testes de integração: cancelamento com sucesso, inscrição de outro usuário, evento passado
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-017: Painel admin — Criar evento
**Descrição:** Como gestor municipal, quero criar um novo evento com todos os detalhes necessários.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/admin/events` (AuthGuard + role admin/super_admin)
- [ ] Campos: title, category, description, start_date, end_date, location_name, location_address, location_lat, location_lng, total_slots, banner (upload de imagem), banner_alt_text, status (default: draft)
- [ ] Slug gerado automaticamente a partir do título (kebab-case + sufixo único se duplicado)
- [ ] Upload de banner com validação: formatos jpg/png/webp, max 2MB, redimensionamento automático para 1200x630
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração: criação com sucesso, sem autenticação, cidadão tenta criar
- [ ] Typecheck passa

---

#### US-018: Painel admin — Editar evento
**Descrição:** Como gestor municipal, quero editar um evento existente.

**Acceptance Criteria:**
- [ ] Endpoint `PATCH /v1/admin/events/:id` (AuthGuard + role admin/super_admin)
- [ ] Permite alterar todos os campos (exceto id, created_by, created_at)
- [ ] Se título mudar, slug pode ser regenerado (com redirect 301 do antigo se evento publicado)
- [ ] Validação: não pode reduzir total_slots abaixo do número de inscrições confirmadas
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-019: Painel admin — Alterar status do evento
**Descrição:** Como gestor municipal, quero alterar o status de um evento (publicar, encerrar, cancelar).

**Acceptance Criteria:**
- [ ] Endpoint `PATCH /v1/admin/events/:id/status` aceita: status (published, closed, cancelled)
- [ ] Transições válidas: draft → published, published → closed, published → cancelled, draft → cancelled
- [ ] Cancelamento de evento publicado marca todas as inscrições como `cancelled` (Fase 2: também envia e-mail)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração para cada transição válida e inválida
- [ ] Typecheck passa

---

#### US-020: Painel admin — Gerenciar imagens do evento
**Descrição:** Como gestor municipal, quero adicionar e remover fotos de um evento.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/admin/events/:id/images` — upload de imagem com alt_text obrigatório
- [ ] Endpoint `DELETE /v1/admin/events/:id/images/:imageId`
- [ ] Validação: formatos jpg/png/webp, max 2MB por imagem, máximo 10 imagens por evento
- [ ] Alt text obrigatório (WCAG compliance)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-021: Painel admin — Listar inscritos em evento
**Descrição:** Como gestor municipal, quero ver a lista de inscritos em um evento.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/admin/events/:id/registrations` (paginado)
- [ ] Resposta inclui: user name, cpf, email, phone, protocol_number, status, created_at
- [ ] Filtro por status (confirmed, cancelled)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-022: Painel admin — Exportar inscritos em CSV
**Descrição:** Como gestor municipal, quero exportar a lista de inscritos em um evento para compartilhar com a equipe.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/admin/events/:id/registrations/export?format=csv`
- [ ] Retorna arquivo CSV com headers: Nome, CPF, E-mail, Telefone, Protocolo, Status, Data de Inscrição
- [ ] CPF formatado (XXX.XXX.XXX-XX) no arquivo exportado
- [ ] Header `Content-Disposition: attachment; filename=inscritos-{slug}-{date}.csv`
- [ ] Suporta filtro por status
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-023: Painel admin — Listar eventos do gestor
**Descrição:** Como gestor municipal, quero ver todos os eventos que criei ou que posso gerenciar.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/admin/events` (paginado)
- [ ] Resposta inclui: id, title, category, status, start_date, total_slots, registered_count
- [ ] Filtros: status, category, search
- [ ] Ordenação por start_date ou created_at
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-024: Frontend admin — Telas de criação/edição de evento
**Descrição:** Como gestor municipal, quero um formulário intuitivo para criar e editar eventos.

**Acceptance Criteria:**
- [ ] Formulário com todos os campos do evento (título, categoria, descrição com editor rich text, datas, local, vagas, banner)
- [ ] Preview do banner ao fazer upload
- [ ] Validação client-side em tempo real (campos obrigatórios, formato de data, tamanho de imagem)
- [ ] Botão "Salvar rascunho" e "Publicar"
- [ ] Rota autenticada (SPA client-only, sem SSR)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-025: Frontend admin — Lista de eventos e inscritos
**Descrição:** Como gestor municipal, quero visualizar e gerenciar meus eventos e inscritos.

**Acceptance Criteria:**
- [ ] Tabela de eventos com: título, categoria (badge), status (badge colorido), data, vagas (usadas/total), ações (editar, publicar, encerrar, cancelar)
- [ ] Ao clicar em evento, exibe lista de inscritos com filtro e botão de exportar CSV
- [ ] Confirmação de ação destrutiva (cancelar evento) com diálogo
- [ ] Rota autenticada (SPA client-only)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-026: Páginas de login/registro do cidadão (frontend)
**Descrição:** Como cidadão, quero telas de login e registro simples e rápidas.

**Acceptance Criteria:**
- [ ] Página de login: campo identifier (CPF ou e-mail), senha, botão "Entrar", botão "Login com Google", link "Criar conta"
- [ ] Página de registro: nome, CPF (com máscara), telefone (com máscara), e-mail, senha, botão "Criar conta", botão "Login com Google"
- [ ] Validação client-side em tempo real
- [ ] Mensagens de erro claras e acessíveis
- [ ] Redirect para página anterior após login
- [ ] Rota pública com SSR mínimo
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

### FASE 2 — Programas Governamentais + Métricas + Notificações

---

#### US-027: Schema de programas governamentais e form builder
**Descrição:** Como desenvolvedor, preciso do schema para armazenar programas governamentais com formulários customizáveis.

**Acceptance Criteria:**
- [ ] Tabela `programs` com campos: id, title, slug, description, category, banner_url, banner_alt_text, start_date, end_date, total_slots, status, form_schema (JSONB — definição dos campos do formulário), created_by, created_at, updated_at
- [ ] Tabela `program_registrations` com campos: id, program_id (FK), user_id (FK), protocol_number, status, form_data (JSONB — respostas do formulário), created_at, cancelled_at
- [ ] Formato do form_schema: array de field definitions com: field_id, label, type (text, number, date, select, checkbox, textarea, file), required, options (para select), validation_rules
- [ ] Migration gerada e aplicada
- [ ] Typecheck passa

---

#### US-028: API admin — CRUD de programas governamentais
**Descrição:** Como gestor municipal, quero criar e gerenciar programas governamentais com formulários customizados.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/admin/programs` — cria programa com form_schema
- [ ] Endpoint `PATCH /v1/admin/programs/:id` — edita programa
- [ ] Endpoint `PATCH /v1/admin/programs/:id/status` — altera status
- [ ] Endpoint `GET /v1/admin/programs` — lista programas (paginado)
- [ ] Endpoint `GET /v1/admin/programs/:id/registrations` — lista inscritos (paginado)
- [ ] Endpoint `GET /v1/admin/programs/:id/registrations/export?format=csv` — exporta inscritos
- [ ] Validação do form_schema (tipos válidos, campo id único)
- [ ] Contratos Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-029: API pública — Listar/detalhar programas
**Descrição:** Como visitante, quero ver os programas governamentais disponíveis.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/public/programs` — lista programas publicados (paginado, com filtros)
- [ ] Endpoint `GET /v1/public/programs/:slug` — detalhe do programa com form_schema
- [ ] Sem autenticação, rate limit por IP
- [ ] Contratos Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-030: Inscrição em programa governamental
**Descrição:** Como cidadão, quero me inscrever em um programa preenchendo o formulário específico daquele programa.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/program-registrations` aceita: program_id, form_data (JSONB)
- [ ] form_data validado contra form_schema do programa (campos obrigatórios, tipos, opções válidas)
- [ ] Gera protocol_number único (formato: PRG-YYYYMMDD-XXXXX)
- [ ] Mesmas validações de evento: programa publicado, vagas disponíveis, não duplicado
- [ ] Contratos Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-031: Frontend admin — Form builder (drag-and-drop)
**Descrição:** Como gestor municipal, quero montar o formulário de inscrição de um programa arrastando e soltando campos.

**Acceptance Criteria:**
- [ ] Interface drag-and-drop com paleta de campos: texto curto, texto longo, número, data, seleção (dropdown), checkbox, upload de arquivo
- [ ] Cada campo configurável: label, placeholder, obrigatório (sim/não), opções (para select)
- [ ] Preview em tempo real do formulário montado
- [ ] Reordenação de campos via drag-and-drop
- [ ] Gera o form_schema (JSONB) salvo no backend
- [ ] Rota autenticada (SPA client-only)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-032: Frontend cidadão — Página de programa com formulário dinâmico
**Descrição:** Como cidadão, quero ver o formulário do programa e preenchê-lo para me inscrever.

**Acceptance Criteria:**
- [ ] Renderiza formulário dinamicamente a partir do form_schema
- [ ] Validação client-side conforme regras do schema
- [ ] Upload de arquivo (se campo do tipo file) com preview
- [ ] Confirmação com protocolo e QR code após inscrição
- [ ] SSR para página do programa, hydration para formulário
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-033: Dashboard de métricas (admin)
**Descrição:** Como gestor municipal, quero ver métricas gerais do portal para entender o impacto.

**Acceptance Criteria:**
- [ ] Endpoint `GET /v1/admin/dashboard` retorna: total_events, total_published_events, total_registrations, registrations_by_category, events_by_month (últimos 6 meses), top_events (5 com mais inscrições)
- [ ] Frontend: cards com números, gráfico de barras (eventos por categoria), gráfico de linha (inscrições por mês), tabela top 5 eventos
- [ ] Dados calculados no banco (queries agregadas), sem cache complexo (volume pequeno)
- [ ] Contrato Zod em `packages/contracts`
- [ ] Rota autenticada (SPA client-only)
- [ ] Mobile-first
- [ ] Typecheck passa
- [ ] Verificar no browser usando dev-browser skill

---

#### US-034: Envio de e-mail via SMTP da prefeitura
**Descrição:** Como desenvolvedor, preciso de um serviço de envio de e-mail configurável via SMTP.

**Acceptance Criteria:**
- [ ] Módulo de e-mail no backend com configuração via variáveis de ambiente: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
- [ ] Envio assíncrono (fila simples com BullMQ ou processamento em background)
- [ ] Templates de e-mail em HTML (inline CSS) para: confirmação de inscrição, cancelamento de inscrição, cancelamento de evento
- [ ] Retry automático (3 tentativas com backoff)
- [ ] Log estruturado de envios (sem dados sensíveis)
- [ ] Testes unitários com mock de SMTP
- [ ] Typecheck passa

---

#### US-035: Confirmação de inscrição por e-mail
**Descrição:** Como cidadão, quero receber um e-mail de confirmação ao me inscrever em um evento ou programa.

**Acceptance Criteria:**
- [ ] E-mail enviado automaticamente após inscrição confirmada
- [ ] Conteúdo: nome do evento/programa, data/hora, local, número de protocolo, QR code embutido
- [ ] Template responsivo (legível em Gmail, Outlook, celular)
- [ ] Testes de integração (verificar que job de envio é enfileirado)
- [ ] Typecheck passa

---

#### US-036: Notificação de cancelamento de evento por e-mail
**Descrição:** Como cidadão inscrito, quero ser notificado por e-mail se um evento for cancelado.

**Acceptance Criteria:**
- [ ] Ao cancelar evento (US-019), sistema enfileira e-mail para todos os inscritos com status `confirmed`
- [ ] Conteúdo: nome do evento, data original, mensagem de cancelamento
- [ ] Inscrições são marcadas como `cancelled` automaticamente (já coberto em US-019)
- [ ] Testes de integração
- [ ] Typecheck passa

---

#### US-037: Envio de lembrete por e-mail para inscritos
**Descrição:** Como gestor municipal, quero enviar um lembrete por e-mail para os inscritos em um evento.

**Acceptance Criteria:**
- [ ] Endpoint `POST /v1/admin/events/:id/notify` aceita: subject, message
- [ ] Envia e-mail para todos os inscritos com status `confirmed` no evento
- [ ] Rate limit: máximo 1 notificação por evento por dia
- [ ] Contrato Zod em `packages/contracts`
- [ ] Testes de integração
- [ ] Typecheck passa

---

## Requisitos Funcionais

### Autenticação e Autorização
- **FR-01:** O sistema deve permitir cadastro de cidadão com nome, CPF, telefone, e-mail e senha.
- **FR-02:** O sistema deve permitir login via CPF ou e-mail + senha.
- **FR-03:** O sistema deve permitir login via Google OAuth 2.0.
- **FR-04:** Sessões autenticadas devem usar cookies httpOnly com flag Secure e SameSite=Lax.
- **FR-05:** Contas de gestor (admin) devem ser criadas exclusivamente por um super_admin.
- **FR-06:** Rotas `/v1/admin/*` devem exigir autenticação + role admin ou super_admin.

### Eventos (público)
- **FR-07:** O sistema deve listar eventos publicados com paginação, filtros (categoria, data, busca textual) e ordenação.
- **FR-08:** O sistema deve exibir detalhe de evento por slug com todas as informações, imagens e vagas disponíveis.
- **FR-09:** Páginas públicas de eventos devem ser renderizadas com SSR para indexação Google.
- **FR-10:** Cada evento publicado deve ter meta tags Open Graph e Twitter Card.

### Inscrições
- **FR-11:** O sistema deve permitir inscrição de cidadão logado em evento publicado com vagas disponíveis.
- **FR-12:** O sistema deve gerar um número de protocolo único por inscrição (formato EVT-YYYYMMDD-XXXXX).
- **FR-13:** O sistema deve impedir inscrição duplicada (mesmo cidadão + mesmo evento).
- **FR-14:** O sistema deve impedir overbooking com controle atômico de vagas.
- **FR-15:** O sistema deve permitir cancelamento de inscrição pelo próprio cidadão, liberando a vaga.
- **FR-16:** O sistema deve permitir inscrição rápida (registro + inscrição em transação única) para visitantes sem conta.

### Painel Admin
- **FR-17:** O sistema deve permitir ao gestor criar eventos com: título, categoria, descrição, datas, local, vagas, banner com alt text.
- **FR-18:** O sistema deve gerar slug automaticamente a partir do título do evento.
- **FR-19:** O sistema deve permitir transições de status: rascunho → publicado, publicado → encerrado, publicado → cancelado.
- **FR-20:** O sistema deve permitir ao gestor visualizar e exportar (CSV) a lista de inscritos por evento.
- **FR-21:** O sistema deve permitir upload de imagens de evento com validação de formato (jpg/png/webp) e tamanho (max 2MB) e alt text obrigatório.

### Programas Governamentais (Fase 2)
- **FR-22:** O sistema deve permitir ao gestor criar programas com formulários customizáveis via form builder drag-and-drop.
- **FR-23:** O formulário deve suportar tipos: texto curto, texto longo, número, data, seleção, checkbox, upload de arquivo.
- **FR-24:** O sistema deve validar respostas do formulário contra o schema definido pelo gestor.
- **FR-25:** Inscrição em programa deve gerar protocolo único (formato PRG-YYYYMMDD-XXXXX).

### Notificações (Fase 2)
- **FR-26:** O sistema deve enviar e-mail de confirmação ao cidadão após inscrição (evento ou programa).
- **FR-27:** Ao cancelar evento publicado, o sistema deve notificar todos os inscritos por e-mail.
- **FR-28:** O sistema deve permitir ao gestor enviar lembrete por e-mail aos inscritos de um evento (max 1/dia).

### Dashboard (Fase 2)
- **FR-29:** O sistema deve exibir métricas: total de eventos, inscrições, eventos por categoria, inscrições por mês, top 5 eventos.

---

## Non-Goals (Fora de Escopo)

- **Pagamentos/ingressos pagos** — todos os eventos são gratuitos nesta versão.
- **Chat ou fórum** entre cidadãos ou com gestores.
- **App mobile nativo** (iOS/Android) — o portal é web responsivo.
- **Notificações push** (web push ou mobile push).
- **Internacionalização/multi-idioma** — somente PT-BR (mas estrutura deve suportar).
- **Integração com sistemas legados da prefeitura** (RH, financeiro, etc.).
- **Moderação/aprovação de eventos** por cadeia hierárquica — qualquer admin pode publicar.
- **Geolocalização/mapa interativo** na busca de eventos (apenas link para Google Maps no detalhe).
- **Sistema de avaliação/rating** de eventos pós-participação.
- **Gamificação** (pontos, badges, ranking de participação).
- **Upload de vídeo** em eventos (apenas imagens).
- **Comentários** em eventos.
- **Integração com calendário** (Google Calendar, iCal) — pode ser adicionada futuramente.
- **Personalização visual por evento** (temas/cores) — identidade visual uniforme.
- **Relatórios avançados** (BI/analytics) — apenas dashboard básico na Fase 2.

---

## Considerações de Design

- **Identidade visual:** Alinhada à marca Connect Bandeirantes. Cores institucionais, tipografia moderna, logo no header.
- **Mobile-first obrigatório:** Toda interface deve ser projetada primeiro para mobile (320px+) e escalar para desktop.
- **Componentes:** Utilizar shadcn/ui como biblioteca base, com Tailwind CSS v4 para estilização.
- **Acessibilidade (WCAG 2.1 AA):**
  - Contraste mínimo 4.5:1 para texto normal, 3:1 para texto grande.
  - Navegação completa por teclado.
  - Alt text obrigatório em todas as imagens.
  - Labels associados a todos os inputs.
  - Suporte a leitores de tela (ARIA labels quando necessário).
- **Formulários:** Validação em tempo real com mensagens de erro claras e posicionadas junto ao campo.
- **Loading states:** Skeleton screens em listagens, spinner em botões de ação.

---

## Considerações Técnicas

### Stack
- **Frontend:** Next.js 15 (App Router), TailwindCSS v4, shadcn/ui, TanStack Query
- **Backend:** NestJS com prefixo global `v1`
- **Banco:** PostgreSQL + Prisma ORM
- **Contratos:** Zod schemas em `packages/contracts`
- **Monorepo:** pnpm workspaces

### Arquitetura (conforme AGENTS.md)
- **Rotas públicas** (`apps/web/app/public/*`): SEO-first com SSR/SSG, fetch via `GET /v1/public/*`
- **Rotas autenticadas** (`apps/web/app/app/*`): SPA client-only, fetch via `api-client.ts` + TanStack Query
- **Backend:** Controller fino → Service → Repository (Prisma). Prisma nunca no Controller.
- **Validação:** Zod schemas na borda (contract-first)

### Performance
- **LCP < 2.5s, FID < 100ms** — obrigatório
- **Imagens:** Otimização automática (Next.js Image), lazy loading, formatos WebP
- **Paginação obrigatória** em todas as listas (nunca "listar tudo")
- **Índices de banco** para filtros/joins recorrentes

### Segurança
- Senhas com bcrypt (cost factor 12)
- Sessões via cookies httpOnly + Secure + SameSite=Lax
- CSRF protection em endpoints mutáveis
- Rate limiting em rotas públicas
- Validação de input em toda borda (Zod)
- CPF nunca exposto em APIs públicas
- Sem stack traces em produção

### Infraestrutura
- Volume pequeno: até 50 eventos/mês, centenas de inscrições por evento
- SMTP próprio da prefeitura para envio de e-mails
- Upload de imagens com armazenamento local ou S3-compatible (configurável)

---

## Métricas de Sucesso

- Cidadão sem conta consegue se inscrever em evento em **menos de 3 minutos**.
- Portal funciona em celulares de baixo desempenho com **conexão 3G** (LCP < 2.5s).
- **100% dos eventos publicados** são indexáveis pelo Google (SSR + meta tags).
- **Zero overbooking** — controle atômico de vagas sem race conditions.
- Gestor consegue criar e publicar evento em **menos de 5 minutos**.
- Exportação de inscritos em CSV funciona para eventos com **até 1.000 inscrições**.
- Portal atende **WCAG 2.1 AA** — verificável com ferramentas automatizadas (axe, Lighthouse).

---
