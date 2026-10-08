import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useAppTheme } from '../../context/ThemeContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { getNextUpcomingClass, getCurrentDayOfWeek, formatTime24to12 } from '../../services/timetableService';
import { getTasks, toggleTask } from '../../services/taskService';
import { getExpenseSummary } from '../../services/expenseService';
import { Task, TimetableClass, ExpenseSummary } from '../../types';
import { AppLogo } from '../../components/common/AppLogo';
import { DarkModeToggle } from '../../components/common/DarkModeToggle';
import { SystemNavToggle } from '../../components/common/SystemNavToggle';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useAppTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [nextClassInfo, setNextClassInfo] = useState<{
    cls: TimetableClass;
    isToday: boolean;
    day: string;
  } | null>(null);
  const [pendingTasks, setPendingTasks] = useState<Task[]>([]);
  const [expenseSummary, setExpenseSummary] = useState<ExpenseSummary>({
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

  const loadData = useCallback(async () => {
    try {
      const [nextClass, tasks, summary] = await Promise.all([
        getNextUpcomingClass(),
        getTasks('pending'),
        getExpenseSummary(),
      ]);
      setNextClassInfo(nextClass);
      setPendingTasks(tasks);
      setExpenseSummary(summary);
    } catch (e) {
      console.warn('Error loading dashboard data:', e);
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

  const handleToggleTask = async (task: Task) => {
    await toggleTask(task.id, !task.isCompleted);
    loadData();
  };

  // Formatted date: "Thursday, 24 September"
  const now = new Date();
  const dateFormatted = now.toLocaleDateString(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const todayDay = getCurrentDayOfWeek();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 110 },
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
        {/* Top Header with App Logo, Nav Bar Mode & Dark Mode Switch */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <AppLogo size={46} style={styles.headerLogo} />
            <View style={styles.brandTextCol}>
              <Text style={[styles.brandTitle, { color: theme.primary }]}>
                STUDENT HELPER
              </Text>
              <Text style={[styles.dateText, { color: theme.text }]}>
                {dateFormatted}
              </Text>
            </View>
          </View>

          <View style={styles.headerActions}>
            <SystemNavToggle compact />
            <DarkModeToggle />
          </View>
        </View>

        {/* Quick Action Chips */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: theme.primaryLight }]}
            onPress={() => router.push('/(tabs)/study')}
          >
            <Ionicons name="camera" size={15} color={theme.primary} />
            <Text style={[styles.quickChipText, { color: theme.primary }]}>
              Study Photo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/tasks')}
          >
            <Ionicons name="add-circle" size={15} color={theme.text} />
            <Text style={[styles.quickChipText, { color: theme.text }]}>
              New Task
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickChip, { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1 }]}
            onPress={() => router.push('/(tabs)/expenses')}
          >
            <Ionicons name="wallet" size={15} color={theme.text} />
            <Text style={[styles.quickChipText, { color: theme.text }]}>
              Log Expense
            </Text>
          </TouchableOpacity>
        </View>

        {/* Next Class Card */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            NEXT CLASS
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/classes')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              View Timetable
            </Text>
          </TouchableOpacity>
        </View>

        {nextClassInfo ? (
          <Card
            onPress={() => router.push('/(tabs)/classes')}
            style={[
              styles.nextClassCard,
              { borderLeftColor: theme.primary, borderLeftWidth: 5 },
            ]}
          >
            <View style={styles.classCardHeader}>
              <Text style={[styles.classSubject, { color: theme.text }]}>
                {nextClassInfo.cls.subject}
              </Text>
              <View
                style={[
                  styles.dayBadge,
                  {
                    backgroundColor: nextClassInfo.isToday
                      ? theme.successLight
                      : theme.warningLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayBadgeText,
                    {
                      color: nextClassInfo.isToday
                        ? theme.success
                        : theme.warning,
                    },
                  ]}
                >
                  {nextClassInfo.isToday ? 'Today' : nextClassInfo.day}
                </Text>
              </View>
            </View>

            <View style={styles.classMetaRow}>
              <View style={styles.classMetaItem}>
                <Ionicons name="time-outline" size={15} color={theme.textMuted} />
                <Text style={[styles.classMetaText, { color: theme.textMuted }]}>
                  {formatTime24to12(nextClassInfo.cls.startTime)} -{' '}
                  {formatTime24to12(nextClassInfo.cls.endTime)}
                </Text>
              </View>

              <View style={styles.classMetaItem}>
                <Ionicons name="location-outline" size={15} color={theme.primary} />
                <Text style={[styles.classMetaText, { color: theme.textMuted }]}>
                  {nextClassInfo.cls.room}
                </Text>
              </View>

              {nextClassInfo.cls.teacher ? (
                <View style={styles.classMetaItem}>
                  <Ionicons name="person-outline" size={14} color={theme.secondary} />
                  <Text style={[styles.classMetaText, { color: theme.textMuted }]}>
                    {nextClassInfo.cls.teacher}
                  </Text>
                </View>
              ) : null}
            </View>
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="sunny-outline" size={24} color={theme.success} />
            <Text style={[styles.emptyCardText, { color: theme.textMuted }]}>
              No upcoming classes scheduled. Enjoy your free time!
            </Text>
          </Card>
        )}

        {/* Tasks Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            TASKS ({pendingTasks.length} pending)
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              View All
            </Text>
          </TouchableOpacity>
        </View>

        {pendingTasks.length > 0 ? (
          <Card padding={8} style={styles.tasksListCard}>
            {pendingTasks.slice(0, 3).map((task) => (
              <TouchableOpacity
                key={task.id}
                activeOpacity={0.7}
                onPress={() => handleToggleTask(task)}
                style={[
                  styles.taskRow,
                  { borderBottomColor: theme.borderLight },
                ]}
              >
                <View
                  style={[
                    styles.checkbox,
                    { borderColor: theme.textSubtle },
                  ]}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.taskTitle, { color: theme.text }]}
                >
                  {task.title}
                </Text>
                {task.priority === 'high' && (
                  <View style={[styles.prioDot, { backgroundColor: theme.danger }]} />
                )}
              </TouchableOpacity>
            ))}
          </Card>
        ) : (
          <Card style={styles.emptyCard}>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
            <Text style={[styles.emptyCardText, { color: theme.textMuted }]}>
              All tasks completed! You are all caught up.
            </Text>
          </Card>
        )}

        {/* Expenses Summary Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            EXPENSES
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/expenses')}>
            <Text style={[styles.seeAllText, { color: theme.primary }]}>
              Manage
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.expensesGrid}>
          <Card
            onPress={() => router.push('/(tabs)/expenses')}
            style={styles.expenseSummaryCard}
          >
            <View style={styles.expenseCardHeader}>
              <Text style={[styles.expenseLabel, { color: theme.textMuted }]}>
                Today's Expenses
              </Text>
              <Ionicons name="today-outline" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.expenseValue, { color: theme.text }]}>
              {expenseSummary.currencySymbol}{' '}
              {expenseSummary.todaySpending.toLocaleString()}
            </Text>
          </Card>

          <Card
            onPress={() => router.push('/(tabs)/expenses')}
            style={styles.expenseSummaryCard}
          >
            <View style={styles.expenseCardHeader}>
              <Text style={[styles.expenseLabel, { color: theme.textMuted }]}>
                Monthly Spending
              </Text>
              <Ionicons name="calendar-outline" size={16} color={theme.secondary} />
            </View>
            <Text style={[styles.expenseValue, { color: theme.text }]}>
              {expenseSummary.currencySymbol}{' '}
              {expenseSummary.monthlySpending.toLocaleString()}
            </Text>
          </Card>
        </View>

        {expenseSummary.monthlyBudget > 0 && (
          <Card
            onPress={() => router.push('/(tabs)/expenses')}
            style={styles.budgetSnippetCard}
          >
            <View style={styles.budgetSnippetRow}>
              <Text style={[styles.budgetSnippetLabel, { color: theme.textMuted }]}>
                Budget Status:
              </Text>
              <Text
                style={[
                  styles.budgetSnippetRemaining,
                  {
                    color:
                      expenseSummary.monthlySpending > expenseSummary.monthlyBudget
                        ? theme.danger
                        : theme.success,
                  },
                ]}
              >
                {expenseSummary.monthlySpending > expenseSummary.monthlyBudget
                  ? `Over by ${expenseSummary.currencySymbol} ${(
                      expenseSummary.monthlySpending - expenseSummary.monthlyBudget
                    ).toLocaleString()}`
                  : `${expenseSummary.currencySymbol} ${expenseSummary.remainingBudget.toLocaleString()} remaining`}
              </Text>
            </View>
          </Card>
        )}
      </ScrollView>
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
  header: {
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
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  headerLogo: {
    marginRight: 10,
  },
  brandTextCol: {
    flex: 1,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '800',
  },
  quickActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextClassCard: {
    marginBottom: 14,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classSubject: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  dayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 14,
  },
  classMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  classMetaText: {
    fontSize: 13,
  },
  tasksListCard: {
    marginBottom: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    marginRight: 10,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  prioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  emptyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    marginBottom: 14,
  },
  emptyCardText: {
    fontSize: 13,
    flex: 1,
  },
  expensesGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  expenseSummaryCard: {
    flex: 1,
    padding: 12,
  },
  expenseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  expenseLabel: {
    fontSize: 12,
  },
  expenseValue: {
    fontSize: 17,
    fontWeight: '800',
  },
  budgetSnippetCard: {
    padding: 12,
    marginBottom: 14,
  },
  budgetSnippetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetSnippetLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  budgetSnippetRemaining: {
    fontSize: 12,
    fontWeight: '700',
  },
});
