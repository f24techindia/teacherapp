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

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string;
  class_id: number;
  class_name: string;
  roll_number: string;
  address: string;
  created_at: string;
}

interface Class {
  id: number;
  name: string;
}

export default function StudentsScreen() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [filterClassId, setFilterClassId] = useState<number>(0);

  // Form fields
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentRollNumber, setStudentRollNumber] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [studentClassId, setStudentClassId] = useState<number>(0);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    await Promise.all([fetchStudents(), fetchClasses()]);
    setLoading(false);
  };

  const fetchStudents = async () => {
    try {
      const url = filterClassId 
        ? `${API_BASE_URL}/students/list.php?class_id=${filterClassId}`
        : `${API_BASE_URL}/students/list.php`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
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

  const handleSaveStudent = async () => {
    if (!studentName.trim() || !studentClassId) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const url = editingStudent
        ? `${API_BASE_URL}/students/update.php`
        : `${API_BASE_URL}/students/create.php`;
      
      const body = {
        ...(editingStudent && { id: editingStudent.id }),
        name: studentName,
        email: studentEmail,
        phone: studentPhone,
        roll_number: studentRollNumber,
        address: studentAddress,
        class_id: studentClassId,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', editingStudent ? 'Student updated successfully' : 'Student added successfully');
        setModalVisible(false);
        resetForm();
        fetchStudents();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const handleDeleteStudent = async (studentId: number) => {
    Alert.alert(
      'Delete Student',
      'Are you sure you want to delete this student?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/students/delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: studentId }),
              });
              const data = await response.json();
              if (data.success) {
                fetchStudents();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete student');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentPhone('');
    setStudentRollNumber('');
    setStudentAddress('');
    setStudentClassId(0);
    setEditingStudent(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentPhone(student.phone);
    setStudentRollNumber(student.roll_number);
    setStudentAddress(student.address);
    setStudentClassId(student.class_id);
    setModalVisible(true);
  };

  const handleFilterChange = (classId: number) => {
    setFilterClassId(classId);
    setSelectedClassId(classId);
  };

  useEffect(() => {
    if (!loading) {
      fetchStudents();
    }
  }, [filterClassId]);

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
        <Text style={styles.title}>Students</Text>
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
        {students.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No students found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add a student</Text>
          </View>
        ) : (
          students.map((student) => (
            <View key={student.id} style={styles.studentCard}>
              <View style={styles.studentInfo}>
                <Text style={styles.studentName}>{student.name}</Text>
                <Text style={styles.studentDetail}>Class: {student.class_name}</Text>
                <Text style={styles.studentDetail}>Roll: {student.roll_number}</Text>
                {student.email && (
                  <Text style={styles.studentDetail}>Email: {student.email}</Text>
                )}
                {student.phone && (
                  <Text style={styles.studentDetail}>Phone: {student.phone}</Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(student)}
                >
                  <Ionicons name="pencil" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteStudent(student.id)}
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
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Student Name *"
                value={studentName}
                onChangeText={setStudentName}
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={studentClassId}
                  onValueChange={setStudentClassId}
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
                placeholder="Roll Number"
                value={studentRollNumber}
                onChangeText={setStudentRollNumber}
              />

              <TextInput
                style={styles.input}
                placeholder="Email"
                value={studentEmail}
                onChangeText={setStudentEmail}
                keyboardType="email-address"
              />

              <TextInput
                style={styles.input}
                placeholder="Phone"
                value={studentPhone}
                onChangeText={setStudentPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Address"
                value={studentAddress}
                onChangeText={setStudentAddress}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveStudent}>
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
  studentCard: {
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
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  studentDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
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
    height: 80,
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