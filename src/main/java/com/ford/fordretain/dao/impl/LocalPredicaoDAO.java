package com.ford.fordretain.dao.impl;

import com.ford.fordretain.config.LocalVisualDataStore;
import com.ford.fordretain.dao.PredicaoDAO;
import com.ford.fordretain.model.Cliente;
import com.ford.fordretain.model.Predicao;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
@Profile("local")
@RequiredArgsConstructor
public class LocalPredicaoDAO implements PredicaoDAO {
    private final LocalVisualDataStore store;

    @Override public Predicao save(Predicao predicao) {
        predicao.setId(store.predicaoSequence().incrementAndGet());
        predicao.setDataPredicao(LocalDateTime.now());
        store.predicoes().add(predicao);
        return predicao;
    }
    @Override public Optional<Predicao> findTopByClienteIdOrderByDataPredicaoDesc(Long clienteId) { return store.predicoes().stream().filter(p -> p.getCliente().getId().equals(clienteId)).max(Comparator.comparing(Predicao::getDataPredicao)); }
    @Override public List<Predicao> findLeadsEmRisco(int scoreMinimo) { return store.predicoes().stream().filter(p -> p.getScoreRisco() >= scoreMinimo).sorted(Comparator.comparing(Predicao::getScoreRisco).reversed()).toList(); }
    @Override public Map<String, Long> countByPerfil() { return store.predicoes().stream().collect(Collectors.groupingBy(Predicao::getPerfilPrevisto, LinkedHashMap::new, Collectors.counting())); }
    @Override public Map<String, Double> vinSharePorRegiao() { return aggregate(""); }
    @Override public Map<String, Double> vinSharePorModelo() { return aggregate("modelo"); }

    private Map<String, Double> aggregate(String by) {
        Map<String, List<Predicao>> groups = store.predicoes().stream().collect(Collectors.groupingBy(p -> {
            Cliente c = p.getCliente();
            return "modelo".equals(by) ? c.getModeloVeiculo() : c.getRegiao();
        }, LinkedHashMap::new, Collectors.toList()));
        Map<String, Double> result = new LinkedHashMap<>();
        groups.forEach((key, values) -> result.put(key, values.stream().filter(this::isRetained).count() / (double) values.size()));
        return result;
    }

    private boolean isRetained(Predicao p) { return "FIEL".equals(p.getPerfilPrevisto()) || "ECONOMICO".equals(p.getPerfilPrevisto()); }
}
