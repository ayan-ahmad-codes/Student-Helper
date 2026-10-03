export const Colors = {
  light: {
    primary: '#4F46E5',
    primaryLight: '#EEF2FF',
    primaryDark: '#3730A3',
    secondary: '#0284C7',
    background: '#F8FAFC',
    card: '#FFFFFF',
    text: '#0F172A',
    textMuted: '#64748B',
    textSubtle: '#94A3B8',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    success: '#10B981',
    successLight: '#ECFDF5',
    warning: '#F59E0B',
    warningLight: '#FFFBEB',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    tabBar: '#FFFFFF',
    tabBarActive: '#4F46E5',
    tabBarInactive: '#94A3B8',
  },
  dark: {
    primary: '#6366F1',
    primaryLight: '#1E1B4B',
    primaryDark: '#4338CA',
    secondary: '#38BDF8',
    background: '#0B0F19',
    card: '#151D2F',
    text: '#F8FAFC',
    textMuted: '#94A3B8',
    textSubtle: '#64748B',
    border: '#23304B',
    borderLight: '#192338',
    success: '#34D399',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#451A03',
    danger: '#F87171',
    dangerLight: '#450A0A',
    tabBar: '#151D2F',
    tabBarActive: '#818CF8',
    tabBarInactive: '#64748B',
  },
};

export const CategoryStyles: Record<
  string,
  { icon: string; color: string; bgLight: string; bgDark: string }
> = {
  Food: {
    icon: 'restaurant-outline',
    color: '#EF4444',
    bgLight: '#FEF2F2',
    bgDark: '#450A0A',
  },
  Transport: {
    icon: 'bus-outline',
    color: '#0284C7',
    bgLight: '#F0F9FF',
    bgDark: '#082F49',
  },
  University: {
    icon: 'school-outline',
    color: '#4F46E5',
    bgLight: '#EEF2FF',
    bgDark: '#1E1B4B',
  },
  Printing: {
    icon: 'print-outline',
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    bgDark: '#451A03',
  },
  Shopping: {
    icon: 'cart-outline',
    color: '#EC4899',
    bgLight: '#FDF2F8',
    bgDark: '#500724',
  },
  Other: {
    icon: 'ellipsis-horizontal-circle-outline',
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
    bgDark: '#2E1065',
  },
};

export const FolderColors = [
  '#4F46E5', // Indigo
  '#0284C7', // Sky
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];
