import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';
import { radius, font } from '../styles/tokens';

const PROFILE_COLORS = {
  'Cliente Fiel': colors.successGreen,
  'Cliente Econômico': colors.warningYellow,
  'Cliente Esquecido': colors.fordBlue,
  'Cliente de Abandono': colors.riskRed,
  'Cliente em Risco': colors.riskRed,
};

export default function ProfileBadge({ perfil }) {
  const tone = PROFILE_COLORS[perfil] || colors.muted;
  return (
    <View style={[styles.badge, { borderColor: tone, backgroundColor: `${tone}1A` }]}>
      <Text style={[styles.text, { color: tone }]}>{perfil}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  text: { fontSize: 10, fontWeight: font.weight.black, letterSpacing: 0.3 },
});
