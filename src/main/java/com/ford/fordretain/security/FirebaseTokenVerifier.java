package com.ford.fordretain.security;

/**
 * Abstração da validação de Firebase ID Tokens para manter o filtro testável
 * sem depender da rede ou de um projeto Firebase nos testes.
 */
@FunctionalInterface
public interface FirebaseTokenVerifier {

    FirebaseUserToken verify(String token) throws FirebaseTokenVerificationException;
}
