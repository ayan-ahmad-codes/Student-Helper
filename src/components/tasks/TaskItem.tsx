import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Task } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { Badge } from '../common/Badge';

export interface TaskItemProps {
  task: Task;
  onToggle: (task: Task) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const { theme } = useAppTheme();

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return theme.danger;
      case 'low':
        return theme.success;
      case 'medium':
      default:
        return theme.warning;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          opacity: task.isCompleted ? 0.75 : 1,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(task)}
        style={[
          styles.checkbox,
          {
            borderColor: task.isCompleted ? theme.primary : theme.textSubtle,
            backgroundColor: task.isCompleted ? theme.primary : 'transparent',
          },
        ]}
      >
        {task.isCompleted && (
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        )}
      </TouchableOpacity>

      <View style={styles.contentCol}>
        <Text
          style={[
            styles.title,
            {
              color: task.isCompleted ? theme.textMuted : theme.text,
              textDecorationLine: task.isCompleted ? 'line-through' : 'none',
            },
          ]}
        >
          {task.title}
        </Text>

        <View style={styles.metaRow}>
          {task.priority && (
            <Badge
              label={task.priority.toUpperCase()}
              color={getPriorityColor()}
              size="sm"
            />
          )}

          {task.dueDate ? (
            <View style={styles.dueBox}>
              <Ionicons name="calendar-outline" size={12} color={theme.textMuted} />
              <Text style={[styles.dueText, { color: theme.textMuted }]}>
                {task.dueDate}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(task)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity
            onPress={() => onDelete(task)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.actionBtn}
          >
            <Ionicons name="trash-outline" size={16} color={theme.danger} />
          </TouchableOpacity>
        )}
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
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  contentCol: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dueBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dueText: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  actionBtn: {
    padding: 2,
  },
});
