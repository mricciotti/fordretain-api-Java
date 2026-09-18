import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import { usePathname } from 'expo-router';
import colors from '../styles/colors';
import { radius, spacing, font, shadow } from '../styles/tokens';
import useAuth from '../hooks/useAuth';
import useApiHealth from '../hooks/useApiHealth';
import AppLogo from './AppLogo';

const TOP_LEVEL_PATHS = ['/home', '/clients'];

const HEALTH_META = {
  checking: { label: 'verificando', color: colors.muted },
  online: { label: 'online', color: colors.successGreen },
  offline: { label: 'offline', color: colors.riskRed },
};

const ROUTE_META = {
  '/home': { title: 'Visão geral', subtitle: 'O que merece atenção agora' },
  '/dashboard': { title: 'Controle', subtitle: 'Indicadores da operação' },
  '/clients': { title: 'Carteira', subtitle: 'Clientes ordenados por risco' },
  '/client-details': { title: 'Cliente', subtitle: 'Contexto para a próxima decisão' },
  '/recommendations': { title: 'Ações', subtitle: 'Orientações para retenção' },
  '/prediction': { title: 'Classificar', subtitle: 'Simular um novo perfil' },
  '/profiles': { title: 'Perfis', subtitle: 'Padrões de comportamento' },
};

function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return `${parts[0]?.[0] || 'F'}${parts[1]?.[0] || 'R'}`.toUpperCase();
}

function TabItem({ item, active, onPress }) {
  return (
    <Pressable style={({ pressed }) => [styles.tabItem, active && styles.tabItemActive, pressed && styles.tabItemPressed]} onPress={onPress}>
      <View style={[styles.tabMark, active && styles.tabMarkActive]} />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{item.label}</Text>
    </Pressable>
  );
}

export default function AppShell({ navigation, children }) {
  const pathname = usePathname();
  const [panelVisible, setPanelVisible] = useState(false);
  const { user, logout } = useAuth();
  const health = useApiHealth();
  const isManager = ['ADMIN', 'GERENTE'].includes(user?.role);
  const meta = ROUTE_META[pathname] || { title: 'FordRetain', subtitle: 'Retenção inteligente' };
  const healthMeta = HEALTH_META[health] || HEALTH_META.checking;
  const showBack = !TOP_LEVEL_PATHS.includes(pathname) && navigation?.canGoBack?.();

  const tabs = [
    { label: 'Visão', screen: 'Home', path: '/home' },
    { label: 'Carteira', screen: 'Clients', path: '/clients' },
    { label: 'Mais', screen: 'More', path: '/more' },
  ];

  const tools = [
    ...(isManager ? [
      { label: 'Controle executivo', caption: 'KPIs e VIN Share', screen: 'Dashboard' },
      { label: 'Classificar cliente', caption: 'Simular perfil', screen: 'Prediction' },
      { label: 'Perfis comportamentais', caption: 'Padrões da carteira', screen: 'Profiles' },
    ] : []),
    { label: 'Orientações de retenção', caption: 'Próximas melhores ações', screen: 'Recommendations' },
  ];

  async function handleLogout() {
    setPanelVisible(false);
    await logout();
    navigation.replace('Login');
  }

  return (
    <View style={styles.shell}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {showBack ? (
              <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
                <Text style={styles.backIcon}>‹</Text>
              </Pressable>
            ) : null}
            <AppLogo small />
          </View>
          <Pressable style={styles.accountButton} onPress={() => setPanelVisible(true)}>
            <Text style={styles.accountInitials}>{getInitials(user?.name)}</Text>
          </Pressable>
        </View>
        <View style={styles.headerTitleRow}>
          <View>
            <Text style={styles.headerTitle}>{meta.title}</Text>
            <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
          </View>
          <View style={styles.liveStatus}>
            <View style={[styles.liveDot, { backgroundColor: healthMeta.color }]} />
            <Text style={[styles.liveText, { color: healthMeta.color }]}>{healthMeta.label}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.tabBar}>
        {tabs.map((item) => (
          <TabItem
            key={item.path}
            item={item}
            active={item.path === '/more' ? !TOP_LEVEL_PATHS.includes(pathname) : pathname === item.path}
            onPress={() => item.screen === 'More' ? setPanelVisible(true) : navigation.replace(item.screen)}
          />
        ))}
      </View>

      <Modal visible={panelVisible} transparent animationType="slide" onRequestClose={() => setPanelVisible(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPanelVisible(false)} />
          <View style={styles.panel}>
            <View style={styles.panelGrabber} />
            <View style={styles.panelHeader}>
              <View style={styles.panelAvatar}><Text style={styles.panelAvatarText}>{getInitials(user?.name)}</Text></View>
              <View style={styles.panelUserBlock}>
                <Text style={styles.panelName}>{user?.name || 'Usuário FordRetain'}</Text>
                <Text style={styles.panelEmail}>{user?.email || 'Conta local'}</Text>
                <Text style={styles.panelRole}>{user?.role || 'Perfil não identificado'}</Text>
              </View>
            </View>

            <Text style={styles.panelSectionTitle}>Ferramentas</Text>
            <View style={styles.toolList}>
              {tools.map((item, index) => (
                <Pressable key={item.screen} style={styles.toolItem} onPress={() => { setPanelVisible(false); navigation.navigate(item.screen); }}>
                  <Text style={styles.toolIndex}>{String(index + 1).padStart(2, '0')}</Text>
                  <View style={styles.toolText}><Text style={styles.toolLabel}>{item.label}</Text><Text style={styles.toolCaption}>{item.caption}</Text></View>
                  <Text style={styles.toolArrow}>→</Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.logoutItem} onPress={handleLogout}>
              <Text style={styles.logoutText}>Encerrar sessão</Text><Text style={styles.logoutArrow}>↗</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
    ...shadow.sm,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  backButton: { width: 32, height: 32, borderRadius: radius.sm, backgroundColor: colors.lightBlue, alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: colors.navy, fontSize: 20, fontWeight: font.weight.black, marginTop: -2 },
  accountButton: { width: 36, height: 36, borderRadius: radius.pill, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.electricBlue },
  accountInitials: { color: colors.electricBlue, fontWeight: font.weight.black, fontSize: 11 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  headerTitle: { color: colors.navy, fontWeight: font.weight.black, fontSize: font.size.xxl, letterSpacing: font.tracking.tight },
  headerSubtitle: { color: colors.textGray, fontWeight: font.weight.regular, fontSize: font.size.sm, marginTop: 2 },
  liveStatus: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingBottom: 2 },
  liveDot: { width: 7, height: 7, borderRadius: radius.pill, backgroundColor: colors.successGreen },
  liveText: { fontSize: 10, fontWeight: font.weight.bold, textTransform: 'uppercase', letterSpacing: font.tracking.wide },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
  },
  tabItem: { flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, gap: 6 },
  tabItemActive: { backgroundColor: 'rgba(53,185,244,0.16)' },
  tabItemPressed: { opacity: 0.85 },
  tabMark: { width: 6, height: 6, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.35)' },
  tabMarkActive: { backgroundColor: colors.electricBlue, width: 20, ...shadow.glowBlue },
  tabLabel: { color: '#AFC1D4', fontWeight: font.weight.bold, fontSize: 11 },
  tabLabelActive: { color: colors.white },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7,26,51,0.55)' },
  panel: { backgroundColor: colors.white, padding: spacing.lg, paddingBottom: spacing.xxl, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, borderTopWidth: 3, borderTopColor: colors.electricBlue },
  panelGrabber: { alignSelf: 'center', width: 38, height: 4, borderRadius: radius.pill, backgroundColor: colors.line, marginBottom: spacing.lg },
  panelHeader: { flexDirection: 'row', gap: 12, alignItems: 'center', paddingBottom: 18, marginBottom: 18, borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  panelAvatar: { width: 46, height: 46, borderRadius: radius.md, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: colors.electricBlue },
  panelAvatarText: { color: colors.electricBlue, fontWeight: font.weight.black },
  panelUserBlock: { flex: 1 }, panelName: { color: colors.navy, fontWeight: font.weight.black, fontSize: 16 }, panelEmail: { color: colors.textGray, fontSize: 12, marginTop: 2 }, panelRole: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 10, letterSpacing: 0.7, textTransform: 'uppercase', marginTop: 6 },
  panelSectionTitle: { color: colors.muted, fontSize: 11, fontWeight: font.weight.black, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  toolList: { borderTopWidth: 1, borderTopColor: colors.borderSoft },
  toolItem: { flexDirection: 'row', alignItems: 'center', minHeight: 58, borderBottomWidth: 1, borderBottomColor: colors.borderSoft, gap: 12 },
  toolIndex: { color: colors.electricBlue, fontWeight: font.weight.black, fontSize: 11, width: 22 },
  toolText: { flex: 1 }, toolLabel: { color: colors.navy, fontWeight: font.weight.bold, fontSize: 14 }, toolCaption: { color: colors.textGray, fontSize: 11, marginTop: 3 }, toolArrow: { color: colors.fordBlue, fontSize: 20, fontWeight: '700' },
  logoutItem: { marginTop: 18, paddingVertical: 13, flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: colors.borderSoft },
  logoutText: { color: colors.riskRed, fontWeight: font.weight.black }, logoutArrow: { color: colors.riskRed, fontWeight: font.weight.black },
});
