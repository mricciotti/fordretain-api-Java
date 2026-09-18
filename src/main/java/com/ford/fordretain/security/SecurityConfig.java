package com.ford.fordretain.security;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final ObjectProvider<JwtAuthFilter> jwtAuthFilterProvider;
    private final ObjectProvider<LocalVisualAuthFilter> localVisualAuthFilterProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(authenticationEntryPoint()))
                .authorizeHttpRequests(auth -> auth
                        // Libera OPTIONS para preflight do browser
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        // Libera o forward interno do Spring Boot para montar respostas de erro.
                        // Sem isso, um 403/500 legítimo é reprocessado pela cadeia de segurança
                        // como uma segunda requisição anônima e acaba virando 401 por engano.
                        .requestMatchers("/error").permitAll()
                        // Health check público — necessário para orquestradores/monitoramento
                        // (K8s, load balancer) verificarem se a aplicação está no ar.
                        .requestMatchers("/actuator/health/**").permitAll()
                        .requestMatchers("/actuator/**").hasRole("ADMIN")
                        // Endpoints públicos
                        .requestMatchers("/api/v1/auth/login").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/api-docs/**").permitAll()
                        // RBAC por perfil
                        .requestMatchers(HttpMethod.POST, "/api/v1/predict").hasAnyRole("ADMIN", "GERENTE")
                        .requestMatchers(HttpMethod.GET, "/api/v1/dashboard").hasAnyRole("ADMIN", "GERENTE")
                        .requestMatchers(HttpMethod.GET, "/api/v1/leads").hasAnyRole("ADMIN", "GERENTE", "ANALISTA")
                        .requestMatchers(HttpMethod.GET, "/api/v1/clientes/**").hasAnyRole("ADMIN", "GERENTE", "ANALISTA")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/clientes/**").hasAnyRole("ADMIN", "GERENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/clientes/**").hasRole("ADMIN")
                        // Qualquer outra rota autenticada
                        .anyRequest().authenticated()
                )
                ;

        JwtAuthFilter jwtAuthFilter = jwtAuthFilterProvider.getIfAvailable();
        LocalVisualAuthFilter localVisualAuthFilter = localVisualAuthFilterProvider.getIfAvailable();
        if (jwtAuthFilter != null) {
            http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }
        if (localVisualAuthFilter != null) {
            http.addFilterBefore(localVisualAuthFilter, UsernamePasswordAuthenticationFilter.class);
        }

        return http.build();
    }

    @Bean
    @org.springframework.context.annotation.Profile("!local")
    public FilterRegistrationBean<JwtAuthFilter> jwtAuthFilterRegistration(JwtAuthFilter filter) {
        // JwtAuthFilter é @Component, então o Spring Boot o registraria automaticamente
        // como um filtro Servlet genérico (rodando em TODA requisição, fora de ordem),
        // além de já estar explicitamente na cadeia do Spring Security via addFilterBefore
        // logo abaixo. Isso causava dupla execução do mesmo OncePerRequestFilter na mesma
        // requisição, o que podia corromper o SecurityContext e gerar 401 em vez de 403
        // para requisições com role incorreta. Desabilita o registro automático aqui.
        FilterRegistrationBean<JwtAuthFilter> registration = new FilterRegistrationBean<>(filter);
        registration.setEnabled(false);
        return registration;
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        // Sem isso, o Spring Security devolve 403 (Forbidden) por padrão para
        // requisições SEM nenhum token. O correto é 401 (Unauthorized) — "eu não
        // sei quem você é" — reservando o 403 para quando o token é válido mas
        // a role não tem permissão (tratado no JwtAuthFilter/AuthorizationFilter).
        return (request, response, authException) -> {
            response.setStatus(401);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("{\"erro\":\"Não autenticado — token ausente ou inválido\"}");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(false);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
