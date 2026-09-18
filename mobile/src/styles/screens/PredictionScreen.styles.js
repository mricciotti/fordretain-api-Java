import { StyleSheet } from 'react-native';
import colors from '../colors';
import { radius, spacing, font, shadow } from '../tokens';

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1, gap: spacing.sm - 2 },
  title: { fontSize: font.size.xxl + 1, fontWeight: font.weight.black, color: colors.navy },
  subtitle: { color: colors.textGray, fontSize: 12, lineHeight: 18 },
  warningBox: { backgroundColor: colors.warningSoft, borderRadius: radius.md, borderColor: '#FCD34D', borderWidth: 1, padding: spacing.sm },
  warningTitle: { color: colors.navy, fontWeight: font.weight.bold, marginBottom: 4 },
  warningText: { color: '#334155', lineHeight: 20 },
  formCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, gap: 14, ...shadow.sm },
  fieldGroup: { gap: 8 },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, backgroundColor: colors.surfaceSoft, paddingHorizontal: 12, paddingVertical: 12, color: colors.navy },
  optionGroup: { borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, backgroundColor: colors.surfaceSoft, padding: spacing.sm, gap: 8 },
  optionLabel: { color: colors.navy, fontWeight: font.weight.black, fontSize: 14 },
  optionWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, backgroundColor: colors.surfaceSoft, paddingHorizontal: 12, paddingVertical: 9 },
  optionChipActive: { backgroundColor: colors.fordBlue, borderColor: colors.fordBlue, ...shadow.glowBlue },
  optionText: { color: colors.fordBlue, fontWeight: font.weight.bold, fontSize: 12 },
  optionTextActive: { color: colors.white },
  loadingBox: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md - 2, alignItems: 'center' },
  loadingText: { color: colors.textGray, marginTop: 8, fontWeight: font.weight.regular },
  resultCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md - 2, gap: 6, ...shadow.sm },
  resultTitle: { fontWeight: font.weight.bold, color: colors.fordBlue },
  row: { color: '#1E293B', lineHeight: 20 },
  label: { fontWeight: font.weight.bold, color: colors.navy },
  criteriaBox: { marginTop: 8, backgroundColor: colors.surfaceSoft, borderWidth: 1, borderColor: colors.borderSoft, borderRadius: radius.md, padding: spacing.sm, gap: 6 },
  criteriaTitle: { color: colors.navy, fontWeight: font.weight.black, marginBottom: 2 },
  criteriaItem: { color: '#334155', lineHeight: 19, fontSize: 13, fontWeight: font.weight.regular },
  errorCard: { backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, borderRadius: radius.md, padding: spacing.sm },
  errorTitle: { color: colors.riskRed, fontWeight: font.weight.black, marginBottom: 4 },
  errorText: { color: '#7F1D1D', lineHeight: 20, fontWeight: font.weight.regular },
});

export default styles;
