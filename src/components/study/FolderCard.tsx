import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectFolder } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';

export interface FolderCardProps {
  folder: SubjectFolder;
  isSelected?: boolean;
  onPress: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({
  folder,
  isSelected = false,
  onPress,
  onDelete,
  onEdit,
}) => {
  const { theme } = useAppTheme();
  const folderColor = folder.color || '#4F46E5';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? theme.primaryLight : theme.card,
          borderColor: isSelected ? theme.primary : theme.border,
          borderWidth: isSelected ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.folderIconBox, { backgroundColor: `${folderColor}20` }]}>
          <Ionicons name="folder" size={20} color={folderColor} />
        </View>

        <View style={styles.actionIcons}>
          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="pencil" size={14} color={theme.textSubtle} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              onPress={onDelete}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              style={styles.actionBtn}
            >
              <Ionicons name="trash-outline" size={14} color={theme.danger} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.folderName,
          { color: isSelected ? theme.primary : theme.text },
        ]}
      >
        {folder.name}
      </Text>

      <Text style={[styles.fileCount, { color: theme.textMuted }]}>
        {folder.fileCount === 1 ? '1 file' : `${folder.fileCount || 0} files`}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 12,
    minWidth: 130,
    marginRight: 10,
    marginBottom: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  folderIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionBtn: {
    padding: 2,
  },
  folderName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  fileCount: {
    fontSize: 12,
  },
});
