import { StyleSheet } from 'react-native';
import colors from '../colors';
import { radius, spacing, font, shadow } from '../tokens';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  card: {
    width: '100%',
    maxWidth: 540,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderTopWidth: 4,
    borderTopColor: colors.electricBlue,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    ...shadow.md,
  },
  kicker: { color: colors.fordBlue, fontWeight: font.weight.black, fontSize: 10, letterSpacing: font.tracking.wider, marginTop: spacing.xl },
  title: { fontSize: font.size.hero - 2, fontWeight: font.weight.black, color: colors.navy, marginTop: 5, marginBottom: 6 },
  subtitle: { color: colors.textGray, marginBottom: spacing.md + 2, lineHeight: 21, fontWeight: font.weight.regular },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md - 2, marginBottom: spacing.sm - 2, color: colors.navy, backgroundColor: colors.surfaceSoft },
  registerPrompt: { color: colors.textGray, marginTop: spacing.sm - 2, marginBottom: 2, textAlign: 'center', fontWeight: font.weight.bold },
});

export default styles;
