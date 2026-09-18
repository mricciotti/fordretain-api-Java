import { ScrollView, Text, View, Pressable } from 'react-native';
import AuthGuard from '../components/AuthGuard';
import styles from '../styles/screens/RecommendationsScreen.styles';

const campaigns = [
  { id: 'fidelidade', titulo: 'Programa de fidelidade', publico: 'Clientes Fiéis', objetivo: 'Manter recorrência e aumentar satisfação', acao: 'Benefícios exclusivos, revisão premium e prioridade de atendimento', canal: 'App + e-mail', prazo: 'Mensal', impacto: 'Defesa do VIN Share', prioridade: 'Baixa' },
  { id: 'cupom', titulo: 'Cupom de revisão', publico: 'Clientes Econômicos', objetivo: 'Aumentar retorno imediato', acao: 'Desconto progressivo com validade de 15 dias', canal: 'WhatsApp e SMS', prazo: '48 horas', impacto: '+12% agendamentos', prioridade: 'Média' },
  { id: 'lembrete', titulo: 'Lembrete com agendamento fácil', publico: 'Clientes Esquecidos', objetivo: 'Evitar perda do timing da revisão', acao: 'Mensagem com link de agendamento em um clique', canal: 'WhatsApp + push', prazo: '7 dias antes', impacto: 'Menos atrasos', prioridade: 'Média' },
  { id: 'recuperacao', titulo: 'Pacote de recuperação', publico: 'Clientes de Abandono', objetivo: 'Evitar evasão para oficinas independentes', acao: 'Ligação consultiva com pacote de revisões e diagnóstico', canal: 'Telefone + CRM', prazo: 'Hoje', impacto: '-18% risco crítico', prioridade: 'Alta' },
];

export default function RecommendationsScreen({ navigation }) {
  return (
    <AuthGuard navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}><Text style={styles.kicker}>PLAYBOOK DE RETENÇÃO</Text><Text style={styles.title}>Próxima melhor ação</Text><Text style={styles.subtitle}>Orientações para transformar o diagnóstico em uma conversa relevante com o cliente.</Text></View>
        <View style={styles.noteCard}><View style={styles.noteTop}><View style={styles.noteMark}><Text style={styles.noteMarkText}>i</Text></View><Text style={styles.noteTitle}>Como usar</Text></View><Text style={styles.noteText}>Estas estratégias são referências de atendimento. O app não registra campanhas nem afirma que um contato foi realizado.</Text></View>

        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Estratégias por perfil</Text><Text style={styles.sectionCode}>04 ROTAS</Text></View>
        {campaigns.map((item, index) => (
          <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}><View style={styles.number}><Text style={styles.numberText}>{String(index + 1).padStart(2, '0')}</Text></View><View style={styles.cardTitleBlock}><Text style={styles.cardTitle}>{item.titulo}</Text><Text style={styles.cardAudience}>{item.publico}</Text></View><Text style={[styles.priorityText, item.prioridade === 'Alta' && styles.priorityHigh]}>{item.prioridade}</Text></View>
            <View style={styles.impactRow}><Text style={styles.impactLabel}>OBJETIVO</Text><Text style={styles.impactText}>{item.impacto}</Text></View>
            <Text style={styles.row}><Text style={styles.label}>Direção: </Text>{item.acao}</Text>
            <View style={styles.metaRow}><Text style={styles.metaItem}>{item.canal}</Text><Text style={styles.metaItem}>Prazo: {item.prazo}</Text></View>
            <Pressable style={styles.openButton} onPress={() => navigation.navigate('Clients')}><Text style={styles.openButtonText}>Encontrar clientes desse perfil</Text><Text style={styles.arrow}>→</Text></Pressable>
          </View>
        ))}
      </ScrollView>
    </AuthGuard>
  );
}
