package com.ford.fordretain.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ford.fordretain.dto.ClienteRequestDTO;
import com.ford.fordretain.dto.ClienteResponseDTO;
import com.ford.fordretain.dto.ClienteUpdateRequestDTO;
import com.ford.fordretain.dto.DashboardDTO;
import com.ford.fordretain.dto.PredicaoResponseDTO;
import com.ford.fordretain.exception.ClienteNaoEncontradoException;
import com.ford.fordretain.security.JwtService;
import com.ford.fordretain.security.SecurityConfig;
import com.ford.fordretain.service.PredictionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testes de integração (camada web + segurança) do FordRetainController.
 * Cobre os três cenários exigidos pela Sprint 3:
 *  - sucesso (200/201 com token e role corretos)
 *  - erro (400 payload inválido)
 *  - acesso não autorizado (401 sem token, 403 com role sem permissão)
 */
// JwtAuthFilter, RateLimitFilter e AuditLogFilter são beans do tipo Filter e já são
// detectados automaticamente pelo slice do @WebMvcTest — não devem ser importados de novo.
@WebMvcTest(FordRetainController.class)
@Import({SecurityConfig.class, JwtService.class})
@TestPropertySource(properties = {
        "jwt.secret=ford-retain-test-secret-key-with-at-least-256-bits-2026",
        "jwt.expiration=86400000"
})
class FordRetainControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private PredictionService predictionService;

    private String tokenGerente;
    private String tokenAnalista;
    private String tokenAdmin;
    private ClienteRequestDTO request;
    private ClienteUpdateRequestDTO updateRequest;

    @BeforeEach
    void setUp() {
        tokenGerente = jwtService.generateToken("gerente@ford.com", "GERENTE");
        tokenAnalista = jwtService.generateToken("analista@ford.com", "ANALISTA");
        tokenAdmin = jwtService.generateToken("admin@ford.com", "ADMIN");

        request = new ClienteRequestDTO();
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

        updateRequest = new ClienteUpdateRequestDTO();
        updateRequest.setNome("Joao da Silva Atualizado");
        updateRequest.setTelefone("11999990000");
        updateRequest.setRegiao("RJ");
        updateRequest.setIdade(31);
        updateRequest.setCanalCompra("CONCESSIONARIA");
        updateRequest.setFormaPagamento("VISTA");
        updateRequest.setModeloVeiculo("RANGER");
        updateRequest.setDataCompra(LocalDate.now());
        updateRequest.setHistoricoMarca("RECOMPRA");
    }

    // ---------- Acesso não autorizado ----------

    @Test
    @DisplayName("POST /predict sem token deve retornar 401")
    void predictSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(post("/api/v1/predict")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /dashboard sem token deve retornar 401")
    void dashboardSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /dashboard com role ANALISTA (sem permissão) deve retornar 403")
    void dashboardComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + tokenAnalista))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("POST /predict com role ANALISTA (sem permissão) deve retornar 403")
    void predictComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenAnalista)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Requisição com token inválido/adulterado deve retornar 401")
    void tokenInvalidoDeveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer token.invalido.aqui"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- Sucesso ----------

    @Test
    @DisplayName("POST /predict com role GERENTE e payload válido deve retornar 201")
    void predictComSucessoDeveRetornar201() throws Exception {
        PredicaoResponseDTO response = PredicaoResponseDTO.builder()
                .predicaoId(1L)
                .clienteId(1L)
                .nomeCliente(request.getNome())
                .perfilPrevisto("ABANDONO")
                .probabilidades(Map.of("ABANDONO", new java.math.BigDecimal("0.68")))
                .scoreRisco(68)
                .acaoSugerida("Contato imediato")
                .dataPredicao(LocalDateTime.now())
                .build();

        when(predictionService.predict(any(ClienteRequestDTO.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.perfilPrevisto").value("ABANDONO"));
    }

    @Test
    @DisplayName("GET /dashboard com role GERENTE deve retornar 200")
    void dashboardComRoleCorretaDeveRetornar200() throws Exception {
        DashboardDTO dashboard = DashboardDTO.builder()
                .totalClientes(100L)
                .vinShareGeral(0.5)
                .clientesRiscoAlto(20L)
                .distribuicaoPerfis(Map.of("FIEL", 25L))
                .geradoEm(LocalDateTime.now())
                .build();

        when(predictionService.getDashboard()).thenReturn(dashboard);

        mockMvc.perform(get("/api/v1/dashboard")
                        .header("Authorization", "Bearer " + tokenGerente))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalClientes").value(100));
    }

    // ---------- Erro (validação) ----------

    @Test
    @DisplayName("POST /predict com payload inválido (email malformado) deve retornar 400")
    void predictComPayloadInvalidoDeveRetornar400() throws Exception {
        request.setEmail("email-invalido");

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    @DisplayName("POST /predict com idade abaixo do mínimo deve retornar 400")
    void predictComIdadeInvalidaDeveRetornar400() throws Exception {
        request.setIdade(15);

        mockMvc.perform(post("/api/v1/predict")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    // ---------- GET /clientes/{id} ----------

    @Test
    @DisplayName("GET /clientes/{id} existente deve retornar 200")
    void getClienteExistenteDeveRetornar200() throws Exception {
        ClienteResponseDTO response = ClienteResponseDTO.builder()
                .id(1L)
                .nome("Joao da Silva")
                .email("joao@email.com")
                .regiao("SP")
                .build();

        when(predictionService.getClienteById(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenAnalista))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.email").value("joao@email.com"));
    }

    @Test
    @DisplayName("GET /clientes/{id} inexistente deve retornar 404")
    void getClienteInexistenteDeveRetornar404() throws Exception {
        when(predictionService.getClienteById(999L))
                .thenThrow(new ClienteNaoEncontradoException(999L));

        mockMvc.perform(get("/api/v1/clientes/999")
                        .header("Authorization", "Bearer " + tokenGerente))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("GET /clientes/{id} sem token deve retornar 401")
    void getClienteSemTokenDeveRetornar401() throws Exception {
        mockMvc.perform(get("/api/v1/clientes/1"))
                .andExpect(status().isUnauthorized());
    }

    // ---------- PUT /clientes/{id} ----------

    @Test
    @DisplayName("PUT /clientes/{id} com dados válidos deve retornar 200")
    void updateClienteComSucessoDeveRetornar200() throws Exception {
        ClienteResponseDTO response = ClienteResponseDTO.builder()
                .id(1L)
                .nome(updateRequest.getNome())
                .email("joao@email.com")
                .regiao(updateRequest.getRegiao())
                .build();

        when(predictionService.updateCliente(eq(1L), any(ClienteUpdateRequestDTO.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nome").value(updateRequest.getNome()));
    }

    @Test
    @DisplayName("PUT /clientes/{id} inexistente deve retornar 404")
    void updateClienteInexistenteDeveRetornar404() throws Exception {
        when(predictionService.updateCliente(eq(999L), any(ClienteUpdateRequestDTO.class)))
                .thenThrow(new ClienteNaoEncontradoException(999L));

        mockMvc.perform(put("/api/v1/clientes/999")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("PUT /clientes/{id} com payload inválido deve retornar 400")
    void updateClienteComPayloadInvalidoDeveRetornar400() throws Exception {
        updateRequest.setIdade(10);

        mockMvc.perform(put("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenGerente)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PUT /clientes/{id} com role ANALISTA (sem permissão) deve retornar 403")
    void updateClienteComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(put("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenAnalista)
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isForbidden());
    }

    // ---------- DELETE /clientes/{id} ----------

    @Test
    @DisplayName("DELETE /clientes/{id} com role ADMIN deve retornar 204")
    void deleteClienteComSucessoDeveRetornar204() throws Exception {
        mockMvc.perform(delete("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /clientes/{id} inexistente deve retornar 404")
    void deleteClienteInexistenteDeveRetornar404() throws Exception {
        org.mockito.Mockito.doThrow(new ClienteNaoEncontradoException(999L))
                .when(predictionService).deleteCliente(999L);

        mockMvc.perform(delete("/api/v1/clientes/999")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("DELETE /clientes/{id} com role GERENTE (sem permissão) deve retornar 403")
    void deleteClienteComRoleSemPermissaoDeveRetornar403() throws Exception {
        mockMvc.perform(delete("/api/v1/clientes/1")
                        .header("Authorization", "Bearer " + tokenGerente))
                .andExpect(status().isForbidden());
    }
}
