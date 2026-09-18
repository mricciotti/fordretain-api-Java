package com.ford.fordretain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.security.FirebaseTokenVerifier;
import com.ford.fordretain.security.FirebaseUserToken;
import com.ford.fordretain.security.JwtService;
import com.ford.fordretain.security.SecurityConfig;
import com.ford.fordretain.service.PredictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(FordRetainController.class)
@Import({SecurityConfig.class, JwtService.class})
@TestPropertySource(properties = {
        "jwt.secret=ford-retain-test-secret-key-with-at-least-256-bits-2026",
        "jwt.expiration=86400000"
})
class FirebaseSecurityMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PredictionService predictionService;

    @MockBean
    private FirebaseTokenVerifier firebaseTokenVerifier;

    @BeforeEach
    void setUp() {
        when(firebaseTokenVerifier.verify("firebase-gerente"))
                .thenReturn(new FirebaseUserToken("uid-gerente", "gerente@ford.com", "GERENTE"));
        when(firebaseTokenVerifier.verify("firebase-analista"))
                .thenReturn(new FirebaseUserToken("uid-analista", "analista@ford.com", "ANALISTA"));
    }

    @Test
    void gerenteComFirebasePodeExecutarPredicao() throws Exception {
        ClienteRequestDTO request = new ClienteRequestDTO();
        request.setNome("Joao da Silva");
        request.setEmail("joao@email.com");
        request.setTelefone("11999990000");
        request.setRegiao("SP");
        request.setIdade(30);
        request.setCanalCompra("ONLINE");
        request.setFormaPagamento("FINANCIAMENTO");
        request.setModeloVeiculo("RANGER");
        request.setDataCompra(LocalDate.now());
        request.setHistoricoMarca("PRIMEIRA_COMPRA");

        when(predictionService.predict(request)).thenReturn(PredicaoResponseDTO.builder().build());

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer firebase-gerente")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    @Test
    void analistaComFirebaseRecebe403NoDashboard() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer firebase-analista"))
                .andExpect(status().isForbidden());
    }
}
