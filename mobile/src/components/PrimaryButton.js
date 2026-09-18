import { Pressable, StyleSheet, Text } from 'react-native';
import colors from '../styles/colors';
import { radius, spacing, font, shadow } from '../styles/tokens';

export default function PrimaryButton({ title, onPress, variant = 'primary', color, disabled = false }) {
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        isSecondary ? styles.secondaryButton : styles.primaryButton,
        color && !isSecondary && { backgroundColor: color, borderColor: color },
        color && isSecondary && { borderColor: color },
        disabled && styles.disabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, isSecondary ? styles.secondaryText : styles.primaryText, color && isSecondary && { color }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm + 1,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 6,
    borderWidth: 1,
    ...shadow.sm,
  },
  primaryButton: {
    backgroundColor: colors.fordBlue,
    borderColor: colors.fordBlue,
    ...shadow.glowBlue,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.985 }],
  },
  disabled: { opacity: 0.55, shadowOpacity: 0 },
  text: {
    fontWeight: font.weight.bold,
    fontSize: font.size.lg - 1,
    letterSpacing: 0.2,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.fordBlue,
  },
});
