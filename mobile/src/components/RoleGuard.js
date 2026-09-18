import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import PrimaryButton from './PrimaryButton';
import colors from '../styles/colors';
import { radius, spacing, font } from '../styles/tokens';
import useAuth from '../hooks/useAuth';
import AppShell from './AppShell';

export default function RoleGuard({ allowedRoles, navigation, children, message }) {
  const { user, loading, logout } = useAuth();
  const hasAccess = user && allowedRoles.includes(user.role);

  async function goToLogin() {
    await logout();
    navigation.replace('Login');
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.fordBlue} />
      </View>
    );
  }

  if (hasAccess) {
    return <AppShell navigation={navigation}>{children}</AppShell>;
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Sessão expirada</Text>
          <Text style={styles.message}>
            Não encontramos um usuário logado. Faça login novamente para recuperar o perfil correto.
          </Text>
          <PrimaryButton title="Voltar ao Login" onPress={goToLogin} />
        </View>
      </View>
    );
  }

  return (
    <AppShell navigation={navigation}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Acesso restrito</Text>
          <Text style={styles.message}>
            {message || 'Esta tela está disponível apenas para perfis autorizados.'}
          </Text>
          <Text style={styles.profile}>Perfil atual: {user.role}</Text>
          <PrimaryButton title="Ir para clientes" onPress={() => navigation.navigate('Clients')} />
          <PrimaryButton title="Voltar para Home" variant="secondary" onPress={() => navigation.navigate('Home')} />
          <PrimaryButton title="Sair e voltar ao Login" variant="secondary" onPress={goToLogin} />
        </View>
      </View>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.md, justifyContent: 'center' },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  title: { color: colors.navy, fontSize: font.size.xxl, fontWeight: font.weight.bold, marginBottom: spacing.xs },
  message: { color: '#334155', lineHeight: 21, marginBottom: spacing.xs },
  profile: { color: colors.fordBlue, fontWeight: font.weight.bold, marginBottom: spacing.sm },
});
