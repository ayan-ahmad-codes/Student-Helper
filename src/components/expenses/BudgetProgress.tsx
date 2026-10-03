import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export interface BudgetProgressProps {
  monthlyBudget: number;
  spent: number;
  remaining: number;
  currencySymbol?: string;
  onEditBudget?: () => void;
}

export const BudgetProgress: React.FC<BudgetProgressProps> = ({
  monthlyBudget,
  spent,
  remaining,
  currencySymbol = 'Rs.',
  onEditBudget,
}) => {
  const { theme } = useAppTheme();

  const percentage =
    monthlyBudget > 0 ? Math.min(100, Math.round((spent / monthlyBudget) * 100)) : 0;
  const isOverBudget = monthlyBudget > 0 && spent > monthlyBudget;

  const getProgressColor = () => {
    if (isOverBudget) return theme.danger;
    if (percentage > 85) return theme.warning;
    return theme.success;
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.caption, { color: theme.textMuted }]}>
            Monthly Budget
          </Text>
          <Text style={[styles.budgetValue, { color: theme.text }]}>
            {currencySymbol} {monthlyBudget.toLocaleString()}
          </Text>
        </View>

        {onEditBudget && (
          <TouchableOpacity
            onPress={onEditBudget}
            style={[styles.editBtn, { backgroundColor: theme.primaryLight }]}
          >
            <Ionicons name="pencil" size={13} color={theme.primary} />
            <Text style={[styles.editBtnText, { color: theme.primary }]}>
              {monthlyBudget > 0 ? 'Edit' : 'Set Budget'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: theme.borderLight },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
              backgroundColor: getProgressColor(),
            },
          ]}
        />
      </View>

      {/* Summary Row matching prompt requirement */}
      <View style={styles.statsRow}>
        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Spent</Text>
          <Text
            style={[
              styles.statValue,
              { color: isOverBudget ? theme.danger : theme.text },
            ]}
          >
            {currencySymbol} {spent.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>
            {isOverBudget ? 'Over Budget' : 'Remaining'}
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                color: isOverBudget
                  ? theme.danger
                  : remaining === 0
                  ? theme.warning
                  : theme.success,
              },
            ]}
          >
            {currencySymbol}{' '}
            {isOverBudget
              ? (spent - monthlyBudget).toLocaleString()
              : remaining.toLocaleString()}
          </Text>
        </View>

        <View style={[styles.divider, { backgroundColor: theme.border }]} />

        <View style={styles.statCol}>
          <Text style={[styles.statLabel, { color: theme.textMuted }]}>Used</Text>
          <Text style={[styles.statValue, { color: getProgressColor() }]}>
            {percentage}%
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  budgetValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  divider: {
    width: 1,
    height: 24,
  },
});
