import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import PrimaryButton from '../components/PrimaryButton';
import AuthGuard from '../components/AuthGuard';
import ProfileBadge from '../components/ProfileBadge';
import RetryState from '../components/RetryState';
import colors from '../styles/colors';
import { getClientById } from '../services/api';
import styles from '../styles/screens/ClientDetailsScreen.styles';

export default function ClientDetailsScreen({ route, navigation }) {
  const routeClient = route.params?.client;
  const routeId = route.params?.id;
  const [client, setClient] = useState(routeClient || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => {
    setLoading(true);
    setReloadToken((value) => value + 1);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadClient() {
      const clientId = routeClient?.id || routeId;
      if (!clientId) {
        setLoading(false);
        setError('Não recebemos um cliente válido.');
        return;
      }

      try {
        const data = await getClientById(clientId);
        if (isMounted) setClient(data);
      } catch (requestError) {
        if (isMounted) setError(requestError?.message || 'Não foi possível carregar os detalhes do cliente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadClient();
    return () => { isMounted = false; };
  }, [routeClient?.id, routeId, reloadToken]);

  if (loading) {
    return (
      <AuthGuard navigation={navigation}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.fordBlue} />
          <Text style={styles.loadingText}>Carregando detalhes do cliente...</Text>
        </View>
      </AuthGuard>
    );
  }

  if (!client) {
    return (
      <AuthGuard navigation={navigation}>
        <View style={styles.container}>
          <RetryState title="Cliente não encontrado" message={error} onRetry={retry} />
          <PrimaryButton title="Voltar para a carteira" variant="secondary" onPress={() => navigation.navigate('Clients')} />
        </View>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard navigation={navigation}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{client.nome}</Text>
        <Text style={styles.subtitle}>{client.veiculo} • {client.regiao}</Text>

        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.decisionLabel}>Ação recomendada pela API</Text>
              <Text style={styles.decisionTitle}>{client.acaoRecomendada || 'Não informada'}</Text>
            </View>
            <View style={styles.riskBadge}>
              <Text style={styles.riskValue}>{client.riscoEvasao ?? '--'}%</Text>
              <Text style={styles.riskLabel}>{client.nivelRisco || 'Sem risco'}</Text>
            </View>
          </View>
          <Text style={styles.decisionText}>
            Prioridade: {client.prioridade || 'Não informada'}. Motivo: {client.motivoPriorizacao || 'Não informado'}.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Predição mais recente</Text>
          <ProfileBadge perfil={client.perfil || 'Não informado'} />
          <Text style={styles.row}><Text style={styles.label}>Perfil:</Text> {client.perfil || 'Não informado'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Probabilidade:</Text> {client.probabilidadePerfil ?? '--'}%</Text>
          <Text style={styles.row}><Text style={styles.label}>Data da predição:</Text> {client.dataPredicao || 'Não informada'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Fatores:</Text> {client.fatoresRisco?.join(', ') || 'Não informados'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Contato</Text>
          <Text style={styles.row}><Text style={styles.label}>E-mail:</Text> {client.email || 'Não informado'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Telefone:</Text> {client.telefone || 'Não informado'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Região:</Text> {client.regiao || 'Não informada'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Dados da compra</Text>
          <Text style={styles.row}><Text style={styles.label}>Idade:</Text> {client.idade ?? '--'} anos</Text>
          <Text style={styles.row}><Text style={styles.label}>Modelo:</Text> {client.modelo || client.veiculo}</Text>
          <Text style={styles.row}><Text style={styles.label}>Forma de pagamento:</Text> {client.formaPagamento || 'Não informada'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Canal:</Text> {client.canalCompra || 'Não informado'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Histórico Ford:</Text> {client.historicoMarca || 'Não informado'}</Text>
          <Text style={styles.row}><Text style={styles.label}>Data da compra:</Text> {client.dataCompra || 'Não informada'}</Text>
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Ações comerciais</Text>
          <Text style={styles.noteText}>O backend ainda não possui um endpoint para registrar contato ou campanha. Por isso, o aplicativo mostra a recomendação sem simular uma persistência que não existe.</Text>
        </View>
      </ScrollView>
    </AuthGuard>
  );
}
