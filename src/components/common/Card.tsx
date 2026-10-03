import React from 'react';
import { View, ViewStyle, TouchableOpacity, StyleProp } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  padding?: number;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  padding = 16,
  bordered = true,
}) => {
  const { theme, isDark } = useAppTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding,
    borderColor: bordered ? theme.border : 'transparent',
    borderWidth: bordered ? 1 : 0,
    shadowColor: isDark ? '#000' : '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.25 : 0.05,
    shadowRadius: 6,
    elevation: 2,
  };

  if (onPress) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={[cardStyle, style]}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
};
