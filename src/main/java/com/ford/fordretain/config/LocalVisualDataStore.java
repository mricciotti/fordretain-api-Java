package com.ford.fordretain.config;

import com.ford.fordretain.model.Cliente;
import com.ford.fordretain.model.Predicao;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Component
@Profile("local")
public class LocalVisualDataStore {
    private final AtomicLong clienteSequence = new AtomicLong(6);
    private final AtomicLong predicaoSequence = new AtomicLong(6);
    private final Map<Long, Cliente> clientes = new ConcurrentHashMap<>();
    private final List<Predicao> predicoes = new ArrayList<>();

    public LocalVisualDataStore() {
        LocalDateTime agora = LocalDateTime.now();
        addCliente(1L, "Ana Costa", "ana.costa@ford.com", "11988887777", "São Paulo", 38, "CONCESSIONARIA", "FINANCIAMENTO", "Territory", "RECOMPRA", agora);
        addCliente(2L, "Bruno Martins", "bruno.martins@ford.com", "21977776666", "Rio de Janeiro", 45, "ONLINE", "FINANCIAMENTO", "Ranger", "PRIMEIRA_COMPRA", agora);
        addCliente(3L, "Carla Souza", "carla.souza@ford.com", "31966665555", "Minas Gerais", 34, "CONCESSIONARIA", "CONSORCIO", "Maverick", "PRIMEIRA_COMPRA", agora);
        addCliente(4L, "Diego Almeida", "diego.almeida@ford.com", "41955554444", "Paraná", 51, "CONCESSIONARIA", "A_VISTA", "Bronco", "RECOMPRA", agora);
        addCliente(5L, "Elisa Rocha", "elisa.rocha@ford.com", "51944443333", "Rio Grande do Sul", 42, "ONLINE", "FINANCIAMENTO", "Territory", "PRIMEIRA_COMPRA", agora);
        addCliente(6L, "Felipe Nunes", "felipe.nunes@ford.com", "61933332222", "Distrito Federal", 29, "CONCESSIONARIA", "CONSORCIO", "Ranger", "PRIMEIRA_COMPRA", agora);

        addPredicao(1L, 1L, "FIEL", "0.6500", "0.0800", "0.1200", "0.1500", 18, "Programa de fidelidade premium — oferecer revisão com desconto exclusivo.", agora);
        addPredicao(2L, 2L, "ABANDONO", "0.0800", "0.6800", "0.1500", "0.0900", 88, "Contato imediato — pacote de 3 revisões com desconto progressivo.", agora);
        addPredicao(3L, 3L, "ESQUECIDO", "0.1500", "0.1000", "0.6000", "0.1500", 62, "Enviar lembrete com agendamento fácil e link direto para a concessionária.", agora);
        addPredicao(4L, 4L, "FIEL", "0.6500", "0.0800", "0.1200", "0.1500", 22, "Programa de fidelidade premium — oferecer revisão com desconto exclusivo.", agora);
        addPredicao(5L, 5L, "ABANDONO", "0.0800", "0.6800", "0.1500", "0.0900", 76, "Contato imediato — pacote de 3 revisões com desconto progressivo.", agora);
        addPredicao(6L, 6L, "ECONOMICO", "0.2000", "0.1500", "0.1500", "0.5000", 45, "Enviar cupom de desconto de 20% na próxima revisão agendada.", agora);
    }

    private void addCliente(Long id, String nome, String email, String telefone, String regiao, int idade, String canal, String pagamento, String modelo, String historico, LocalDateTime agora) {
        clientes.put(id, Cliente.builder().id(id).nome(nome).email(email).telefone(telefone).regiao(regiao).idade(idade).canalCompra(canal).formaPagamento(pagamento).modeloVeiculo(modelo).historicoMarca(historico).dataCompra(LocalDate.now().minusMonths(id.intValue() * 3L)).criadoEm(agora).atualizadoEm(agora).build());
    }

    private void addPredicao(Long id, Long clienteId, String perfil, String fiel, String abandono, String esquecido, String economico, int risco, String acao, LocalDateTime agora) {
        predicoes.add(Predicao.builder().id(id).cliente(clientes.get(clienteId)).perfilPrevisto(perfil).probFiel(new BigDecimal(fiel)).probAbandono(new BigDecimal(abandono)).probEsquecido(new BigDecimal(esquecido)).probEconomico(new BigDecimal(economico)).scoreRisco(risco).acaoSugerida(acao).dataPredicao(agora.minusDays(id)).build());
    }

    public Map<Long, Cliente> clientes() { return clientes; }
    public List<Predicao> predicoes() { return predicoes; }
    public AtomicLong clienteSequence() { return clienteSequence; }
    public AtomicLong predicaoSequence() { return predicaoSequence; }
}
