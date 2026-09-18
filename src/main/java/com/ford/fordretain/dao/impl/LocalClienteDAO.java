package com.ford.fordretain.dao.impl;

import com.ford.fordretain.config.LocalVisualDataStore;
import com.ford.fordretain.dao.ClienteDAO;
import com.ford.fordretain.model.Cliente;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
@Profile("local")
@RequiredArgsConstructor
public class LocalClienteDAO implements ClienteDAO {
    private final LocalVisualDataStore store;

    @Override public Cliente save(Cliente cliente) {
        long id = store.clienteSequence().incrementAndGet();
        LocalDateTime agora = LocalDateTime.now();
        cliente.setId(id); cliente.setCriadoEm(agora); cliente.setAtualizadoEm(agora);
        store.clientes().put(id, cliente);
        return cliente;
    }
    @Override public boolean existsByEmail(String email) { return store.clientes().values().stream().anyMatch(c -> c.getEmail().equalsIgnoreCase(email)); }
    @Override public Optional<Cliente> findByEmail(String email) { return store.clientes().values().stream().filter(c -> c.getEmail().equalsIgnoreCase(email)).findFirst(); }
    @Override public Optional<Cliente> findById(Long id) { return Optional.ofNullable(store.clientes().get(id)); }
    @Override public Cliente update(Cliente cliente) { cliente.setAtualizadoEm(LocalDateTime.now()); store.clientes().put(cliente.getId(), cliente); return cliente; }
    @Override public boolean deleteById(Long id) { return store.clientes().remove(id) != null; }
    @Override public long count() { return store.clientes().size(); }
}
