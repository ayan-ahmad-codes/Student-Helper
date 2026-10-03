import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Expense } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { CategoryStyles } from '../../constants/theme';

export interface ExpenseItemProps {
  expense: Expense;
  currencySymbol?: string;
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export const ExpenseItem: React.FC<ExpenseItemProps> = ({
  expense,
  currencySymbol = 'Rs.',
  onEdit,
  onDelete,
}) => {
  const { theme, isDark } = useAppTheme();
  const catStyle = CategoryStyles[expense.category] || CategoryStyles.Other;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isDark ? catStyle.bgDark : catStyle.bgLight },
        ]}
      >
        <Ionicons
          name={catStyle.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={catStyle.color}
        />
      </View>

      <View style={styles.contentCol}>
        <Text
          numberOfLines={1}
          style={[styles.description, { color: theme.text }]}
        >
          {expense.description || expense.category}
        </Text>

        <View style={styles.metaRow}>
          <Text style={[styles.categoryTag, { color: catStyle.color }]}>
            {expense.category}
          </Text>
          <Text style={[styles.bullet, { color: theme.textSubtle }]}>•</Text>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            {expense.date}
          </Text>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text style={[styles.amountText, { color: theme.text }]}>
          {currencySymbol} {expense.amount.toLocaleString()}
        </Text>

        <View style={styles.actionsRow}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(expense)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="pencil-outline" size={15} color={theme.textSubtle} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(expense)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={15} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryTag: {
    fontSize: 11,
    fontWeight: '600',
  },
  bullet: {
    fontSize: 11,
  },
  dateText: {
    fontSize: 11,
  },
  rightCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
});
