import colors from './colors';

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const radius = {
  none: 0,
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  pill: 999,
};

export const font = {
  size: { xs: 10, sm: 12, md: 14, lg: 16, xl: 18, xxl: 22, display: 28, hero: 32 },
  weight: { regular: '600', semibold: '700', bold: '800', black: '900' },
  tracking: { tight: -0.6, normal: 0, wide: 0.8, wider: 1.2 },
};

export function glow(color, opacity = 0.35, blurRadius = 12) {
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: blurRadius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  };
}

export const shadow = {
  sm: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  glowBlue: glow(colors.electricBlue, 0.4, 14),
  glowRed: glow(colors.riskRed, 0.35, 12),
};

export default { spacing, radius, font, shadow, glow };
