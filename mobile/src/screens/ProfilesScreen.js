import { ScrollView, Text, View } from 'react-native';
import ProfileBadge from '../components/ProfileBadge';
import RoleGuard from '../components/RoleGuard';
import styles from '../styles/screens/ProfilesScreen.styles';

const profiles = [
  {
    nome: 'Cliente Fiel',
    descricao: 'Alta aderência às revisões na rede autorizada.',
    comportamento: 'Agenda no prazo e valoriza experiência de atendimento.',
    risco: 'Baixo',
    estrategia: 'Fidelização premium com benefícios recorrentes.',
    exemplo: 'Rafael: compra recorrente, preferência pela concessionária e baixa sensibilidade a preço.',
  },
  {
    nome: 'Cliente Econômico',
    descricao: 'Sensível a preço e custo-benefício.',
    comportamento: 'Compara valores e tende a responder melhor a campanhas promocionais.',
    risco: 'Médio',
    estrategia: 'Combos promocionais, cupom de revisão e parcelamento de manutenção.',
    exemplo: 'Mariana: perfil com maior chance de retornar quando recebe incentivo financeiro.',
  },
  {
    nome: 'Cliente Esquecido',
    descricao: 'Baixa disciplina no calendário de revisão.',
    comportamento: 'Perde prazos por rotina corrida e precisa de lembretes simples.',
    risco: 'Médio',
    estrategia: 'Lembretes automáticos por WhatsApp, SMS e e-mail com agendamento rápido.',
    exemplo: 'Patrícia: histórico positivo, mas precisa de contato preventivo para não perder o timing.',
  },
  {
    nome: 'Cliente de Abandono',
    descricao: 'Alta tendência de evasão para oficinas independentes após a compra ou garantia.',
    comportamento: 'Baixo vínculo com a marca, maior sensibilidade a custo e menor recorrência esperada.',
    risco: 'Alto',
    estrategia: 'Contato consultivo imediato, pacote de revisões e proposta de recuperação.',
    exemplo: 'Ricardo: perfil crítico que exige ação rápida da concessionária.',
  },
];

export default function ProfilesScreen({ navigation }) {
  return (
    <RoleGuard
      navigation={navigation}
      allowedRoles={['ADMIN', 'GERENTE']}
      message="A tela de clustering é exclusiva para os perfis Administrador e Gerente."
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Clustering de Perfis</Text>
        <Text style={styles.subtitle}>Segmentação comportamental obtida na Base 1 para orientar a classificação e as campanhas de retenção.</Text>

        {profiles.map((profile) => (
          <View key={profile.nome} style={styles.card}>
            <ProfileBadge perfil={profile.nome} />
            <Text style={styles.row}><Text style={styles.label}>Descrição:</Text> {profile.descricao}</Text>
            <Text style={styles.row}><Text style={styles.label}>Comportamento:</Text> {profile.comportamento}</Text>
            <Text style={styles.row}><Text style={styles.label}>Risco:</Text> {profile.risco}</Text>
            <Text style={styles.row}><Text style={styles.label}>Estratégia de retenção:</Text> {profile.estrategia}</Text>
            <Text style={styles.row}><Text style={styles.label}>Exemplo:</Text> {profile.exemplo}</Text>
          </View>
        ))}

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>Como isso entra no modelo</Text>
          <Text style={styles.explanationRow}>Na etapa acadêmica, os perfis descobertos pelo clustering viram a variável-alvo da classificação. Depois, o app simula a previsão de novos clientes usando apenas dados da compra, sem usar dados pós-venda.</Text>
        </View>
      </ScrollView>
    </RoleGuard>
  );
}
