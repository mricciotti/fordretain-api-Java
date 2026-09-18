package com.ford.fordretain.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@Profile("!local")
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final ObjectProvider<FirebaseTokenVerifier> firebaseTokenVerifier;

    public JwtAuthFilter(JwtService jwtService,
                         ObjectProvider<FirebaseTokenVerifier> firebaseTokenVerifier) {
        this.jwtService = jwtService;
        this.firebaseTokenVerifier = firebaseTokenVerifier;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header == null || !header.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String token = header.substring(7).trim();

        FirebaseTokenVerifier verifier = firebaseTokenVerifier.getIfAvailable();
        if (verifier != null) {
            try {
                FirebaseUserToken firebaseToken = verifier.verify(token);
                if (firebaseToken == null || firebaseToken.uid() == null || firebaseToken.uid().isBlank()) {
                    throw new FirebaseTokenVerificationException(
                            "Firebase ID Token sem UID", new IllegalArgumentException("uid ausente"));
                }
                String principal = firebaseToken.email() != null && !firebaseToken.email().isBlank()
                        ? firebaseToken.email()
                        : firebaseToken.uid();
                authenticate(principal, firebaseToken.role(), firebaseToken);
                chain.doFilter(request, response);
                return;
            } catch (RuntimeException exception) {
                // JWT legado pode continuar sendo usado durante a transição.
                log.debug("Token não foi validado pelo Firebase; tentando JWT legado");
            }
        }

        if (jwtService.isTokenValid(token)) {
            authenticate(jwtService.extractEmail(token), jwtService.extractRole(token), null);
            chain.doFilter(request, response);
            return;
        }

        log.warn("Token inválido recebido de IP: {}", request.getRemoteAddr());
        unauthorized(response);
    }

    private void authenticate(String principal, Object role, Object details) {
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(
                        principal,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + RoleUtils.normalizeRole(role)))
                );
        if (details != null) {
            auth.setDetails(details);
        }
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    private void unauthorized(HttpServletResponse response) throws IOException {
        SecurityContextHolder.clearContext();
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"erro\":\"Token inválido ou expirado\"}");
    }
}
