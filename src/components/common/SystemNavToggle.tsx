import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export interface SystemNavToggleProps {
  compact?: boolean;
}

export const SystemNavToggle: React.FC<SystemNavToggleProps> = ({ compact = true }) => {
  const { isDark, theme, hideSystemNavBar, toggleHideSystemNavBar } = useAppTheme();

  // On non-Android platforms, system navigation bar toggle is not applicable
  if (Platform.OS !== 'android') {
    return null;
  }

  if (compact) {
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleHideSystemNavBar}
        style={[
          styles.compactBtn,
          {
            backgroundColor: hideSystemNavBar
              ? theme.primaryLight
              : (isDark ? '#1E293B' : '#E2E8F0'),
            borderColor: hideSystemNavBar
              ? theme.primary
              : (isDark ? '#334155' : '#CBD5E1'),
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={
          hideSystemNavBar
            ? 'Show Phone Navigation Buttons'
            : 'Hide Phone Navigation Buttons (Full Screen)'
        }
      >
        <Ionicons
          name={hideSystemNavBar ? 'phone-portrait' : 'expand-outline'}
          size={16}
          color={hideSystemNavBar ? theme.primary : theme.textMuted}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={toggleHideSystemNavBar}
      style={[
        styles.fullBtn,
        {
          backgroundColor: hideSystemNavBar ? theme.primaryLight : theme.card,
          borderColor: hideSystemNavBar ? theme.primary : theme.border,
        },
      ]}
    >
      <Ionicons
        name={hideSystemNavBar ? 'phone-portrait' : 'expand-outline'}
        size={18}
        color={hideSystemNavBar ? theme.primary : theme.text}
      />
      <View style={styles.textCol}>
        <Text
          style={[
            styles.label,
            { color: hideSystemNavBar ? theme.primary : theme.text },
          ]}
        >
          {hideSystemNavBar ? 'Full Screen Mode' : 'Standard Mode'}
        </Text>
        <Text style={[styles.sublabel, { color: theme.textMuted }]}>
          {hideSystemNavBar
            ? 'Phone navigation buttons hidden'
            : 'Phone navigation buttons visible'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  compactBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  textCol: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
