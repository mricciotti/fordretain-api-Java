package com.ford.fordretain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ford.fordretain.security.JwtService;
import com.ford.fordretain.security.SecurityConfig;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração (camada web) do fluxo de autenticação.
 * Cobre login com sucesso (200 + token), erro de credenciais (401)
 * e validação de payload (400).
 */
// JwtAuthFilter, RateLimitFilter e AuditLogFilter são beans do tipo Filter e já são
// detectados automaticamente pelo slice do @WebMvcTest — não devem ser importados de novo,
// senão o contexto falha com bean duplicado. Só importamos o que NÃO é auto-detectado.
@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtService.class})
@TestPropertySource(properties = {
        "jwt.secret=ford-retain-test-secret-key-with-at-least-256-bits-2026",
        "jwt.expiration=86400000"
})
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("POST /auth/login com credenciais válidas deve retornar 200 e um token JWT")
    void loginComSucesso() throws Exception {
        Map<String, String> body = Map.of("email", "gerente@ford.com", "senha", "ford2026");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo").value("Bearer"))
                .andExpect(jsonPath("$.role").value("GERENTE"));
    }

    @Test
    @DisplayName("POST /auth/login com senha incorreta deve retornar 401")
    void loginComSenhaIncorreta() throws Exception {
        Map<String, String> body = Map.of("email", "gerente@ford.com", "senha", "senhaErrada");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas"));
    }

    @Test
    @DisplayName("POST /auth/login com email inexistente deve retornar 401 (mensagem genérica)")
    void loginComEmailInexistente() throws Exception {
        Map<String, String> body = Map.of("email", "naoexiste@ford.com", "senha", "ford2026");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.erro").value("Credenciais inválidas"));
    }

    @Test
    @DisplayName("POST /auth/login com payload inválido (sem senha) deve retornar 400")
    void loginComPayloadInvalido() throws Exception {
        Map<String, String> body = Map.of("email", "gerente@ford.com", "senha", "");

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest());
    }
}
