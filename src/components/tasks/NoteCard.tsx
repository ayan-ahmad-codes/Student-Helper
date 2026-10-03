import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Note } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

export interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const { theme } = useAppTheme();

  const formattedDate = note.updatedAt
    ? new Date(note.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onEdit(note)}
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <Text
          numberOfLines={1}
          style={[styles.title, { color: theme.text }]}
        >
          {note.title}
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onEdit(note)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.actionBtn}
          >
            <Ionicons name="pencil-outline" size={16} color={theme.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(note)}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            style={styles.actionBtn}
          >
            <Ionicons name="trash-outline" size={16} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <Text
        numberOfLines={3}
        style={[styles.content, { color: theme.textMuted }]}
      >
        {note.content}
      </Text>

      {formattedDate ? (
        <View style={styles.footer}>
          <Ionicons name="time-outline" size={12} color={theme.textSubtle} />
          <Text style={[styles.dateText, { color: theme.textSubtle }]}>
            {formattedDate}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    padding: 2,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    fontSize: 11,
  },
});
