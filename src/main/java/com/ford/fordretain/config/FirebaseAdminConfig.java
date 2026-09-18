package com.ford.fordretain.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.ford.fordretain.security.FirebaseTokenVerificationException;
import com.ford.fordretain.security.FirebaseTokenVerifier;
import com.ford.fordretain.security.FirebaseUserToken;
import com.ford.fordretain.security.RoleUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
@ConditionalOnProperty(name = "firebase.enabled", havingValue = "true")
public class FirebaseAdminConfig {

    @Bean
    public FirebaseApp firebaseApp(@Value("${firebase.project-id:}") String projectId) throws IOException {
        if (!FirebaseApp.getApps().isEmpty()) {
            return FirebaseApp.getInstance();
        }

        FirebaseOptions.Builder options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.getApplicationDefault());

        if (projectId != null && !projectId.isBlank()) {
            options.setProjectId(projectId.trim());
        }

        return FirebaseApp.initializeApp(options.build());
    }

    @Bean
    public FirebaseTokenVerifier firebaseTokenVerifier(FirebaseApp firebaseApp) {
        FirebaseAuth firebaseAuth = FirebaseAuth.getInstance(firebaseApp);

        return token -> {
            try {
                FirebaseToken decodedToken = firebaseAuth.verifyIdToken(token);
                Object claimRole = decodedToken.getClaims().get("role");
                return new FirebaseUserToken(
                        decodedToken.getUid(),
                        decodedToken.getEmail(),
                        RoleUtils.normalizeRole(claimRole));
            } catch (FirebaseAuthException | RuntimeException exception) {
                throw new FirebaseTokenVerificationException(
                        "Firebase ID Token inválido ou expirado", exception);
            }
        };
    }
}
