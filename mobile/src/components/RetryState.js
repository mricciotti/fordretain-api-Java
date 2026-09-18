import { Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../styles/colors';
import { radius, spacing, font } from '../styles/tokens';

export default function RetryState({ title = 'Não foi possível carregar os dados', message, onRetry, retryLabel = 'Tentar novamente' }) {
  return (
    <View style={styles.box}>
      <View style={styles.mark}>
        <Text style={styles.markText}>!</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <Pressable style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]} onPress={onRetry}>
        <Text style={styles.buttonText}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.riskRedSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: colors.riskRedSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  markText: { color: colors.riskRed, fontWeight: font.weight.black, fontSize: font.size.lg },
  title: { color: colors.navy, fontWeight: font.weight.black, fontSize: font.size.md, textAlign: 'center' },
  message: { color: colors.textGray, fontSize: font.size.sm, lineHeight: 18, textAlign: 'center' },
  button: {
    marginTop: spacing.xs,
    backgroundColor: colors.fordBlue,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  buttonPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  buttonText: { color: colors.white, fontWeight: font.weight.bold, fontSize: font.size.sm },
});
