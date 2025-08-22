import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';

const API_BASE_URL = 'https://bms.f24tech.com/api';

interface Assignment {
  id: number;
  title: string;
  description: string;
  class_id: number;
  class_name: string;
  due_date: string;
  created_at: string;
}

interface Class {
  id: number;
  name: string;
}

export default function AssignmentsScreen() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [filterClassId, setFilterClassId] = useState<number>(0);

  // Form fields
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentClassId, setAssignmentClassId] = useState<number>(0);
  const [assignmentDueDate, setAssignmentDueDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    await Promise.all([fetchAssignments(), fetchClasses()]);
    setLoading(false);
  };

  const fetchAssignments = async () => {
    try {
      const url = filterClassId 
        ? `${API_BASE_URL}/assignments/list.php?class_id=${filterClassId}`
        : `${API_BASE_URL}/assignments/list.php`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/classes/list.php`);
      const data = await response.json();
      if (data.success) {
        setClasses(data.classes);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  };

  const handleSaveAssignment = async () => {
    if (!assignmentTitle.trim() || !assignmentClassId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const url = editingAssignment
        ? `${API_BASE_URL}/assignments/update.php`
        : `${API_BASE_URL}/assignments/create.php`;
      
      const body = {
        ...(editingAssignment && { id: editingAssignment.id }),
        title: assignmentTitle,
        description: assignmentDescription,
        class_id: assignmentClassId,
        due_date: assignmentDueDate,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', editingAssignment ? 'Assignment updated successfully' : 'Assignment created successfully');
        setModalVisible(false);
        resetForm();
        fetchAssignments();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const handleDeleteAssignment = async (assignmentId: number) => {
    Alert.alert(
      'Delete Assignment',
      'Are you sure you want to delete this assignment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/assignments/delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: assignmentId }),
              });
              const data = await response.json();
              if (data.success) {
                fetchAssignments();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete assignment');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentClassId(0);
    setAssignmentDueDate('');
    setEditingAssignment(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description);
    setAssignmentClassId(assignment.class_id);
    setAssignmentDueDate(assignment.due_date);
    setModalVisible(true);
  };

  const handleFilterChange = (classId: number) => {
    setFilterClassId(classId);
    setSelectedClassId(classId);
  };

  useEffect(() => {
    if (!loading) {
      fetchAssignments();
    }
  }, [filterClassId]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Assignments</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Class:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={selectedClassId}
            onValueChange={handleFilterChange}
            style={styles.picker}
          >
            <Picker.Item label="All Classes" value={0} />
            {classes.map((classItem) => (
              <Picker.Item
                key={classItem.id}
                label={classItem.name}
                value={classItem.id}
              />
            ))}
          </Picker>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {assignments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No assignments found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to create an assignment</Text>
          </View>
        ) : (
          assignments.map((assignment) => (
            <View key={assignment.id} style={styles.assignmentCard}>
              <View style={styles.assignmentInfo}>
                <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                <Text style={styles.assignmentDetail}>Class: {assignment.class_name}</Text>
                {assignment.due_date && (
                  <Text style={styles.assignmentDetail}>Due: {formatDate(assignment.due_date)}</Text>
                )}
                {assignment.description && (
                  <Text style={styles.assignmentDescription}>{assignment.description}</Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(assignment)}
                >
                  <Ionicons name="pencil" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteAssignment(assignment.id)}
                >
                  <Ionicons name="trash" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>
                {editingAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Assignment Title *"
                value={assignmentTitle}
                onChangeText={setAssignmentTitle}
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={assignmentClassId}
                  onValueChange={setAssignmentClassId}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Class *" value={0} />
                  {classes.map((classItem) => (
                    <Picker.Item
                      key={classItem.id}
                      label={classItem.name}
                      value={classItem.id}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                value={assignmentDueDate}
                onChangeText={setAssignmentDueDate}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Assignment Description"
                value={assignmentDescription}
                onChangeText={setAssignmentDescription}
                multiline
                numberOfLines={4}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveAssignment}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  addButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  picker: {
    height: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  assignmentCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  assignmentDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  assignmentDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#2563eb',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
});