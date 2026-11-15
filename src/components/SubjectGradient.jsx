import { useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useAppearance } from '../study/AppearanceProvider';
import { decorativeSvg } from './ui';

export function SubjectGradient({ color }) {
  const id = `subject-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const { mode } = useAppearance();

  return <View pointerEvents="none" style={StyleSheet.absoluteFill}>
    <Svg width="100%" height="100%" {...decorativeSvg}>
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={color} stopOpacity={mode === 'dark' ? 0.38 : 0.23} />
          <Stop offset="65%" stopColor={color} stopOpacity={0.07} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  </View>;
}
