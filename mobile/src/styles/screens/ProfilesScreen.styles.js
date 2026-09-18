import { StyleSheet } from 'react-native';
import colors from '../colors';
import { radius, spacing, font, shadow } from '../tokens';

const styles = StyleSheet.create({
  container: { padding: spacing.lg, backgroundColor: colors.background, flexGrow: 1 },
  title: { fontSize: font.size.xxl + 1, fontWeight: font.weight.black, marginBottom: 4, color: colors.navy },
  subtitle: { color: colors.textGray, marginBottom: spacing.md - 2, fontSize: 12, lineHeight: 18 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md - 2, marginBottom: spacing.sm - 2, borderWidth: 1, borderColor: colors.border, gap: 7, ...shadow.sm },
  explanationCard: { backgroundColor: colors.navy, borderRadius: radius.lg, padding: spacing.md - 2, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: colors.electricBlue, gap: 7 },
  sectionTitle: { color: colors.navy, fontWeight: font.weight.bold, marginBottom: 4 },
  row: { color: colors.textGray, lineHeight: 20, fontSize: 12 },
  label: { fontWeight: font.weight.bold, color: colors.navy },
  explanationTitle: { color: colors.white, fontWeight: font.weight.black, marginBottom: 4 },
  explanationRow: { color: '#D7E7F7', lineHeight: 20, fontSize: 12 },
});

export default styles;
