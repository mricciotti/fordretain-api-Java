package com.ford.fordretain.security;

/** Dados confiáveis extraídos de um Firebase ID Token já validado. */
public record FirebaseUserToken(String uid, String email, String role) {
}
