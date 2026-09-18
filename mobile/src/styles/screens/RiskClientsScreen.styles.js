import { StyleSheet } from 'react-native';
import colors from '../colors';
import { radius, spacing, font, shadow } from '../tokens';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: spacing.lg },
  loadingText: { marginTop: 10, color: colors.textGray, fontWeight: font.weight.semibold, textAlign: 'center', fontSize: 12 },
  pageIntro: { marginBottom: spacing.md - 2 }, kicker: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 10, letterSpacing: font.tracking.wider },
  pageTitle: { fontSize: font.size.xxl + 1, fontWeight: font.weight.black, color: colors.navy, letterSpacing: -0.5, marginTop: 4 },
  subtitle: { color: colors.textGray, lineHeight: 18, fontSize: 12, marginTop: 5 },
  summaryGrid: { flexDirection: 'row', borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginBottom: spacing.md - 2, ...shadow.sm },
  summaryCard: { flex: 1, backgroundColor: colors.white, paddingVertical: 11, paddingHorizontal: 7, borderRightWidth: 1, borderRightColor: colors.border },
  summaryHigh: { backgroundColor: colors.riskRedSoft }, summaryMedium: { backgroundColor: colors.warningSoft }, summaryLow: { backgroundColor: colors.successSoft, borderRightWidth: 0 },
  summaryValue: { color: colors.navy, fontWeight: font.weight.black, fontSize: 20 }, summaryLabel: { color: colors.textGray, fontWeight: font.weight.bold, fontSize: 10, marginTop: 3 },
  filterPanel: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.sm, ...shadow.sm },
  filterTitle: { color: colors.navy, fontWeight: font.weight.black, fontSize: 14 }, filterSubtitle: { color: colors.textGray, fontWeight: font.weight.regular, fontSize: 11, marginTop: 3 },
  filters: { flexDirection: 'row', gap: 7, marginTop: 11 },
  filterChip: { flex: 1, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceSoft, alignItems: 'center' },
  filterChipActive: { backgroundColor: colors.navy, borderColor: colors.navy, ...shadow.glowBlue }, filterText: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 11 }, filterTextActive: { color: colors.white },
  listContent: { paddingBottom: 18 }, separator: { height: 9 }, empty: { textAlign: 'center', color: colors.textGray, marginTop: 24, fontWeight: font.weight.semibold, fontSize: 12 },
  errorBox: { backgroundColor: colors.riskRedSoft, borderRadius: radius.md, borderLeftWidth: 3, borderLeftColor: colors.riskRed, padding: 10, marginBottom: 10 }, error: { color: colors.riskRed, fontWeight: font.weight.black, fontSize: 12 }, errorHint: { color: '#8E3B42', fontWeight: font.weight.regular, fontSize: 11, marginTop: 4 },
});

export default styles;
