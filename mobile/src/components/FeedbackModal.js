import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import colors from '../styles/colors';
import { radius, spacing, font } from '../styles/tokens';
import PrimaryButton from './PrimaryButton';

const paletteByType = {
  sucesso: { accent: colors.successGreen, chipBg: '#DCFCE7', chipText: '#166534', title: 'Sucesso' },
  erro: { accent: colors.riskRed, chipBg: '#FEE2E2', chipText: '#991B1B', title: 'Erro' },
  aviso: { accent: colors.warningYellow, chipBg: '#FEF3C7', chipText: '#92400E', title: 'Aviso' },
};

export default function FeedbackModal({
  visible,
  type = 'sucesso',
  title,
  message,
  buttonText,
  onButtonPress,
  secondaryButtonText,
  onSecondaryButtonPress,
  onClose,
}) {
  const palette = paletteByType[type] || paletteByType.aviso;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose || onButtonPress}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose || onButtonPress} />
        <View style={[styles.card, { borderColor: palette.accent }]}>
          <View style={[styles.typeChip, { backgroundColor: palette.chipBg }]}>
            <Text style={[styles.typeChipText, { color: palette.chipText }]}>{palette.title}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <PrimaryButton title={buttonText} onPress={onButtonPress} />
          {secondaryButtonText ? (
            <PrimaryButton title={secondaryButtonText} variant="secondary" onPress={onSecondaryButtonPress || onButtonPress} />
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(11,31,58,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    padding: spacing.lg,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  typeChip: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, marginBottom: spacing.sm },
  typeChipText: { fontWeight: font.weight.bold, fontSize: 12 },
  title: { fontSize: font.size.xxl, fontWeight: font.weight.bold, color: colors.navy, marginBottom: spacing.xs },
  message: { color: '#334155', lineHeight: 22, marginBottom: spacing.sm },
});
