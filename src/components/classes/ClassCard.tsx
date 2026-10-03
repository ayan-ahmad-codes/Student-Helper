import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TimetableClass } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { formatTime24to12 } from '../../services/timetableService';

export interface ClassCardProps {
  classItem: TimetableClass;
  onEdit?: (classItem: TimetableClass) => void;
  onDelete?: (classItem: TimetableClass) => void;
  isUpcoming?: boolean;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  onEdit,
  onDelete,
  isUpcoming = false,
}) => {
  const { theme } = useAppTheme();
  const classColor = classItem.color || theme.primary;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: isUpcoming ? theme.primary : theme.border,
          borderLeftColor: classColor,
          borderLeftWidth: 5,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.timeBadge}>
          <Ionicons name="time-outline" size={14} color={theme.textMuted} />
          <Text style={[styles.timeText, { color: theme.textMuted }]}>
            {formatTime24to12(classItem.startTime)} - {formatTime24to12(classItem.endTime)}
          </Text>
        </View>

        <View style={styles.actionButtons}>
          {onEdit && (
            <TouchableOpacity
              onPress={() => onEdit(classItem)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="pencil-outline" size={17} color={theme.textMuted} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={() => onDelete(classItem)}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={17} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={[styles.subject, { color: theme.text }]}>
        {classItem.subject}
      </Text>

      <View style={styles.footerRow}>
        <View style={styles.metaItem}>
          <Ionicons name="location-outline" size={15} color={theme.primary} />
          <Text style={[styles.metaText, { color: theme.textMuted }]}>
            {classItem.room}
          </Text>
        </View>

        {classItem.teacher ? (
          <View style={styles.metaItem}>
            <Ionicons name="person-outline" size={14} color={theme.secondary} />
            <Text style={[styles.metaText, { color: theme.textMuted }]}>
              {classItem.teacher}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
  subject: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
