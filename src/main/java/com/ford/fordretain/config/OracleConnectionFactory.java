package com.ford.fordretain.config;

import com.ford.fordretain.exception.DatabaseException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;

import java.sql.Connection;
import java.sql.DriverManager;

@Component
@Profile("!local")
public class OracleConnectionFactory {

    @Value("${oracle.datasource.url}")
    private String url;

    @Value("${oracle.datasource.username}")
    private String username;

    @Value("${oracle.datasource.password}")
    private String password;

    @Value("${oracle.datasource.driver-class-name}")
    private String driverClassName;

    public Connection getConnection() {
        try {
            Class.forName(driverClassName);
            return DriverManager.getConnection(url, username, password);
        } catch (Exception e) {
            throw new DatabaseException("Erro ao conectar no banco Oracle", e);
        }
    }
}
