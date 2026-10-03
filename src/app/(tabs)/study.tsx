import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../../context/ThemeContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { DarkModeToggle } from '../../components/common/DarkModeToggle';
import { FileItem } from '../../components/study/FileItem';
import { FolderCard } from '../../components/study/FolderCard';
import {
  getFolders,
  addFolder,
  updateFolder,
  deleteFolder,
  getFiles,
  addFile,
  renameFile,
  deleteFile,
} from '../../services/studyService';
import {
  detectFileType,
  savePhotoToAppStorage,
  saveImportedFileToAppStorage,
  openFileWithDevice,
} from '../../services/fileStorageService';
import { SubjectFolder, StudyFile } from '../../types';
import { FolderColors } from '../../constants/theme';

export default function StudyScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<SubjectFolder[]>([]);
  const [files, setFiles] = useState<StudyFile[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<number | undefined>(undefined);
  const [refreshing, setRefreshing] = useState(false);

  // Modals state
  const [folderModalVisible, setFolderModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<SubjectFolder | null>(null);
  const [folderNameInput, setFolderNameInput] = useState('');
  const [folderColorInput, setFolderColorInput] = useState('#4F46E5');

  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [editingFile, setEditingFile] = useState<StudyFile | null>(null);
  const [renameInput, setRenameInput] = useState('');

  const [pickFolderModalVisible, setPickFolderModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<'camera' | 'import' | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [fetchedFolders, fetchedFiles] = await Promise.all([
        getFolders(),
        getFiles(selectedFolderId, searchQuery),
      ]);
      setFolders(fetchedFolders);
      setFiles(fetchedFiles);
    } catch (e) {
      console.warn('Error loading study data:', e);
    }
  }, [selectedFolderId, searchQuery]);

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

  // --- Folder Management ---
  const handleOpenAddFolder = () => {
    setEditingFolder(null);
    setFolderNameInput('');
    setFolderColorInput(FolderColors[folders.length % FolderColors.length]);
    setFolderModalVisible(true);
  };

  const handleOpenEditFolder = (folder: SubjectFolder) => {
    setEditingFolder(folder);
    setFolderNameInput(folder.name);
    setFolderColorInput(folder.color || '#4F46E5');
    setFolderModalVisible(true);
  };

  const handleSaveFolder = async () => {
    if (!folderNameInput.trim()) {
      Alert.alert('Required', 'Please enter a folder name.');
      return;
    }
    if (editingFolder) {
      await updateFolder(editingFolder.id, folderNameInput.trim(), folderColorInput);
    } else {
      await addFolder(folderNameInput.trim(), folderColorInput);
    }
    setFolderModalVisible(false);
    loadData();
  };

  const handleDeleteFolder = (folder: SubjectFolder) => {
    Alert.alert(
      'Delete Folder',
      `Are you sure you want to delete "${folder.name}" and all its study files?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteFolder(folder.id);
            if (selectedFolderId === folder.id) {
              setSelectedFolderId(undefined);
            }
            loadData();
          },
        },
      ]
    );
  };

  // --- File Actions ---
  const handleOpenFile = async (file: StudyFile) => {
    const success = await openFileWithDevice(file.fileUri, file.mimeType, file.fileName);
    if (!success) {
      Alert.alert(
        'Open File',
        'Could not open this file automatically. Make sure you have a compatible viewer installed.'
      );
    }
  };

  const handleOpenRename = (file: StudyFile) => {
    setEditingFile(file);
    setRenameInput(file.fileName);
    setRenameModalVisible(true);
  };

  const handleSaveRename = async () => {
    if (!renameInput.trim() || !editingFile) return;
    await renameFile(editingFile.id, renameInput.trim());
    setRenameModalVisible(false);
    loadData();
  };

  const handleDeleteFile = (file: StudyFile) => {
    Alert.alert('Delete File', `Delete "${file.fileName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteFile(file.id);
          loadData();
        },
      },
    ]);
  };

  // --- Import / Camera Flow ---
  const initiateAction = (action: 'camera' | 'import') => {
    if (folders.length === 0) {
      Alert.alert('No Subject Folder', 'Please create a subject folder first.');
      return;
    }
    if (selectedFolderId) {
      // Direct action with selected folder
      executeFileAction(action, selectedFolderId);
    } else {
      // Ask user which folder to assign to
      setPendingAction(action);
      setPickFolderModalVisible(true);
    }
  };

  const executeFileAction = async (action: 'camera' | 'import', targetFolderId: number) => {
    try {
      if (action === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Camera Permission', 'Camera permission is required to capture photos of notes.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          quality: 0.8,
          allowsEditing: false,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const folderObj = folders.find((f) => f.id === targetFolderId);
          const baseName = `${folderObj ? folderObj.name : 'Notes'}_Board`;
          const saved = await savePhotoToAppStorage(asset.uri, baseName);

          const now = new Date();
          const timeStr = `${now.getHours()}:${now.getMinutes()}`;
          const fileName = `${folderObj?.name || 'Class'}_Note_${timeStr}.jpg`;

          await addFile({
            folderId: targetFolderId,
            fileName,
            originalName: asset.fileName || fileName,
            fileUri: saved.uri,
            fileType: 'image',
            mimeType: 'image/jpeg',
            fileSize: saved.size,
          });

          loadData();
        }
      } else if (action === 'import') {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/*', '*/*'],
          copyToCacheDirectory: true,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          const saved = await saveImportedFileToAppStorage(asset.uri, asset.name);
          const fileType = detectFileType(asset.name, asset.mimeType);

          await addFile({
            folderId: targetFolderId,
            fileName: asset.name,
            originalName: asset.name,
            fileUri: saved.uri,
            fileType,
            mimeType: asset.mimeType || undefined,
            fileSize: saved.size || asset.size || 0,
          });

          loadData();
        }
      }
    } catch (err) {
      console.warn('Error during file action:', err);
      Alert.alert('Error', 'Could not process the selected file.');
    }
  };

  const handleSelectFolderForPendingAction = (folderId: number) => {
    setPickFolderModalVisible(false);
    if (pendingAction) {
      const act = pendingAction;
      setPendingAction(null);
      setTimeout(() => {
        executeFileAction(act, folderId);
      }, 300);
    }
  };

  const activeFolderName = folders.find((f) => f.id === selectedFolderId)?.name;

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: 100 },
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
        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>
            Study Material
          </Text>
          <View style={styles.headerActions}>
            <DarkModeToggle />
            <Button
              title="Import File"
              icon="document-attach-outline"
              size="sm"
              variant="outline"
              onPress={() => initiateAction('import')}
            />
          </View>
        </View>

        {/* Search Bar matching prompt requirement */}
        <Input
          placeholder="Search study material..."
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
          }}
          icon="search-outline"
          containerStyle={styles.searchContainer}
        />

        {/* Subjects Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            SUBJECTS
          </Text>
          <TouchableOpacity onPress={handleOpenAddFolder}>
            <Text style={[styles.addFolderText, { color: theme.primary }]}>
              + Add Subject
            </Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Subjects list */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.foldersScroll}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setSelectedFolderId(undefined)}
            style={[
              styles.allFolderChip,
              {
                backgroundColor:
                  selectedFolderId === undefined
                    ? theme.primaryLight
                    : theme.card,
                borderColor:
                  selectedFolderId === undefined
                    ? theme.primary
                    : theme.border,
                borderWidth: selectedFolderId === undefined ? 1.5 : 1,
              },
            ]}
          >
            <Ionicons
              name="albums-outline"
              size={18}
              color={
                selectedFolderId === undefined
                  ? theme.primary
                  : theme.textMuted
              }
            />
            <Text
              style={[
                styles.allFolderText,
                {
                  color:
                    selectedFolderId === undefined
                      ? theme.primary
                      : theme.text,
                },
              ]}
            >
              All Files ({files.length})
            </Text>
          </TouchableOpacity>

          {folders.map((folder) => (
            <FolderCard
              key={folder.id}
              folder={folder}
              isSelected={selectedFolderId === folder.id}
              onPress={() =>
                setSelectedFolderId(
                  selectedFolderId === folder.id ? undefined : folder.id
                )
              }
              onEdit={() => handleOpenEditFolder(folder)}
              onDelete={() => handleDeleteFolder(folder)}
            />
          ))}
        </ScrollView>

        {/* Files Section */}
        <View style={styles.filesHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
            {activeFolderName ? `${activeFolderName.toUpperCase()} FILES` : 'ALL FILES'} (
            {files.length})
          </Text>
          {selectedFolderId !== undefined && (
            <TouchableOpacity onPress={() => setSelectedFolderId(undefined)}>
              <Text style={[styles.clearFilterText, { color: theme.primary }]}>
                Clear Filter
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {files.length > 0 ? (
          files.map((file) => (
            <FileItem
              key={file.id}
              file={file}
              onOpen={handleOpenFile}
              onRename={handleOpenRename}
              onDelete={handleDeleteFile}
            />
          ))
        ) : (
          <EmptyState
            icon="document-text-outline"
            title={searchQuery ? 'No matching files' : 'No study materials yet'}
            description={
              searchQuery
                ? `No files matching "${searchQuery}".`
                : 'Snap a picture of the whiteboard or import PDFs, Word docs, and slides.'
            }
            actionLabel="Import File"
            onAction={() => initiateAction('import')}
          />
        )}
      </ScrollView>

      {/* Floating Camera Button matching prompt requirement */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => initiateAction('camera')}
        style={[
          styles.fab,
          {
            backgroundColor: theme.primary,
            bottom: Platform.OS === 'ios' ? 100 : 80,
          },
        ]}
        accessibilityLabel="Take Photo of Notes"
      >
        <Ionicons name="camera" size={26} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add / Edit Folder Modal */}
      <ModalWrapper
        visible={folderModalVisible}
        onClose={() => setFolderModalVisible(false)}
        title={editingFolder ? 'Edit Subject Folder' : 'New Subject Folder'}
      >
        <Input
          label="Subject Name"
          placeholder="e.g. Database Systems"
          value={folderNameInput}
          onChangeText={setFolderNameInput}
          autoCapitalize="words"
        />

        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
          Folder Color
        </Text>
        <View style={styles.colorRow}>
          {FolderColors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setFolderColorInput(c)}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderColor: folderColorInput === c ? theme.text : 'transparent',
                  borderWidth: folderColorInput === c ? 2.5 : 0,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={editingFolder ? 'Update Subject' : 'Create Subject'}
          onPress={handleSaveFolder}
          style={{ marginTop: 18 }}
        />
      </ModalWrapper>

      {/* Rename File Modal */}
      <ModalWrapper
        visible={renameModalVisible}
        onClose={() => setRenameModalVisible(false)}
        title="Rename File"
      >
        <Input
          label="File Name"
          value={renameInput}
          onChangeText={setRenameInput}
          autoCapitalize="sentences"
        />

        <Button
          title="Save Name"
          onPress={handleSaveRename}
          style={{ marginTop: 12 }}
        />
      </ModalWrapper>

      {/* Choose Folder Destination Modal */}
      <ModalWrapper
        visible={pickFolderModalVisible}
        onClose={() => setPickFolderModalVisible(false)}
        title="Save to Subject Folder"
      >
        <Text style={[styles.selectFolderCaption, { color: theme.textMuted }]}>
          Select which subject folder this material belongs to:
        </Text>
        {folders.map((f) => (
          <TouchableOpacity
            key={f.id}
            onPress={() => handleSelectFolderForPendingAction(f.id)}
            style={[
              styles.folderOption,
              {
                backgroundColor: theme.card,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.folderDot,
                { backgroundColor: f.color || theme.primary },
              ]}
            />
            <Text style={[styles.folderOptionName, { color: theme.text }]}>
              {f.name}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.textSubtle} />
          </TouchableOpacity>
        ))}
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
    marginBottom: 14,
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
  searchContainer: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  addFolderText: {
    fontSize: 13,
    fontWeight: '600',
  },
  foldersScroll: {
    paddingBottom: 14,
  },
  allFolderChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    height: 60,
    marginRight: 10,
  },
  allFolderText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  clearFilterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  selectFolderCaption: {
    fontSize: 13,
    marginBottom: 14,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  folderDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  folderOptionName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
});
