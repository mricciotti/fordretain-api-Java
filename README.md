# FordRetain API

> **Ford FIAP Challenge 2026 — Desafio 02**  
> API de Retenção Preditiva de Clientes | Disciplina: Arquitetura Orientada a Serviços e Web Services

---

### Rodando localmente sem Oracle (testes visuais)

Para validar o aplicativo e os endpoints com dados de demonstração em memória, sem conexão com o Oracle:

```powershell
mvn spring-boot:run "-Dspring-boot.run.profiles=local"
```

O perfil `local` desativa o datasource/Flyway, carrega uma carteira fictícia e mantém o Oracle como padrão nos demais ambientes. A porta continua sendo `8080`.

> O modo local aceita qualquer Bearer Token somente para facilitar testes visuais. Não use o perfil `local` em produção.


## Integrantes

| Nome | RM |
|---|---|
| Fernanda Rocha Menon | RM 554673 |
| Luiza Macena Dantas | RM 556237 |
| Luan Ramos Garcia de Souza | RM 558537 |
| Matheus Ricciotti | RM 556930 |
| Matheus Bortolotto | RM 555189 |

---

## Visão Geral

A **FordRetain API** é um serviço RESTful desenvolvido em **Java 17 + Spring Boot 3.2** que integra o pipeline de retenção de clientes da Ford no pós-venda.

A API recebe dados de um cliente no momento da compra, prevê seu perfil comportamental (FIEL, ABANDONO, ESQUECIDO ou ECONÔMICO) e sugere ações personalizadas para a concessionária — com persistência em **Oracle Database** e documentação interativa via **Swagger/OpenAPI**.

---

## Arquitetura SOA

O projeto segue uma **Arquitetura Orientada a Serviços (SOA)** com separação clara em três camadas:

```
┌─────────────────────────────────────────────────────────┐
│                  CAMADA DE APRESENTAÇÃO                  │
│        App Mobile (React Native) / Dashboard Web         │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/REST (JSON) + JWT Bearer Token
┌───────────────────────────▼─────────────────────────────┐
│                    CAMADA DE SERVIÇO                     │
│              FordRetain API (Spring Boot)                │
│                                                         │
│  JwtAuthFilter          →  Validação do token em toda   │
│                             requisição protegida         │
│  SecurityConfig (RBAC)  →  ADMIN / GERENTE / ANALISTA    │
│                                                         │
│  POST   /api/v1/auth/login   →  AuthController          │
│  POST   /api/v1/predict      →  PredictionService       │
│  GET    /api/v1/clientes/{id}→  PredictionService       │
│  PUT    /api/v1/clientes/{id}→  PredictionService       │
│  DELETE /api/v1/clientes/{id}→  PredictionService       │
│  GET    /api/v1/dashboard    →  PredictionService       │
│  GET    /api/v1/leads        →  PredictionService       │
│                                                         │
│  GlobalExceptionHandler  →  Tratamento de erros         │
│  Bean Validation         →  Validação de entrada        │
│  Swagger/OpenAPI         →  Documentação automática     │
└──────────┬──────────────────────────┬───────────────────┘
           │ JDBC (DAO Pattern)       │ HTTP (futuro)
┌──────────▼──────────┐   ┌──────────▼──────────────────┐
│   CAMADA DE DADOS   │   │  MICROSSERVIÇO ML (futuro)  │
│   Oracle Database   │   │  Python FastAPI             │
│   + Flyway          │   │  Modelo treinado (sklearn)  │
└─────────────────────┘   └─────────────────────────────┘
```

### Fluxo de autenticação e autorização

1. Cliente envia `POST /api/v1/auth/login` com e-mail e senha → `AuthController` valida contra hash BCrypt e retorna um **JWT** (HS512, expiração 24h) contendo `email` e `role` como claims.
2. Toda requisição a um endpoint protegido deve enviar o header `Authorization: Bearer <token>`.
3. O `JwtAuthFilter` intercepta a requisição, valida assinatura e expiração do token, e popula o `SecurityContext` do Spring Security com a role do usuário.
4. O `SecurityConfig` aplica **RBAC** (Role-Based Access Control) por rota e método HTTP — ver tabela de perfis abaixo.
5. Sem token → **401 Unauthorized**. Com token válido mas role sem permissão → **403 Forbidden**.

### Componentes

| Componente | Tecnologia | Responsabilidade |
|---|---|---|
| API REST | Java 17 + Spring Boot 3.2 | Orquestração dos serviços e exposição dos endpoints |
| Autenticação | JWT (jjwt 0.12.3) + BCrypt | Emissão/validação de token e hash de senha |
| Autorização | Spring Security 6 (RBAC) | Controle de acesso por perfil (ADMIN/GERENTE/ANALISTA) |
| Banco de Dados | Oracle Database | Persistência de clientes e predições |
| Migrações | Flyway | Controle de versão do schema (V1, V2, V3) |
| Documentação | SpringDoc OpenAPI 2.3 (Swagger) | Contrato interativo da API |
| Validação | Bean Validation (Jakarta) | Validação de entrada com anotações |
| Testes | JUnit 5 + Mockito + MockMvc | Testes unitários e de integração (segurança + web) |
| Driver JDBC | ojdbc11 23.4 | Conexão com Oracle Database |

### Perfis de acesso (RBAC)

| Endpoint | ADMIN | GERENTE | ANALISTA |
|---|---|---|---|
| `POST /auth/login` | público | público | público |
| `POST /predict` | ✅ | ✅ | ❌ |
| `GET /clientes/{id}` | ✅ | ✅ | ✅ |
| `PUT /clientes/{id}` | ✅ | ✅ | ❌ |
| `DELETE /clientes/{id}` | ✅ | ❌ | ❌ |
| `GET /dashboard` | ✅ | ✅ | ❌ |
| `GET /leads` | ✅ | ✅ | ✅ |

### Estrutura de Pacotes

```
com.ford.fordretain
├── controller/          # Endpoints REST (camada de apresentação)
│   ├── FordRetainController.java
│   └── AuthController.java
├── security/            # Autenticação e autorização
│   ├── SecurityConfig.java     # RBAC, CORS, AuthenticationEntryPoint
│   ├── JwtService.java         # Geração/validação de JWT
│   ├── JwtAuthFilter.java      # Filtro de autenticação por requisição
│   ├── RateLimitFilter.java    # Limite de requisições por IP
│   ├── AuditLogFilter.java     # Log de auditoria de requisições
│   └── CryptoUtils.java
├── service/             # Lógica de negócio (camada de serviço)
│   └── PredictionService.java
├── dao/                 # Interfaces DAO (contrato de acesso a dados)
│   ├── ClienteDAO.java
│   ├── PredicaoDAO.java
│   └── impl/            # Implementações JDBC
│       ├── ClienteDAOImpl.java
│       └── PredicaoDAOImpl.java
├── model/               # Entidades de domínio
│   ├── Cliente.java
│   └── Predicao.java
├── dto/                 # Objetos de transferência (entrada/saída)
│   ├── ClienteRequestDTO.java
│   ├── ClienteResponseDTO.java
│   ├── ClienteUpdateRequestDTO.java
│   ├── PredicaoResponseDTO.java
│   ├── DashboardDTO.java
│   ├── LeadDTO.java
│   ├── LoginRequestDTO.java
│   └── LoginResponseDTO.java
├── exception/           # Tratamento global de erros
│   ├── GlobalExceptionHandler.java
│   ├── ClienteJaCadastradoException.java
│   ├── ClienteNaoEncontradoException.java
│   ├── DatabaseException.java
│   └── ErrorResponse.java
└── config/              # Configurações
    ├── OracleConnectionFactory.java
    └── SwaggerConfig.java
```

---

## Endpoints da API

### `POST /api/v1/auth/login` — Autenticação

Autentica o usuário e retorna um token JWT válido por 24h. **Endpoint público.**

**Request:**
```json
{
  "email": "gerente@ford.com",
  "senha": "ford2026"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "tipo": "Bearer",
  "email": "gerente@ford.com",
  "role": "GERENTE",
  "expiresIn": 86400000
}
```

Usuários disponíveis (mock): `admin@ford.com`, `gerente@ford.com`, `analista@ford.com` — senha `ford2026` para todos.

> Todos os endpoints abaixo exigem o header `Authorization: Bearer <token>`, exceto o login.

### `POST /api/v1/predict` — Prever perfil do cliente

Recebe dados do momento da compra e retorna o perfil comportamental previsto. **Perfis: ADMIN, GERENTE.**

**Request:**
```json
{
  "nome": "João da Silva",
  "email": "joao.silva@email.com",
  "telefone": "11999990001",
  "regiao": "SP",
  "idade": 34,
  "canalCompra": "CONCESSIONARIA",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2024-03-15",
  "historicoMarca": "PRIMEIRA_COMPRA"
}
```

**Response (201 Created):**
```json
{
  "predicaoId": 42,
  "clienteId": 7,
  "nomeCliente": "João da Silva",
  "perfilPrevisto": "ABANDONO",
  "probabilidades": {
    "FIEL": 0.0800,
    "ABANDONO": 0.6800,
    "ESQUECIDO": 0.1500,
    "ECONOMICO": 0.0900
  },
  "scoreRisco": 68,
  "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
  "dataPredicao": "2026-05-08T14:30:00"
}
```

### `GET /api/v1/clientes/{id}` — Buscar cliente por ID

Retorna os dados completos de um cliente. **Perfis: ADMIN, GERENTE, ANALISTA.**

**Response (200 OK):**
```json
{
  "id": 7,
  "nome": "João da Silva",
  "email": "joao.silva@email.com",
  "telefone": "11999990001",
  "regiao": "SP",
  "idade": 34,
  "canalCompra": "CONCESSIONARIA",
  "formaPagamento": "FINANCIAMENTO",
  "modeloVeiculo": "RANGER",
  "dataCompra": "2024-03-15",
  "historicoMarca": "PRIMEIRA_COMPRA",
  "criadoEm": "2026-05-08T14:30:00",
  "atualizadoEm": "2026-05-08T14:30:00"
}
```
Cliente inexistente → **404 Not Found**.

### `PUT /api/v1/clientes/{id}` — Atualizar cliente

Atualiza integralmente os dados de um cliente já cadastrado (e-mail não é alterável). **Perfis: ADMIN, GERENTE.**

**Request:** mesmo formato do `POST /predict`, sem o campo `email`.

**Response (200 OK):** mesmo formato do `GET /clientes/{id}`, com `atualizadoEm` atualizado.

### `DELETE /api/v1/clientes/{id}` — Remover cliente

Remove definitivamente um cliente e suas predições associadas (cascade). **Perfil: ADMIN apenas.**

**Response:** `204 No Content`.

### `GET /api/v1/dashboard` — Métricas de VIN Share

Retorna métricas agregadas de retenção: VIN Share geral, por região, por modelo e distribuição de perfis. **Perfis: ADMIN, GERENTE.**

**Response (200 OK):**
```json
{
  "totalClientes": 1250,
  "vinShareGeral": 0.58,
  "clientesRiscoAlto": 312,
  "distribuicaoPerfis": {
    "FIEL": 420,
    "ABANDONO": 310,
    "ESQUECIDO": 280,
    "ECONOMICO": 240
  },
  "vinSharePorRegiao": { "SP": 0.62, "RJ": 0.51 },
  "vinSharePorModelo": { "RANGER": 0.65, "TERRITORY": 0.48 },
  "geradoEm": "2026-05-08T14:30:00"
}
```

### `GET /api/v1/leads?scoreMinimo=50` — Clientes em risco

Lista clientes com score de risco acima do mínimo, ordenados por prioridade. **Perfis: ADMIN, GERENTE, ANALISTA.**

**Response (200 OK):**
```json
[
  {
    "clienteId": 7,
    "nome": "Carlos Mendes",
    "email": "carlos.m@email.com",
    "telefone": "21999990002",
    "regiao": "RJ",
    "modeloVeiculo": "MAVERICK",
    "perfilPrevisto": "ABANDONO",
    "scoreRisco": 85,
    "probabilidadePrincipal": 0.7200,
    "acaoSugerida": "Contato imediato — pacote de 3 revisões com desconto progressivo.",
    "dataPredicao": "2026-05-08T14:30:00"
  }
]
```

### Métodos HTTP utilizados (Maturidade REST — Nível 2)

| Método | Endpoint | Ação | Status de sucesso |
|---|---|---|---|
| `POST` | `/api/v1/auth/login` | Autentica e emite token | 200 |
| `POST` | `/api/v1/predict` | Cria cliente + predição (recurso novo) | 201 |
| `GET` | `/api/v1/clientes/{id}` | Consulta um cliente específico | 200 |
| `PUT` | `/api/v1/clientes/{id}` | Atualiza integralmente um cliente | 200 |
| `DELETE` | `/api/v1/clientes/{id}` | Remove um cliente | 204 |
| `GET` | `/api/v1/dashboard` | Consulta métricas (leitura) | 200 |
| `GET` | `/api/v1/leads` | Consulta leads com filtro (leitura) | 200 |

---

## Tratamento de Erros

A API possui um `GlobalExceptionHandler` que padroniza todas as respostas de erro:

| HTTP Status | Exceção | Cenário |
|---|---|---|
| `400` | `MethodArgumentNotValidException` | Campos inválidos (validação) |
| `401` | `AuthenticationEntryPoint` (custom) | Token ausente ou inválido |
| `403` | Spring Security `AccessDeniedHandler` | Role autenticada sem permissão para a rota |
| `404` | `ClienteNaoEncontradoException` | Cliente não existe na base |
| `409` | `ClienteJaCadastradoException` | E-mail já cadastrado |
| `500` | `DatabaseException` | Falha de conexão com o banco |
| `500` | `Exception` | Erro genérico (sem detalhes internos) |

Formato padrão de erro:
```json
{
  "status": 400,
  "erro": "Dados inválidos",
  "mensagem": "Verifique os campos informados",
  "campos": { "email": "Email inválido", "idade": "Idade mínima é 18" },
  "timestamp": "2026-05-08T14:30:00"
}
```

> **Nota de segurança:** mensagens de erro genéricas (500) nunca expõem stack trace, estrutura interna ou tecnologia utilizada.

> **Nota técnica:** as respostas `401` e `403` são geradas pelo Spring Security (fora do `GlobalExceptionHandler`) e por isso têm um formato de corpo ligeiramente diferente do padrão `ErrorResponse` acima — o status code em si é o que importa para o cliente da API, mas fica registrado aqui para quem for revisar a padronização de erros.

---

## Pré-requisitos

- Java 17+
- Maven 3.8+
- Oracle Database (acesso FIAP: `oracle.fiap.com.br:1521/orcl`)

---

## Configuração do Banco de Dados

Edite `src/main/resources/application.properties` com suas credenciais Oracle FIAP:

```properties
oracle.datasource.url=jdbc:oracle:thin:@//oracle.fiap.com.br:1521/orcl
oracle.datasource.username=SEU_RM
oracle.datasource.password=SUA_SENHA
oracle.datasource.driver-class-name=oracle.jdbc.OracleDriver
```

O **Flyway** executa as migrações automaticamente ao iniciar a aplicação:
- `V1__create_tables.sql` — cria as tabelas `clientes` e `predicoes` (sintaxe Oracle)
- `V2__insert_sample_data.sql` — insere dados de exemplo para testes
- `V3__fix_predicao_cascade_delete.sql` — ajusta a FK `predicoes → clientes` para `ON DELETE CASCADE` (necessário para o `DELETE /clientes/{id}` funcionar sem violar integridade referencial)

## Firebase Admin e autenticação mobile

O mobile envia um Firebase ID Token no header `Authorization: Bearer`. Para
validá-lo no backend, habilite `FIREBASE_ENABLED=true` e forneça credenciais
por Application Default Credentials, normalmente via:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\caminho\firebase-service-account.json"
$env:FIREBASE_PROJECT_ID="seu-projeto-firebase"
```

O filtro aceita Firebase ID Tokens e o JWT legado de `/api/v1/auth/login`
durante a transição. A claim `role` é lida somente após a validação do token;
valores ausentes ou desconhecidos recebem `ANALISTA`. Nunca versione o JSON da
Service Account, credenciais Oracle ou segredos.

---

## Como Executar

```bash
# Clonar o projeto
git clone https://github.com/seu-grupo/fordretain-api.git
cd fordretain-api

# Compilar e rodar testes
mvn clean install

# Executar a aplicação
mvn spring-boot:run
```

A API estará disponível em: `http://localhost:8080`

---

## Documentação — Swagger UI

Com a aplicação rodando, acesse:

| Recurso | URL |
|---|---|
| Swagger UI | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| OpenAPI JSON | [http://localhost:8080/api-docs](http://localhost:8080/api-docs) |

O Swagger funciona como o **contrato da API**, documentando todos os endpoints, parâmetros, schemas de request/response e códigos de erro.

---

## Testes

### Testes automatizados (JUnit)

O projeto possui testes unitários e de integração com **JUnit 5 + Mockito + MockMvc**:

```bash
mvn test
```

**`PredictionServiceTest`** — regras de negócio da predição:

| Teste | Cenário |
|---|---|
| `deveRetornarPerfilAbandonoParaClienteNovoOnline` | Cliente novo + canal online → ABANDONO |
| `deveLancarExcecaoEmailDuplicado` | E-mail já cadastrado → 409 Conflict |
| `deveRetornarPerfilFielParaRecompra` | Cliente recompra + concessionária → FIEL |
| `deveRetornarPerfilEsquecidoParaConsorcio` | Primeira compra + consórcio → ESQUECIDO |
| `deveRetornarPerfilEconomicoParaCenarioPadrao` | Cenário padrão → ECONOMICO |

**`FordRetainControllerTest`** — segurança e maturidade REST (sucesso, erro, não autorizado), cobrindo `/predict`, `/clientes/{id}` (GET/PUT/DELETE) e `/dashboard`:

| Teste | Cenário |
|---|---|
| `predictSemTokenDeveRetornar401` | Requisição sem token → 401 |
| `dashboardComRoleSemPermissaoDeveRetornar403` | Token válido, role sem permissão → 403 |
| `tokenInvalidoDeveRetornar401` | Token adulterado → 401 |
| `predictComSucessoDeveRetornar201` | Payload válido + role correta → 201 |
| `predictComPayloadInvalidoDeveRetornar400` | Campos inválidos → 400 |
| `getClienteExistenteDeveRetornar200` / `getClienteInexistenteDeveRetornar404` | Busca por ID (sucesso/erro) |
| `updateClienteComSucessoDeveRetornar200` / `...RoleSemPermissaoDeveRetornar403` | Atualização (sucesso/autorização) |
| `deleteClienteComSucessoDeveRetornar204` / `...RoleSemPermissaoDeveRetornar403` | Remoção (sucesso/autorização) |

### Testes manuais end-to-end (evidência de execução)

Além dos testes automatizados, a API foi validada de ponta a ponta com a aplicação real rodando contra o Oracle FIAP, usando o script `test-api.ps1` (raiz do projeto). Ele roda 20 cenários cobrindo login, RBAC, JWT, CRUD completo de cliente e tratamento de erros, e gera evidências em `evidencias/<data_hora>/`:

```powershell
.\run-tests.bat
```

**Resultado da última execução: 20/20 testes PASS** — ver `evidencias/evidencias.txt` para o log completo de request/response de cada cenário e `resumo.csv` para a tabela resumida.

| # | Cenário | Esperado | Obtido |
|---|---|---|---|
| 1-3 | Login (ADMIN/GERENTE/ANALISTA) | 200 | 200 |
| 4 | `GET /dashboard` sem token | 401 | 401 |
| 5 | `GET /dashboard` token inválido | 401 | 401 |
| 6 | `POST /predict` como ANALISTA (sem permissão) | 403 | 403 |
| 7 | `POST /predict` válido (GERENTE) | 201 | 201 |
| 8 | `POST /predict` payload inválido | 400 | 400 |
| 9 | `POST /predict` e-mail duplicado | 409 | 409 |
| 10 | `GET /clientes/{id}` existente | 200 | 200 |
| 11 | `GET /clientes/{id}` inexistente | 404 | 404 |
| 12 | `GET /clientes/{id}` sem token | 401 | 401 |
| 13 | `PUT /clientes/{id}` válido (GERENTE) | 200 | 200 |
| 14 | `PUT /clientes/{id}` como ANALISTA | 403 | 403 |
| 15 | `PUT /clientes/{id}` payload inválido | 400 | 400 |
| 16 | `DELETE /clientes/{id}` como GERENTE | 403 | 403 |
| 17 | `DELETE /clientes/{id}` como ADMIN | 204 | 204 |
| 18 | `GET /clientes/{id}` após delete | 404 | 404 |
| 19 | `GET /dashboard` (GERENTE) | 200 | 200 |
| 20 | `GET /leads` (ANALISTA) | 200 | 200 |

---

## Perfis de Cliente e Ações

| Perfil | Descrição | Ação Sugerida |
|---|---|---|
| **FIEL** | Retorna consistentemente à rede oficial | Programa de fidelidade premium |
| **ABANDONO** | Realiza no máximo a 1ª revisão e sai da rede | Contato imediato + pacote de revisões |
| **ESQUECIDO** | Perde o timing da manutenção | Lembrete com agendamento fácil |
| **ECONOMICO** | Sensível a preço, mantém relação parcial | Cupom de desconto na próxima revisão |

---

## Tecnologias

- **Java 17** + **Spring Boot 3.2**
- **Spring Security 6** (JWT + RBAC)
- **jjwt 0.12.3** (geração/validação de token)
- **Oracle Database** (JDBC direto via `ojdbc11`)
- **Flyway** (migrações de schema)
- **SpringDoc OpenAPI 2.3** (Swagger UI)
- **Lombok** (redução de boilerplate)
- **Bean Validation** (Jakarta)
- **JUnit 5** + **Mockito** + **MockMvc** (testes)
