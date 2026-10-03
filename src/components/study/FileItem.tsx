import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StudyFile } from '../../types';
import { useAppTheme } from '../../context/ThemeContext';
import { formatFileSize } from '../../services/fileStorageService';

export interface FileItemProps {
  file: StudyFile;
  onOpen: (file: StudyFile) => void;
  onRename: (file: StudyFile) => void;
  onDelete: (file: StudyFile) => void;
}

export const FileItem: React.FC<FileItemProps> = ({
  file,
  onOpen,
  onRename,
  onDelete,
}) => {
  const { theme } = useAppTheme();

  const getFileIconConfig = () => {
    switch (file.fileType) {
      case 'pdf':
        return { name: 'document-text' as const, color: '#EF4444', bg: '#FEE2E2' };
      case 'doc':
        return { name: 'document' as const, color: '#0284C7', bg: '#E0F2FE' };
      case 'image':
        return { name: 'image' as const, color: '#10B981', bg: '#D1FAE5' };
      default:
        return { name: 'attach' as const, color: '#8B5CF6', bg: '#EDE9FE' };
    }
  };

  const iconConfig = getFileIconConfig();
  const dateFormatted = file.createdAt
    ? new Date(file.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onOpen(file)}
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: iconConfig.bg }]}>
        <Ionicons name={iconConfig.name} size={22} color={iconConfig.color} />
      </View>

      <View style={styles.infoCol}>
        <Text
          numberOfLines={1}
          ellipsizeMode="middle"
          style={[styles.fileName, { color: theme.text }]}
        >
          {file.fileName}
        </Text>

        <View style={styles.metaRow}>
          {file.folderName && (
            <View style={[styles.tag, { backgroundColor: theme.primaryLight }]}>
              <Text
                numberOfLines={1}
                style={[styles.tagText, { color: theme.primary }]}
              >
                {file.folderName}
              </Text>
            </View>
          )}

          <Text style={[styles.metaText, { color: theme.textMuted }]}>
            {formatFileSize(file.fileSize)}
          </Text>

          {dateFormatted ? (
            <>
              <Text style={[styles.bullet, { color: theme.textSubtle }]}>•</Text>
              <Text style={[styles.metaText, { color: theme.textMuted }]}>
                {dateFormatted}
              </Text>
            </>
          ) : null}
        </View>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={() => onRename(file)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          style={styles.actionBtn}
        >
          <Ionicons name="pencil-outline" size={18} color={theme.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onDelete(file)}
          hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          style={styles.actionBtn}
        >
          <Ionicons name="trash-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    maxWidth: 120,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  metaText: {
    fontSize: 11,
  },
  bullet: {
    fontSize: 11,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 6,
    gap: 8,
  },
  actionBtn: {
    padding: 4,
  },
});
