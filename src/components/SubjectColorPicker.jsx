import { Pressable, Text, TextInput, View } from 'react-native';
import { normalizeSubjectColor } from '../data/subjectColor';
import { createThemedStyles, useColors } from '../study/AppearanceProvider';
import { subjectSwatches } from '../study/subjectPalette';
import { SubjectGradient } from './SubjectGradient';
import { Icon } from './ui';

export function SubjectColorPicker({ value, onChange, disabled }) {
  const styles = useStyles();
  const colors = useColors();
  const selected = normalizeSubjectColor(value);

  return <View style={styles.field}>
    <Text style={styles.label}>Subject color</Text>
    <View style={styles.swatches}>
      {subjectSwatches.map(({ name, color }) => <Pressable key={color} accessibilityRole="button"
        accessibilityLabel={`${name} ${color}`} aria-pressed={selected === color} disabled={disabled}
        onPress={() => onChange(color)} style={[styles.swatch, selected === color && styles.selected]}>
        <View style={[styles.sample, { backgroundColor: color }]} />
        {selected === color && <View style={styles.check}><Icon name="check" size={12} /></View>}
      </Pressable>)}
    </View>
    <View style={styles.inputRow}>
      <TextInput accessibilityLabel="Hex color" autoCapitalize="characters" autoCorrect={false} spellCheck={false}
        value={value} onChangeText={onChange} editable={!disabled} maxLength={7}
        placeholder="#7E235D" placeholderTextColor={colors.muted} style={styles.input} />
      {selected && <View style={styles.preview}>
        <SubjectGradient color={selected} />
        <Text style={styles.label}>Preview</Text>
      </View>}
    </View>
    {!selected && <Text accessibilityLiveRegion="polite" style={styles.hint}>Enter a 3- or 6-digit hex color.</Text>}
  </View>;
}

const useStyles = createThemedStyles((colors) => ({
  field: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '700' },
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  swatch: { width: 44, height: 44, borderWidth: 2, borderColor: 'transparent', borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: colors.ink },
  sample: { width: 31, height: 31, borderRadius: 16 },
  check: { position: 'absolute', alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, width: 17, height: 17, borderRadius: 9 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, minHeight: 44, paddingHorizontal: 10, color: colors.ink, borderColor: colors.border, borderWidth: 1, borderRadius: 9, backgroundColor: colors.paper, fontSize: 16 },
  preview: { flex: 1, overflow: 'hidden', borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
  hint: { color: colors.danger, fontSize: 12 },
}));
