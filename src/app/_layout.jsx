import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Brand, Icon } from '../components/ui';
import { AppearanceProvider, useAppearance, useColors } from '../study/AppearanceProvider';
import { StudyProvider } from '../study/StudyProvider';

const tabIcon = (name) => ({ color }) => <Icon name={name} color={color} />;

export default function RootLayout() {
  return <AppearanceProvider><StudyProvider><StudyTabs /></StudyProvider></AppearanceProvider>;
}

function AppearanceToggle() {
  const { mode, saving, error, toggle } = useAppearance();
  const colors = useColors();
  const isDark = mode === 'dark';
  const label = isDark ? 'Light mode' : 'Dark mode';
  return <View style={{ paddingRight: 16, alignItems: 'flex-end' }}>
    <Pressable accessibilityRole="button" accessibilityLabel={`Switch to ${label.toLowerCase()}`} disabled={saving}
      onPress={() => void toggle()} style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={isDark ? 'sun' : 'moon'} size={17} color={colors.gold} />
      <Text style={{ color: '#fff7f0', fontSize: 13, fontWeight: '700' }}>{label}</Text>
    </Pressable>
    {error && <Text accessibilityRole="alert" style={{ color: '#ffd4df', fontSize: 11 }}>{error}</Text>}
  </View>;
}

function StudyTabs() {
  const colors = useColors();
  const wide = useWindowDimensions().width >= 900;

  return <>
    <StatusBar style="light" />
    <Tabs screenOptions={{
      headerStyle: { backgroundColor: colors.night },
      headerShadowVisible: false,
      headerTitleAlign: 'left',
      headerTitle: () => <Brand />,
      headerRight: () => <AppearanceToggle />,
      sceneStyle: { backgroundColor: colors.paper },
      tabBarPosition: wide ? 'left' : 'bottom',
      tabBarVariant: wide ? 'material' : 'uikit',
      tabBarActiveTintColor: wide ? '#ffce72' : colors.action,
      tabBarInactiveTintColor: wide ? colors.nightMuted : colors.muted,
      tabBarActiveBackgroundColor: wide ? '#3e2648' : colors.card,
      tabBarLabelStyle: { fontWeight: '800', fontSize: wide ? 14 : 11 },
      tabBarStyle: wide ? { width: 196, minWidth: 196, backgroundColor: colors.night, borderRightWidth: 0, paddingHorizontal: 12 } : { backgroundColor: colors.card, borderTopColor: colors.border },
    }}>
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('sun') }} />
      <Tabs.Screen name="library" options={{ title: 'Library', tabBarIcon: tabIcon('book') }} />
      <Tabs.Screen name="memory" options={{ title: 'Memory', tabBarIcon: tabIcon('curve') }} />
    </Tabs>
  </>;
}
