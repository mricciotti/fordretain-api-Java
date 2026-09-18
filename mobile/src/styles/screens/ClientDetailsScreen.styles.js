import { StyleSheet } from 'react-native';
import colors from '../colors';
import { radius, spacing, font, shadow } from '../tokens';

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.lg, backgroundColor: colors.background, gap: spacing.sm - 2, paddingBottom: spacing.xxl - 4 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.lg },
  loadingText: { marginTop: 10, color: colors.textGray, fontWeight: font.weight.regular, textAlign: 'center' },
  title: { fontSize: font.size.xxl + 2, fontWeight: font.weight.black, color: colors.navy, letterSpacing: -0.5 },
  subtitle: { color: colors.textGray, fontSize: 12 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md - 2, gap: 8, ...shadow.sm },
  decisionCard: { backgroundColor: colors.navy, borderRadius: radius.lg, borderLeftWidth: 4, borderLeftColor: colors.electricBlue, padding: spacing.md, gap: 12, ...shadow.md },
  decisionHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  decisionLabel: { color: '#9CC5FF', fontWeight: font.weight.black, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  decisionTitle: { color: colors.white, fontWeight: font.weight.black, fontSize: 18, lineHeight: 24, marginTop: 4 },
  decisionText: { color: '#DCEBFF', fontWeight: font.weight.bold, lineHeight: 20 },
  riskBadge: { backgroundColor: colors.riskRed, borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 72, ...shadow.glowRed },
  riskValue: { color: colors.white, fontWeight: font.weight.black, fontSize: 18 },
  riskLabel: { color: colors.white, fontWeight: font.weight.bold, fontSize: 11, marginTop: 1 },
  actionRow: { gap: 8 },
  actionButton: { flex: 1 },
  noteCard: { backgroundColor: colors.navy, borderRadius: radius.lg, borderLeftWidth: 3, borderLeftColor: colors.electricBlue, padding: spacing.md - 2, gap: 8 },
  sectionTitle: { color: colors.fordBlue, fontWeight: font.weight.black, marginBottom: 2 },
  row: { color: colors.textGray, lineHeight: 20, fontSize: 12 },
  label: { fontWeight: font.weight.bold, color: colors.navy },
  noteTitle: { color: colors.white, fontWeight: font.weight.black, marginBottom: 2 },
  noteText: { color: '#D7E7F7', lineHeight: 20, fontSize: 12 },
});

export default styles;
