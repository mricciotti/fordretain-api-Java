package com.ford.fordretain.security;

import java.util.Locale;

public final class RoleUtils {

    public static final String DEFAULT_ROLE = "ANALISTA";

    private RoleUtils() {
    }

    /**
     * Claims são dados externos: somente as três roles suportadas podem virar
     * authorities. Qualquer valor ausente ou desconhecido recebe o fallback
     * menos privilegiado.
     */
    public static String normalizeRole(Object role) {
        if (role instanceof String roleValue) {
            String normalized = roleValue.trim().toUpperCase(Locale.ROOT);
            if (normalized.equals("ADMIN")
                    || normalized.equals("GERENTE")
                    || normalized.equals("ANALISTA")) {
                return normalized;
            }
        }
        return DEFAULT_ROLE;
    }
}
