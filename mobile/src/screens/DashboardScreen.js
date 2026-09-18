import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import RoleGuard from '../components/RoleGuard';
import AppLogo from '../components/AppLogo';
import RetryState from '../components/RetryState';
import colors from '../styles/colors';
import { getDashboard } from '../services/api';
import styles from '../styles/screens/DashboardScreen.styles';

function MetricCard({ title, value, subtitle, tone = 'blue' }) {
  return (
    <View style={[styles.metricCard, styles[`metric_${tone}`]]}>
      <Text style={styles.metricTitle}>{title}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSubtitle}>{subtitle}</Text>
    </View>
  );
}

function ActionButton({ title, onPress, variant = 'primary' }) {
  return (
    <Pressable style={[styles.actionButton, variant === 'secondary' && styles.actionButtonSecondary]} onPress={onPress}>
      <Text style={[styles.actionButtonText, variant === 'secondary' && styles.actionButtonTextSecondary]}>{title}</Text>
    </Pressable>
  );
}

function TabButton({ label, active, onPress }) {
  return (
    <Pressable style={[styles.tabButton, active && styles.tabButtonActive]} onPress={onPress}>
      <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function getBarColor(type, label) {
  if (type === 'risk') {
    if (label === 'Alto') return colors.riskRed;
    if (label === 'Médio') return colors.warningYellow;
    return colors.successGreen;
  }

  if (type === 'profile') {
    if (label === 'Cliente Fiel') return colors.successGreen;
    if (label === 'Cliente Econômico') return colors.warningYellow;
    if (label === 'Cliente Esquecido') return colors.fordBlue;
    if (label === 'Cliente de Abandono') return colors.riskRed;
  }

  return colors.fordBlue;
}

function getChartCtaText(type) {
  if (type === 'risk') {
    return {
      title: 'Carteira priorizada por risco',
      description: 'Acesse a lista de clientes ordenada por criticidade para decidir quem deve receber contato primeiro.',
      button: 'Ver carteira priorizada',
    };
  }

  if (type === 'profile') {
    return {
      title: 'Perfis comportamentais da carteira',
      description: 'Use a lista de clientes para analisar perfis, ações recomendadas e oportunidades de retenção.',
      button: 'Ver carteira de clientes',
    };
  }

  return {
    title: 'Oportunidades por região',
    description: 'Use a carteira de clientes para investigar regiões com menor retenção e priorizar ações comerciais.',
    button: 'Ver carteira de clientes',
  };
}

function StaticChart({ title, subtitle, data = [], type = 'default', suffix = '', onOpenClients }) {
  const normalized = data || [];
  const maxValue = Math.max(...normalized.map((item) => Number(item.value || 0)), 1);
  const cta = getChartCtaText(type);

  return (
    <View style={styles.chartCard}>
      <Text style={styles.chartTitle}>{title}</Text>
      <Text style={styles.chartSubtitle}>{subtitle}</Text>

      <View style={styles.chartList}>
        {normalized.map((item) => {
          const value = Number(item.value || 0);
          const width = type === 'default' ? `${Math.max(10, value)}%` : `${Math.max(10, (value / maxValue) * 100)}%`;
          const color = getBarColor(type, item.label);

          return (
            <View key={item.label} style={styles.chartItem}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartLabel}>{item.label}</Text>
                <Text style={[styles.chartValue, { color }]}>
                  {item.value}
                  {suffix}
                </Text>
              </View>

              <View style={styles.chartTrack}>
                <View style={[styles.chartFill, { width, backgroundColor: color }]} />
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.chartCtaBox}>
        <Text style={styles.chartCtaTitle}>{cta.title}</Text>
        <Text style={styles.chartCtaDescription}>{cta.description}</Text>

        <Pressable style={styles.chartCtaButton} onPress={onOpenClients}>
          <Text style={styles.chartCtaButtonText}>{cta.button}</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default function DashboardScreen({ navigation }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeChart, setActiveChart] = useState('vin');
  const [reloadToken, setReloadToken] = useState(0);

  const retry = useCallback(() => setReloadToken((value) => value + 1), []);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError('');
      try {
        const data = await getDashboard();
        setDashboard(data);
      } catch (requestError) {
        setError(requestError?.message || 'Não foi possível carregar o dashboard.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [reloadToken]);

  const chartConfig = useMemo(() => {
    if (!dashboard) return null;

    const options = {
      vin: {
        title: 'VIN Share por região',
        subtitle: 'Mostra onde a rede Ford está retendo melhor seus clientes.',
        data: dashboard.vinSharePorRegiao,
        type: 'default',
        suffix: '%',
      },
      risk: {
        title: 'Clientes por nível de risco',
        subtitle: 'Indica a distribuição da carteira por criticidade.',
        data: dashboard.riscoPorNivel,
        type: 'risk',
        suffix: '',
      },
      profile: {
        title: 'Distribuição por perfil',
        subtitle: 'Mostra o comportamento previsto da base de clientes.',
        data: dashboard.clientesPorPerfil,
        type: 'profile',
        suffix: '',
      },
    };

    return options[activeChart];
  }, [dashboard, activeChart]);

  if (loading) {
    return (
      <RoleGuard navigation={navigation} allowedRoles={['ADMIN', 'GERENTE']} message="O dashboard executivo é exclusivo para os perfis Administrador e Gerente.">
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.fordBlue} />
          <Text style={styles.loadingText}>Carregando painel executivo...</Text>
        </View>
      </RoleGuard>
    );
  }

  if (!dashboard) {
    return (
      <RoleGuard navigation={navigation} allowedRoles={['ADMIN', 'GERENTE']} message="O dashboard executivo é exclusivo para os perfis Administrador e Gerente.">
        <View style={styles.loadingContainer}>
          <RetryState title="Dashboard indisponível" message={error || 'Não foi possível carregar os indicadores.'} onRetry={retry} />
          <ActionButton title="Voltar para Home" onPress={() => navigation.navigate('Home')} />
        </View>
      </RoleGuard>
    );
  }

  const alertMessage =
    dashboard.highRisk > 0
      ? `${dashboard.highRisk} cliente(s) exigem ação prioritária ainda hoje.`
      : 'Nenhum cliente em risco alto no momento.';

  return (
    <RoleGuard navigation={navigation} allowedRoles={['ADMIN', 'GERENTE']} message="O dashboard executivo é exclusivo para os perfis Administrador e Gerente.">
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <AppLogo small light />

            <View style={styles.heroBadge}>
              <Text style={styles.heroBadgeText}>Painel executivo</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>FordRetain</Text>
          <Text style={styles.heroSubtitle}>Retenção preditiva para apoiar decisões de pós-venda e aumentar o VIN Share.</Text>

          <View style={styles.heroHighlight}>
            <View style={styles.heroHighlightItem}>
              <Text style={styles.heroHighlightValue}>{dashboard.vinShareEstimado}%</Text>
              <Text style={styles.heroHighlightLabel}>VIN Share estimado</Text>
            </View>

            <View style={styles.heroDivider} />

            <View style={styles.heroHighlightItem}>
              <Text style={styles.heroHighlightValue}>{dashboard.highRisk}</Text>
              <Text style={styles.heroHighlightLabel}>clientes críticos</Text>
            </View>
          </View>

          <View style={styles.heroAlert}>
            <Text style={styles.heroAlertText}>{alertMessage}</Text>
          </View>

          <View style={styles.heroActions}>
            <ActionButton title="Ver clientes críticos" onPress={() => navigation.navigate('Clients')} />
            <ActionButton title="Classificação preditiva" variant="secondary" onPress={() => navigation.navigate('Prediction')} />
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <MetricCard title="Total de clientes" value={String(dashboard.total)} subtitle="base atual" tone="blue" />
          <MetricCard title="Risco alto" value={String(dashboard.highRisk)} subtitle="ação imediata" tone="red" />
          <MetricCard title="Perfis" value={String(dashboard.clientesPorPerfil.length)} subtitle="categorias na base" tone="yellow" />
          <MetricCard title="Regiões" value={String(dashboard.vinSharePorRegiao.length)} subtitle="com VIN Share" tone="purple" />
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Visão analítica</Text>
          <Text style={styles.sectionSubtitle}>Escolha uma visão para analisar a carteira e acessar os clientes priorizados.</Text>

          <View style={styles.tabsRow}>
            <TabButton label="VIN Share" active={activeChart === 'vin'} onPress={() => setActiveChart('vin')} />
            <TabButton label="Risco" active={activeChart === 'risk'} onPress={() => setActiveChart('risk')} />
            <TabButton label="Perfis" active={activeChart === 'profile'} onPress={() => setActiveChart('profile')} />
          </View>

          {chartConfig && (
            <StaticChart
              title={chartConfig.title}
              subtitle={chartConfig.subtitle}
              data={chartConfig.data}
              type={chartConfig.type}
              suffix={chartConfig.suffix}
              onOpenClients={() => navigation.navigate('Clients')}
            />
          )}
        </View>
      </ScrollView>
    </RoleGuard>
  );
}
