import React, { useState, useCallback, useEffect } from 'react';
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
import { ClassCard } from '../../components/classes/ClassCard';
import {
  getClassesByDay,
  getAllClasses,
  addClass,
  updateClass,
  deleteClass,
  getCurrentDayOfWeek,
} from '../../services/timetableService';
import { TimetableClass, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { FolderColors } from '../../constants/theme';

export default function ClassesScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [classes, setClasses] = useState<TimetableClass[]>([]);
  const [dayCounts, setDayCounts] = useState<Record<DayOfWeek, number>>({
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  // Add / Edit Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);
  const [subjectInput, setSubjectInput] = useState('');
  const [teacherInput, setTeacherInput] = useState('');
  const [roomInput, setRoomInput] = useState('');
  const [dayInput, setDayInput] = useState<DayOfWeek>(getCurrentDayOfWeek());
  const [startTimeInput, setStartTimeInput] = useState('09:00');
  const [endTimeInput, setEndTimeInput] = useState('10:30');
  const [colorInput, setColorInput] = useState('#4F46E5');

  const loadData = useCallback(async () => {
    try {
      const [dayClasses, allClasses] = await Promise.all([
        getClassesByDay(selectedDay),
        getAllClasses(),
      ]);
      setClasses(dayClasses);

      const counts: Record<DayOfWeek, number> = {
        Monday: 0,
        Tuesday: 0,
        Wednesday: 0,
        Thursday: 0,
        Friday: 0,
        Saturday: 0,
        Sunday: 0,
      };
      allClasses.forEach((c) => {
        if (counts[c.day] !== undefined) {
          counts[c.day]++;
        }
      });
      setDayCounts(counts);
    } catch (e) {
      console.warn('Error loading classes:', e);
    }
  }, [selectedDay]);

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

  const handleOpenAdd = () => {
    setEditingClass(null);
    setSubjectInput('');
    setTeacherInput('');
    setRoomInput('');
    setDayInput(selectedDay);
    setStartTimeInput('09:00');
    setEndTimeInput('10:30');
    setColorInput(FolderColors[classes.length % FolderColors.length]);
    setModalVisible(true);
  };

  const handleOpenEdit = (cls: TimetableClass) => {
    setEditingClass(cls);
    setSubjectInput(cls.subject);
    setTeacherInput(cls.teacher);
    setRoomInput(cls.room);
    setDayInput(cls.day);
    setStartTimeInput(cls.startTime);
    setEndTimeInput(cls.endTime);
    setColorInput(cls.color || '#4F46E5');
    setModalVisible(true);
  };

  const handleSaveClass = async () => {
    if (!subjectInput.trim()) {
      Alert.alert('Required', 'Please enter a subject name.');
      return;
    }
    if (!roomInput.trim()) {
      Alert.alert('Required', 'Please enter a room / lab location.');
      return;
    }
    if (!startTimeInput.trim() || !endTimeInput.trim()) {
      Alert.alert('Required', 'Please enter class start and end times.');
      return;
    }

    if (editingClass) {
      await updateClass(editingClass.id, {
        subject: subjectInput.trim(),
        teacher: teacherInput.trim(),
        room: roomInput.trim(),
        day: dayInput,
        startTime: startTimeInput.trim(),
        endTime: endTimeInput.trim(),
        color: colorInput,
      });
    } else {
      await addClass({
        subject: subjectInput.trim(),
        teacher: teacherInput.trim(),
        room: roomInput.trim(),
        day: dayInput,
        startTime: startTimeInput.trim(),
        endTime: endTimeInput.trim(),
        color: colorInput,
      });
    }

    setModalVisible(false);
    // If the saved class is on the selected day or a different day, switch to that day
    setSelectedDay(dayInput);
    loadData();
  };

  const handleDeleteClass = (cls: TimetableClass) => {
    Alert.alert(
      'Delete Class',
      `Delete "${cls.subject}" from ${cls.day}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteClass(cls.id);
            loadData();
          },
        },
      ]
    );
  };

  const currentToday = getCurrentDayOfWeek();

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
        {/* Title & Add Button */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.screenTitle, { color: theme.text }]}>
              Class Timetable
            </Text>
            <Text style={[styles.screenSubtitle, { color: theme.textMuted }]}>
              Manage your weekly schedule
            </Text>
          </View>

          <View style={styles.headerActions}>
            <SystemNavToggle compact />
            <DarkModeToggle />
            <Button
              title="Add Class"
              icon="add"
              size="sm"
              onPress={handleOpenAdd}
            />
          </View>
        </View>

        {/* Day Selector Tabs (Monday - Sunday) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorScroll}
        >
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day;
            const isToday = currentToday === day;
            const count = dayCounts[day];

            return (
              <TouchableOpacity
                key={day}
                activeOpacity={0.7}
                onPress={() => setSelectedDay(day)}
                style={[
                  styles.dayTab,
                  {
                    backgroundColor: isSelected
                      ? theme.primary
                      : theme.card,
                    borderColor: isSelected
                      ? theme.primary
                      : isToday
                      ? theme.primary
                      : theme.border,
                    borderWidth: isToday && !isSelected ? 1.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? theme.primary
                        : theme.text,
                      fontWeight: isSelected || isToday ? '700' : '500',
                    },
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>

                {count > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255,255,255,0.25)'
                          : theme.primaryLight,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        {
                          color: isSelected ? '#FFFFFF' : theme.primary,
                        },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Section Header */}
        <View style={styles.dayHeader}>
          <Text style={[styles.dayTitle, { color: theme.text }]}>
            {selectedDay}
            {currentToday === selectedDay ? ' (Today)' : ''}
          </Text>
          <Text style={[styles.dayClassCount, { color: theme.textMuted }]}>
            {classes.length === 1 ? '1 class' : `${classes.length} classes`}
          </Text>
        </View>

        {/* Classes List */}
        {classes.length > 0 ? (
          classes.map((cls) => (
            <ClassCard
              key={cls.id}
              classItem={cls}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteClass}
            />
          ))
        ) : (
          <EmptyState
            icon="calendar-outline"
            title={`No classes on ${selectedDay}`}
            description="You don't have any classes scheduled for this day."
            actionLabel="+ Add Class"
            onAction={handleOpenAdd}
          />
        )}
      </ScrollView>

      {/* Add / Edit Class Modal */}
      <ModalWrapper
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <Input
          label="Subject Name"
          placeholder="e.g. Database Systems"
          value={subjectInput}
          onChangeText={setSubjectInput}
          autoCapitalize="words"
        />

        <Input
          label="Room / Location"
          placeholder="e.g. Room 204 or Lab 2"
          value={roomInput}
          onChangeText={setRoomInput}
        />

        <Input
          label="Teacher / Lecturer (Optional)"
          placeholder="e.g. Dr. Smith"
          value={teacherInput}
          onChangeText={setTeacherInput}
          autoCapitalize="words"
        />

        {/* Day selection pills */}
        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>Day</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.modalDayRow}
        >
          {DAYS_OF_WEEK.map((d) => (
            <TouchableOpacity
              key={d}
              onPress={() => setDayInput(d)}
              style={[
                styles.modalDayPill,
                {
                  backgroundColor:
                    dayInput === d ? theme.primary : theme.background,
                  borderColor:
                    dayInput === d ? theme.primary : theme.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.modalDayText,
                  { color: dayInput === d ? '#FFFFFF' : theme.text },
                ]}
              >
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Times Row */}
        <View style={styles.timeInputsRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Input
              label="Start Time"
              placeholder="09:00"
              value={startTimeInput}
              onChangeText={setStartTimeInput}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Input
              label="End Time"
              placeholder="10:30"
              value={endTimeInput}
              onChangeText={setEndTimeInput}
            />
          </View>
        </View>

        {/* Color picker */}
        <Text style={[styles.modalLabel, { color: theme.textMuted }]}>
          Card Accent Color
        </Text>
        <View style={styles.colorRow}>
          {FolderColors.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setColorInput(c)}
              style={[
                styles.colorDot,
                {
                  backgroundColor: c,
                  borderColor: colorInput === c ? theme.text : 'transparent',
                  borderWidth: colorInput === c ? 2.5 : 0,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={editingClass ? 'Update Class' : 'Save Class'}
          onPress={handleSaveClass}
          style={{ marginTop: 18 }}
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
  daySelectorScroll: {
    paddingBottom: 14,
    gap: 8,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    gap: 6,
  },
  dayTabText: {
    fontSize: 13,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  dayClassCount: {
    fontSize: 13,
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalDayRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    paddingVertical: 4,
  },
  modalDayPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  modalDayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timeInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
