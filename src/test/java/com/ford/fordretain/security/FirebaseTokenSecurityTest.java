package com.ford.fordretain.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class FirebaseTokenSecurityTest {

    @Mock
    private JwtService jwtService;

    @Mock
    private ObjectProvider<FirebaseTokenVerifier> verifierProvider;

    @Mock
    private FirebaseTokenVerifier verifier;

    @Mock
    private FilterChain chain;

    private JwtAuthFilter filter;
    private MockHttpServletRequest request;
    private MockHttpServletResponse response;
    private AutoCloseable mocks;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        filter = new JwtAuthFilter(jwtService, verifierProvider);
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();
        when(verifierProvider.getIfAvailable()).thenReturn(verifier);
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() throws Exception {
        SecurityContextHolder.clearContext();
        mocks.close();
    }

    @Test
    void tokenFirebaseValidoCriaAuthenticationComRoleGerente() throws Exception {
        request.addHeader("Authorization", "Bearer firebase-token");
        when(verifier.verify("firebase-token"))
                .thenReturn(new FirebaseUserToken("uid-gerente", "gerente@ford.com", "GERENTE"));

        filter.doFilterInternal(request, response, chain);

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assertThat(authentication.getName()).isEqualTo("gerente@ford.com");
        assertThat(authentication.getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_GERENTE");
        assertThat(authentication.getDetails())
                .isEqualTo(new FirebaseUserToken("uid-gerente", "gerente@ford.com", "GERENTE"));
        verify(chain).doFilter(request, response);
        verifyNoInteractions(jwtService);
    }

    @Test
    void claimAusenteOuDesconhecidaUsaFallbackAnalista() throws Exception {
        request.addHeader("Authorization", "Bearer firebase-token");
        when(verifier.verify("firebase-token"))
                .thenReturn(new FirebaseUserToken("uid", "usuario@ford.com", "NAO_EXISTE"));

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ANALISTA");
    }

    @Test
    void tokenFirebaseInvalidoPodeUsarJwtLegadoDuranteTransicao() throws Exception {
        request.addHeader("Authorization", "Bearer legado");
        when(verifier.verify("legado"))
                .thenThrow(new FirebaseTokenVerificationException("inválido", new IllegalArgumentException()));
        when(jwtService.isTokenValid("legado")).thenReturn(true);
        when(jwtService.extractEmail("legado")).thenReturn("admin@ford.com");
        when(jwtService.extractRole("legado")).thenReturn("ADMIN");

        filter.doFilterInternal(request, response, chain);

        assertThat(SecurityContextHolder.getContext().getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_ADMIN");
    }

    @Test
    void tokenFirebaseEJwtInvalidoRetorna401() throws Exception {
        request.addHeader("Authorization", "Bearer invalido");
        when(verifier.verify(anyString()))
                .thenThrow(new FirebaseTokenVerificationException("inválido", new IllegalArgumentException()));
        when(jwtService.isTokenValid("invalido")).thenReturn(false);

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(401);
        verifyNoInteractions(chain);
    }
}
