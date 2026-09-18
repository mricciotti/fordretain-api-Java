import { StyleSheet, Text, View } from 'react-native';
import colors from '../styles/colors';
import { radius, font, shadow } from '../styles/tokens';

export default function AppLogo({ small = false, light = false }) {
  return (
    <View style={[styles.logo, small && styles.logoSmall]}>
      <View style={styles.mark}><Text style={styles.markText}>FR</Text></View>
      <Text style={[styles.text, small && styles.textSmall, light && styles.textLight]}>FordRetain</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    gap: 8,
    paddingVertical: 2,
    justifyContent: 'center',
  },
  logoSmall: {
    gap: 6,
  },
  mark: { width: 28, height: 28, borderRadius: radius.sm, backgroundColor: colors.electricBlue, alignItems: 'center', justifyContent: 'center', ...shadow.glowBlue },
  markText: { color: colors.navy, fontWeight: font.weight.black, fontSize: 11, letterSpacing: -0.5 },
  text: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: font.weight.black,
    letterSpacing: -0.8,
  },
  textSmall: {
    fontSize: 18,
  },
  textLight: { color: colors.white },
});
