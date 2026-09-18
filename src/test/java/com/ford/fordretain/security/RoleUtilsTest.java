package com.ford.fordretain.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RoleUtilsTest {

    @Test
    void aceitaSomenteRolesSuportadas() {
        assertThat(RoleUtils.normalizeRole("ADMIN")).isEqualTo("ADMIN");
        assertThat(RoleUtils.normalizeRole("GERENTE")).isEqualTo("GERENTE");
        assertThat(RoleUtils.normalizeRole("ANALISTA")).isEqualTo("ANALISTA");
    }

    @Test
    void roleAusenteOuDesconhecidaRecebeMenorPrivilegio() {
        assertThat(RoleUtils.normalizeRole(null)).isEqualTo("ANALISTA");
        assertThat(RoleUtils.normalizeRole("DIRETOR")).isEqualTo("ANALISTA");
        assertThat(RoleUtils.normalizeRole(123)).isEqualTo("ANALISTA");
    }
}
