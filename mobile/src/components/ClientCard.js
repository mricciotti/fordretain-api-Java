import { Pressable, Text, View, StyleSheet } from 'react-native';
import { useState } from 'react';
import ProfileBadge from './ProfileBadge';
import colors from '../styles/colors';
import { radius, spacing, font } from '../styles/tokens';

function getRiskStyle(risk) {
  if (risk >= 70) return { color: colors.riskRed, bar: colors.riskRed, label: 'ALTO' };
  if (risk >= 50) return { color: colors.warningYellow, bar: colors.warningYellow, label: 'MÉDIO' };
  return { color: colors.successGreen, bar: colors.successGreen, label: 'BAIXO' };
}

export default function ClientCard({ cliente, onOpenDetails }) {
  const [expanded, setExpanded] = useState(false);
  const risk = getRiskStyle(Number(cliente.riscoEvasao || 0));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}><View style={styles.rankLine}><View style={[styles.riskDot, { backgroundColor: risk.bar }]} /><Text style={styles.riskLabel}>{risk.label} · {cliente.riscoEvasao}%</Text></View><Text style={styles.priorityText}>{cliente.prioridade}</Text></View>
      <Text style={styles.nome}>{cliente.nome}</Text>
      <Text style={styles.meta}>{cliente.veiculo} · {cliente.regiao}</Text>
      <View style={styles.riskTrack}><View style={[styles.riskFill, { width: `${Math.min(Number(cliente.riscoEvasao || 0), 100)}%`, backgroundColor: risk.bar }]} /></View>
      <View style={styles.profileRow}><ProfileBadge perfil={cliente.perfil} /><Text style={styles.actionPreview} numberOfLines={1}>{cliente.acaoRecomendada || 'Sem ação recomendada'}</Text></View>

      {expanded ? <View style={styles.expandedArea}><Text style={styles.expandedTitle}>Por que está na fila</Text><Text style={styles.detailLine}>{cliente.motivoPriorizacao || 'Cliente priorizado pelo risco de evasão.'}</Text><Text style={styles.detailLine}><Text style={styles.detailLabel}>Fatores: </Text>{cliente.fatoresRisco?.join(', ') || 'Não informado'}</Text></View> : null}

      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={() => setExpanded((prev) => !prev)}><Text style={styles.secondaryButtonText}>{expanded ? 'Fechar resumo' : 'Ver contexto'}</Text></Pressable>
        <Pressable style={styles.primaryButton} onPress={() => onOpenDetails(cliente)}><Text style={styles.primaryButtonText}>Abrir cliente</Text><Text style={styles.arrow}>→</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rankLine: { flexDirection: 'row', alignItems: 'center', gap: 6 }, riskDot: { width: 7, height: 7, borderRadius: radius.pill }, riskLabel: { color: colors.textGray, fontWeight: font.weight.black, fontSize: 10, letterSpacing: 0.7 }, priorityText: { color: colors.muted, fontWeight: font.weight.bold, fontSize: 10 },
  nome: { color: colors.navy, fontWeight: font.weight.black, fontSize: 16, marginTop: 10 }, meta: { color: colors.textGray, fontSize: 12, fontWeight: font.weight.regular, marginTop: 4 },
  riskTrack: { height: 5, borderRadius: radius.pill, backgroundColor: colors.borderSoft, marginTop: 12, overflow: 'hidden' }, riskFill: { height: 5, borderRadius: radius.pill },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 12 }, actionPreview: { color: colors.textGray, fontSize: 11, fontWeight: font.weight.regular, flex: 1 },
  expandedArea: { backgroundColor: colors.surfaceSoft, borderRadius: radius.sm, borderLeftWidth: 3, borderLeftColor: colors.fordBlue, padding: 10, marginTop: 12, gap: 5 }, expandedTitle: { color: colors.navy, fontWeight: font.weight.black, fontSize: 12 }, detailLine: { color: colors.textGray, fontSize: 12, lineHeight: 18 }, detailLabel: { color: colors.navy, fontWeight: font.weight.black },
  actions: { flexDirection: 'row', gap: 8, marginTop: 13 }, secondaryButton: { flex: 1, paddingVertical: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' }, secondaryButtonText: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 11 }, primaryButton: { flex: 1, paddingVertical: 10, borderRadius: radius.md, backgroundColor: colors.navy, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 }, primaryButtonText: { color: colors.white, fontWeight: font.weight.black, fontSize: 11 }, arrow: { color: colors.electricBlue, fontWeight: font.weight.black, fontSize: 16 },
});
