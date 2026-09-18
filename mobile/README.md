# FordRetain Mobile

Aplicativo React Native com Expo Router integrado ao Firebase Authentication e à API Spring Boot do FordRetain.

## O que já está integrado

- cadastro e login reais com e-mail e senha no Firebase;
- persistência da sessão com AsyncStorage;
- envio do Firebase ID Token no header `Authorization: Bearer`;
- perfis `ADMIN`, `GERENTE` e `ANALISTA` obtidos pela claim `role`;
- dashboard, leads, cliente e predição consumindo os endpoints reais da API;
- configuração de ambiente sem credenciais do projeto do professor no código;
- perfil inicial seguro `ANALISTA` quando a claim ainda não foi definida;
- configuração EAS para gerar APK no perfil `preview`.

## Configuração

1. Copie `.env.example` para `.env`.
2. No Console do Firebase, crie um aplicativo Web dentro do projeto FordRetain.
3. Habilite `Authentication > Sign-in method > Email/Password`.
4. Preencha no `.env` os valores do objeto `firebaseConfig`.
5. Ajuste `EXPO_PUBLIC_API_URL` de acordo com o ambiente:

```text
Emulador Android: http://10.0.2.2:8080
Celular físico:    http://IP_DO_COMPUTADOR:8080
API publicada:     https://endereco-da-api
```

Não reutilize as credenciais Firebase presentes no projeto de exemplo da aula.

## Execução

```bash
cd mobile
npm install
npm start
```

Validações do projeto:

```bash
npm run lint
npm run doctor
```

## APK

Após configurar uma conta Expo/EAS:

```bash
npx eas-cli build --platform android --profile preview
```

O perfil `preview` gera um APK instalável para a entrega acadêmica.

## Autorização

O aplicativo procura uma custom claim `role` no Firebase ID Token. Os valores aceitos são:

```text
ADMIN
GERENTE
ANALISTA
```

Se a claim não existir, a conta entra como `ANALISTA`. A interface oculta dashboard e predição para esse perfil, mas a API continua sendo a autoridade final de autorização.

## Integração do backend

A API Java valida o Firebase ID Token com o Firebase Admin SDK quando
`FIREBASE_ENABLED=true`. Configure no backend `GOOGLE_APPLICATION_CREDENTIALS`
com o caminho local da Service Account (ou use Application Default Credentials)
e, opcionalmente, `FIREBASE_PROJECT_ID`. Nunca versionar esse JSON ou qualquer
outro segredo.

O backend lê a custom claim `role`, aceita somente `ADMIN`, `GERENTE` e
`ANALISTA`, e aplica `ANALISTA` como fallback seguro. O endpoint legado
`/api/v1/auth/login` continua disponível temporariamente, mas o mobile usa
exclusivamente o Firebase ID Token.
