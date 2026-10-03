import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { DarkModeToggle } from '../../components/common/DarkModeToggle';
import { ExpenseItem } from '../../components/expenses/ExpenseItem';
import { BudgetProgress } from '../../components/expenses/BudgetProgress';
import {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
  setMonthlyBudget,
  setCurrencySymbol,
} from '../../services/expenseService';
import {
  Expense,
  ExpenseCategory,
  ExpenseSummary,
  EXPENSE_CATEGORIES,
} from '../../types';
import { CategoryStyles } from '../../constants/theme';

export default function ExpensesScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary>({
    todaySpending: 0,
    monthlySpending: 0,
    totalSpending: 0,
    categoryTotals: {
      Food: 0,
      Transport: 0,
      University: 0,
      Printing: 0,
      Shopping: 0,
      Other: 0,
    },
    monthlyBudget: 0,
    remainingBudget: 0,
    currencySymbol: 'Rs.',
  });
  const [refreshing, setRefreshing] = useState(false);

  // Add / Edit Expense Modal state
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<ExpenseCategory>('Food');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [dateInput, setDateInput] = useState('');

  // Budget Modal state
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('Rs.');

  const loadData = useCallback(async () => {
    try {
      const [fetchedExpenses, fetchedSummary] = await Promise.all([
        getExpenses(),
        getExpenseSummary(),
      ]);
      setExpenses(fetchedExpenses);
      setSummary(fetchedSummary);
    } catch (e) {
      console.warn('Error loading expenses:', e);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAddExpense = () => {
    setEditingExpense(null);
    setAmountInput('');
    setCategoryInput('Food');
    setDescriptionInput('');
    setDateInput(todayStr);
    setExpenseModalVisible(true);
  };

  const handleOpenEditExpense = (item: Expense) => {
    setEditingExpense(item);
    setAmountInput(item.amount.toString());
    setCategoryInput(item.category);
    setDescriptionInput(item.description);
    setDateInput(item.date);
    setExpenseModalVisible(true);
  };

  const handleSaveExpense = async () => {
    const parsedAmount = parseFloat(amountInput);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid positive number.');
      return;
    }

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        amount: parsedAmount,
        category: categoryInput,
        description: descriptionInput.trim(),
        date: dateInput.trim() || todayStr,
      });
    } else {
      await addExpense({
        amount: parsedAmount,
        category: categoryInput,
        description: descriptionInput.trim(),
        date: dateInput.trim() || todayStr,
      });
    }

    setExpenseModalVisible(false);
    loadData();
  };

  const handleDeleteExpense = (item: Expense) => {
    Alert.alert(
      'Delete Expense',
      `Delete ${summary.currencySymbol} ${item.amount} (${item.description || item.category})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteExpense(item.id);
            loadData();
          },
        },
      ]
    );
  };

  const handleOpenBudgetModal = () => {
    setBudgetInput(summary.monthlyBudget > 0 ? summary.monthlyBudget.toString() : '');
    setCurrencyInput(summary.currencySymbol || 'Rs.');
    setBudgetModalVisible(true);
  };

  const handleSaveBudget = async () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val >= 0) {
      await setMonthlyBudget(val);
    }
    if (currencyInput.trim()) {
      await setCurrencySymbol(currencyInput.trim());
    }
    setBudgetModalVisible(false);
    loadData();
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>
              Expense Management
            </Text>
            <Text style={[styles.screenSubtitle, { color: theme.textMuted }]}>
              Track university expenses & budget
            </Text>
          </View>

          <View style={styles.headerActions}>
            <DarkModeToggle />
            <Button
              title="Add Expense"
              icon="add"
              size="sm"
              onPress={handleOpenAddExpense}
            />
          </View>
        </View>

        {/* Monthly Budget Card matching prompt requirement */}
        <BudgetProgress
          monthlyBudget={summary.monthlyBudget}
          spent={summary.monthlySpending}
          remaining={summary.remainingBudget}
          currencySymbol={summary.currencySymbol}
          onEditBudget={handleOpenBudgetModal}
        />

        {/* Quick Stats Grid: Today, Monthly, Total */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Text style={[styles.statCardLabel, { color: theme.textMuted }]}>
              Today
            </Text>
            <Text style={[styles.statCardValue, { color: theme.text }]}>
              {summary.currencySymbol} {summary.todaySpending.toLocaleString()}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statCardLabel, { color: theme.textMuted }]}>
              This Month
            </Text>
            <Text style={[styles.statCardValue, { color: theme.text }]}>
              {summary.currencySymbol} {summary.monthlySpending.toLocaleString()}
            </Text>
          </Card>

          <Card style={styles.statCard}>
            <Text style={[styles.statCardLabel, { color: theme.textMuted }]}>
              Total
            </Text>
            <Text style={[styles.statCardValue, { color: theme.text }]}>
              {summary.currencySymbol} {summary.totalSpending.toLocaleString()}
            </Text>
          </Card>
        </View>

        {/* Basic Category Totals matching prompt requirement */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            CATEGORY TOTALS (THIS MONTH)
          </Text>
        </View>

        <View style={styles.categoryGrid}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const catStyle = CategoryStyles[cat] || CategoryStyles.Other;
            const spent = summary.categoryTotals[cat] || 0;

            return (
              <View
                key={cat}
                style={[
                  styles.categoryPill,
                  {
                    backgroundColor: theme.card,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.catIconCircle,
                    {
                      backgroundColor: isDark
                        ? catStyle.bgDark
                        : catStyle.bgLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                    size={16}
                    color={catStyle.color}
                  />
                </View>

                <View style={styles.catInfo}>
                  <Text style={[styles.catName, { color: theme.textMuted }]}>
                    {cat}
                  </Text>
                  <Text style={[styles.catAmount, { color: theme.text }]}>
                    {summary.currencySymbol} {spent.toLocaleString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Expense History Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            EXPENSE HISTORY ({expenses.length})
          </Text>
        </View>

        {expenses.length > 0 ? (
          expenses.map((item) => (
            <ExpenseItem
              key={item.id}
              expense={item}
              currencySymbol={summary.currencySymbol}
              onEdit={handleOpenEditExpense}
              onDelete={handleDeleteExpense}
            />
          ))
        ) : (
          <EmptyState
            icon="wallet-outline"
            title="No expenses logged"
            description="Keep track of food, printing, university fees, transport, and books."
            actionLabel="+ Add Expense"
            onAction={handleOpenAddExpense}
          />
        )}
      </ScrollView>

      {/* Add / Edit Expense Modal */}
      <ModalWrapper
        visible={expenseModalVisible}
        onClose={() => setExpenseModalVisible(false)}
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
      >
        <Input
          label={`Amount (${summary.currencySymbol})`}
          placeholder="e.g. 250"
          value={amountInput}
          onChangeText={setAmountInput}
          keyboardType="numeric"
        />

        {/* Category Selector */}
        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
          Category
        </Text>
        <View style={styles.categoryPicker}>
          {EXPENSE_CATEGORIES.map((cat) => {
            const isSelected = categoryInput === cat;
            const catStyle = CategoryStyles[cat] || CategoryStyles.Other;

            return (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategoryInput(cat)}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor: isSelected
                      ? theme.primaryLight
                      : theme.background,
                    borderColor: isSelected
                      ? theme.primary
                      : theme.border,
                    borderWidth: isSelected ? 1.5 : 1,
                  },
                ]}
              >
                <Ionicons
                  name={catStyle.icon as keyof typeof Ionicons.glyphMap}
                  size={16}
                  color={isSelected ? theme.primary : catStyle.color}
                />
                <Text
                  style={[
                    styles.categoryOptionText,
                    {
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Input
          label="Description"
          placeholder="e.g. Cafeteria lunch & coffee"
          value={descriptionInput}
          onChangeText={setDescriptionInput}
          autoCapitalize="sentences"
        />

        <Input
          label="Date (YYYY-MM-DD)"
          placeholder="e.g. 2026-09-24"
          value={dateInput}
          onChangeText={setDateInput}
        />

        <Button
          title={editingExpense ? 'Update Expense' : 'Save Expense'}
          onPress={handleSaveExpense}
          style={{ marginTop: 14 }}
        />
      </ModalWrapper>

      {/* Set Monthly Budget Modal */}
      <ModalWrapper
        visible={budgetModalVisible}
        onClose={() => setBudgetModalVisible(false)}
        title="Set Monthly Budget"
      >
        <Input
          label="Monthly Budget Amount"
          placeholder="e.g. 15000"
          value={budgetInput}
          onChangeText={setBudgetInput}
          keyboardType="numeric"
        />

        <Input
          label="Currency Symbol"
          placeholder="e.g. Rs. or $ or €"
          value={currencyInput}
          onChangeText={setCurrencyInput}
        />

        <Button
          title="Save Budget"
          onPress={handleSaveBudget}
          style={{ marginTop: 14 }}
        />
      </ModalWrapper>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  screenSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
  },
  statCardLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  statCardValue: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48.5%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  catIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  catInfo: {
    flex: 1,
  },
  catName: {
    fontSize: 11,
    fontWeight: '500',
  },
  catAmount: {
    fontSize: 13,
    fontWeight: '700',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  categoryPicker: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  categoryOptionText: {
    fontSize: 12,
  },
});
