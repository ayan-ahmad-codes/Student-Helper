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
import { EmptyState } from '../../components/common/EmptyState';
import { ModalWrapper } from '../../components/common/ModalWrapper';
import { DarkModeToggle } from '../../components/common/DarkModeToggle';
import { SystemNavToggle } from '../../components/common/SystemNavToggle';
import { TaskItem } from '../../components/tasks/TaskItem';
import { NoteCard } from '../../components/tasks/NoteCard';
import {
  getTasks,
  addTask,
  updateTask,
  toggleTask,
  deleteTask,
  getNotes,
  addNote,
  updateNote,
  deleteNote,
} from '../../services/taskService';
import { Task, Note } from '../../types';

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Quick inline add for task
  const [quickTaskTitle, setQuickTaskTitle] = useState('');

  // Task Modal state (for detailed edit or add with due date/priority)
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitleInput, setTaskTitleInput] = useState('');
  const [taskDueDateInput, setTaskDueDateInput] = useState('');
  const [taskPriorityInput, setTaskPriorityInput] = useState<'low' | 'medium' | 'high'>('medium');

  // Note Modal state
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitleInput, setNoteTitleInput] = useState('');
  const [noteContentInput, setNoteContentInput] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [fetchedTasks, fetchedNotes] = await Promise.all([
        getTasks(taskFilter),
        getNotes(),
      ]);
      setTasks(fetchedTasks);
      setNotes(fetchedNotes);
    } catch (e) {
      console.warn('Error loading tasks/notes:', e);
    }
  }, [taskFilter]);

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

  // --- Task Handlers ---
  const handleQuickAddTask = async () => {
    if (!quickTaskTitle.trim()) return;
    await addTask(quickTaskTitle.trim());
    setQuickTaskTitle('');
    loadData();
  };

  const handleOpenAddTaskModal = () => {
    setEditingTask(null);
    setTaskTitleInput('');
    setTaskDueDateInput('');
    setTaskPriorityInput('medium');
    setTaskModalVisible(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskTitleInput(task.title);
    setTaskDueDateInput(task.dueDate || '');
    setTaskPriorityInput(task.priority || 'medium');
    setTaskModalVisible(true);
  };

  const handleSaveTaskModal = async () => {
    if (!taskTitleInput.trim()) {
      Alert.alert('Required', 'Please enter a task title.');
      return;
    }
    if (editingTask) {
      await updateTask(
        editingTask.id,
        taskTitleInput.trim(),
        taskDueDateInput.trim() || undefined,
        taskPriorityInput
      );
    } else {
      await addTask(
        taskTitleInput.trim(),
        taskDueDateInput.trim() || undefined,
        taskPriorityInput
      );
    }
    setTaskModalVisible(false);
    loadData();
  };

  const handleToggleTask = async (task: Task) => {
    await toggleTask(task.id, !task.isCompleted);
    loadData();
  };

  const handleDeleteTask = (task: Task) => {
    Alert.alert('Delete Task', `Delete "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTask(task.id);
          loadData();
        },
      },
    ]);
  };

  // --- Note Handlers ---
  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteTitleInput('');
    setNoteContentInput('');
    setNoteModalVisible(true);
  };

  const handleOpenEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteTitleInput(note.title);
    setNoteContentInput(note.content);
    setNoteModalVisible(true);
  };

  const handleSaveNote = async () => {
    if (!noteContentInput.trim()) {
      Alert.alert('Required', 'Please enter note content.');
      return;
    }
    if (editingNote) {
      await updateNote(editingNote.id, noteTitleInput, noteContentInput);
    } else {
      await addNote(noteTitleInput, noteContentInput);
    }
    setNoteModalVisible(false);
    loadData();
  };

  const handleDeleteNote = (note: Note) => {
    Alert.alert('Delete Note', `Delete note "${note.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          loadData();
        },
      },
    ]);
  };

  const pendingCount = tasks.filter((t) => !t.isCompleted).length;

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
        {/* Top Header */}
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: theme.text }]}>
            Tasks & Notes
          </Text>
          <View style={styles.headerActions}>
            <SystemNavToggle compact />
            <DarkModeToggle />
            <Button
              title={activeTab === 'tasks' ? 'New Task' : 'New Note'}
              icon="add"
              size="sm"
              onPress={activeTab === 'tasks' ? handleOpenAddTaskModal : handleOpenAddNote}
            />
          </View>
        </View>

        {/* Segmented Switcher (Tasks vs Notes) */}
        <View
          style={[
            styles.segmentContainer,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('tasks')}
            style={[
              styles.segmentBtn,
              activeTab === 'tasks' && { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons
              name="checkbox-outline"
              size={16}
              color={activeTab === 'tasks' ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'tasks' ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              Tasks ({tasks.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('notes')}
            style={[
              styles.segmentBtn,
              activeTab === 'notes' && { backgroundColor: theme.primary },
            ]}
          >
            <Ionicons
              name="document-text-outline"
              size={16}
              color={activeTab === 'notes' ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === 'notes' ? '#FFFFFF' : theme.textMuted },
              ]}
            >
              Quick Notes ({notes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab 1: Tasks Content */}
        {activeTab === 'tasks' ? (
          <>
            {/* Quick Task Input Bar */}
            <View style={styles.quickAddRow}>
              <View style={{ flex: 1 }}>
                <Input
                  placeholder="Quick add task..."
                  value={quickTaskTitle}
                  onChangeText={setQuickTaskTitle}
                  containerStyle={{ marginBottom: 0 }}
                />
              </View>
              <Button
                title="Add"
                size="md"
                onPress={handleQuickAddTask}
                style={styles.quickAddBtn}
              />
            </View>

            {/* Filter Pills */}
            <View style={styles.filterRow}>
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setTaskFilter(f)}
                  style={[
                    styles.filterPill,
                    {
                      backgroundColor:
                        taskFilter === f ? theme.primaryLight : theme.card,
                      borderColor:
                        taskFilter === f ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      {
                        color:
                          taskFilter === f ? theme.primary : theme.textMuted,
                        fontWeight: taskFilter === f ? '700' : '500',
                      },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tasks List */}
            {tasks.length > 0 ? (
              tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggleTask}
                  onEdit={handleOpenEditTask}
                  onDelete={handleDeleteTask}
                />
              ))
            ) : (
              <EmptyState
                icon="checkmark-done-circle-outline"
                title={
                  taskFilter === 'completed'
                    ? 'No completed tasks'
                    : taskFilter === 'pending'
                    ? 'No pending tasks'
                    : 'No tasks yet'
                }
                description={
                  taskFilter === 'pending'
                    ? 'Great job! You have cleared all pending tasks.'
                    : 'Add assignments, lab reports, and exam deadlines.'
                }
                actionLabel="+ Add Task"
                onAction={handleOpenAddTaskModal}
              />
            )}
          </>
        ) : (
          /* Tab 2: Notes Content */
          <>
            {notes.length > 0 ? (
              notes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleOpenEditNote}
                  onDelete={handleDeleteNote}
                />
              ))
            ) : (
              <EmptyState
                icon="create-outline"
                title="No notes saved"
                description='Quickly jot down professor hints, midterm coverage, or reminders like "Sir said the midterm covers chapters 1–4."'
                actionLabel="+ New Note"
                onAction={handleOpenAddNote}
              />
            )}
          </>
        )}
      </ScrollView>

      {/* Add / Edit Task Modal */}
      <ModalWrapper
        visible={taskModalVisible}
        onClose={() => setTaskModalVisible(false)}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <Input
          label="Task Description"
          placeholder="e.g. Submit DB assignment"
          value={taskTitleInput}
          onChangeText={setTaskTitleInput}
          autoCapitalize="sentences"
        />

        <Input
          label="Due Date (Optional)"
          placeholder="e.g. Next Monday, 5 PM"
          value={taskDueDateInput}
          onChangeText={setTaskDueDateInput}
        />

        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
          Priority
        </Text>
        <View style={styles.priorityRow}>
          {(['low', 'medium', 'high'] as const).map((p) => {
            const isSelected = taskPriorityInput === p;
            return (
              <TouchableOpacity
                key={p}
                onPress={() => setTaskPriorityInput(p)}
                style={[
                  styles.priorityPill,
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
                <Text
                  style={[
                    styles.priorityPillText,
                    {
                      color: isSelected ? theme.primary : theme.text,
                      fontWeight: isSelected ? '700' : '500',
                    },
                  ]}
                >
                  {p.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button
          title={editingTask ? 'Update Task' : 'Save Task'}
          onPress={handleSaveTaskModal}
          style={{ marginTop: 18 }}
        />
      </ModalWrapper>

      {/* Add / Edit Note Modal */}
      <ModalWrapper
        visible={noteModalVisible}
        onClose={() => setNoteModalVisible(false)}
        title={editingNote ? 'Edit Note' : 'Add Quick Note'}
      >
        <Input
          label="Note Title (Optional)"
          placeholder="e.g. Midterm Scope"
          value={noteTitleInput}
          onChangeText={setNoteTitleInput}
          autoCapitalize="sentences"
        />

        <Input
          label="Note Content"
          placeholder='e.g. "Sir said the midterm covers chapters 1–4."'
          value={noteContentInput}
          onChangeText={setNoteContentInput}
          multiline
          numberOfLines={4}
          autoCapitalize="sentences"
        />

        <Button
          title={editingNote ? 'Update Note' : 'Save Note'}
          onPress={handleSaveNote}
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
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    marginBottom: 16,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '700',
  },
  quickAddRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  quickAddBtn: {
    height: 46,
    paddingHorizontal: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  filterPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
  },
  priorityPillText: {
    fontSize: 12,
  },
});
