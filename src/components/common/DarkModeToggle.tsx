import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export interface DarkModeToggleProps {
  showLabel?: boolean;
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ showLabel = false }) => {
  const { isDark, toggleTheme, theme } = useAppTheme();

  return (
    <View style={styles.wrapper}>
      {showLabel && (
        <Text style={[styles.labelText, { color: theme.textMuted }]}>
          {isDark ? 'Dark' : 'Light'}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={toggleTheme}
        style={[
          styles.switchContainer,
          {
            backgroundColor: isDark ? '#1E293B' : '#E2E8F0',
            borderColor: isDark ? '#334155' : '#CBD5E1',
          },
        ]}
        accessibilityRole="switch"
        accessibilityLabel="Dark Mode Toggle"
        accessibilityState={{ checked: isDark }}
      >
        {/* Light Icon */}
        <View style={styles.iconSlot}>
          <Ionicons
            name="sunny"
            size={14}
            color={!isDark ? '#F59E0B' : '#64748B'}
          />
        </View>

        {/* Dark Icon */}
        <View style={styles.iconSlot}>
          <Ionicons
            name="moon"
            size={13}
            color={isDark ? '#818CF8' : '#94A3B8'}
          />
        </View>

        {/* Sliding Thumb Knob */}
        <View
          style={[
            styles.thumb,
            {
              backgroundColor: isDark ? '#6366F1' : '#FFFFFF',
              transform: [{ translateX: isDark ? 28 : 2 }],
            },
          ]}
        >
          <Ionicons
            name={isDark ? 'moon' : 'sunny'}
            size={12}
            color={isDark ? '#FFFFFF' : '#F59E0B'}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '600',
  },
  switchContainer: {
    width: 60,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2,
    position: 'relative',
    justifyContent: 'space-between',
  },
  iconSlot: {
    width: 26,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});
