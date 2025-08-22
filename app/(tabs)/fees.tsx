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

interface FeeRecord {
  id: number;
  student_id: number;
  student_name: string;
  class_name: string;
  amount: number;
  fee_type: string;
  status: string;
  due_date: string;
  paid_date: string;
  created_at: string;
}

interface Student {
  id: number;
  name: string;
  class_name: string;
}

export default function FeesScreen() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Form fields
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [feeType, setFeeType] = useState('');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [paidDate, setPaidDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const fetchData = async () => {
    await Promise.all([fetchFees(), fetchStudents()]);
    setLoading(false);
  };

  const fetchFees = async () => {
    try {
      const url = filterStatus !== 'all' 
        ? `${API_BASE_URL}/fees/list.php?status=${filterStatus}`
        : `${API_BASE_URL}/fees/list.php`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setFees(data.fees);
      }
    } catch (error) {
      console.error('Error fetching fees:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/students/list.php`);
      const data = await response.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSaveFee = async () => {
    if (!selectedStudentId || !amount || !feeType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const url = editingFee
        ? `${API_BASE_URL}/fees/update.php`
        : `${API_BASE_URL}/fees/create.php`;
      
      const body = {
        ...(editingFee && { id: editingFee.id }),
        student_id: selectedStudentId,
        amount: parseFloat(amount),
        fee_type: feeType,
        status,
        due_date: dueDate,
        paid_date: status === 'paid' ? paidDate : null,
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', editingFee ? 'Fee updated successfully' : 'Fee record created successfully');
        setModalVisible(false);
        resetForm();
        fetchFees();
      } else {
        Alert.alert('Error', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Network error occurred');
    }
  };

  const handleDeleteFee = async (feeId: number) => {
    Alert.alert(
      'Delete Fee Record',
      'Are you sure you want to delete this fee record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/fees/delete.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: feeId }),
              });
              const data = await response.json();
              if (data.success) {
                fetchFees();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete fee record');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setSelectedStudentId(0);
    setAmount('');
    setFeeType('');
    setStatus('pending');
    setDueDate('');
    setPaidDate('');
    setEditingFee(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (fee: FeeRecord) => {
    setEditingFee(fee);
    setSelectedStudentId(fee.student_id);
    setAmount(fee.amount.toString());
    setFeeType(fee.fee_type);
    setStatus(fee.status);
    setDueDate(fee.due_date);
    setPaidDate(fee.paid_date || '');
    setModalVisible(true);
  };

  useEffect(() => {
    if (!loading) {
      fetchFees();
    }
  }, [filterStatus]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'overdue': return '#ef4444';
      case 'pending': return '#f59e0b';
      default: return '#6b7280';
    }
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
        <Text style={styles.title}>Fee Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Ionicons name="add" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by Status:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={filterStatus}
            onValueChange={setFilterStatus}
            style={styles.picker}
          >
            <Picker.Item label="All Status" value="all" />
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Paid" value="paid" />
            <Picker.Item label="Overdue" value="overdue" />
          </Picker>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {fees.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No fee records found</Text>
            <Text style={styles.emptySubtext}>Tap the + button to add a fee record</Text>
          </View>
        ) : (
          fees.map((fee) => (
            <View key={fee.id} style={styles.feeCard}>
              <View style={styles.feeInfo}>
                <View style={styles.feeHeader}>
                  <Text style={styles.studentName}>{fee.student_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fee.status) }]}>
                    <Text style={styles.statusText}>{fee.status.toUpperCase()}</Text>
                  </View>
                </View>
                <Text style={styles.feeDetail}>Class: {fee.class_name}</Text>
                <Text style={styles.feeDetail}>Type: {fee.fee_type}</Text>
                <Text style={styles.feeAmount}>Amount: ${fee.amount}</Text>
                {fee.due_date && (
                  <Text style={styles.feeDetail}>Due: {formatDate(fee.due_date)}</Text>
                )}
                {fee.paid_date && (
                  <Text style={styles.feeDetail}>Paid: {formatDate(fee.paid_date)}</Text>
                )}
              </View>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(fee)}
                >
                  <Ionicons name="pencil" size={18} color="#3b82f6" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteFee(fee.id)}
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
                {editingFee ? 'Edit Fee Record' : 'Add Fee Record'}
              </Text>

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedStudentId}
                  onValueChange={setSelectedStudentId}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Student *" value={0} />
                  {students.map((student) => (
                    <Picker.Item
                      key={student.id}
                      label={`${student.name} (${student.class_name})`}
                      value={student.id}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Fee Type *"
                value={feeType}
                onChangeText={setFeeType}
              />

              <TextInput
                style={styles.input}
                placeholder="Amount *"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />

              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={status}
                  onValueChange={setStatus}
                  style={styles.picker}
                >
                  <Picker.Item label="Pending" value="pending" />
                  <Picker.Item label="Paid" value="paid" />
                  <Picker.Item label="Overdue" value="overdue" />
                </Picker>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                value={dueDate}
                onChangeText={setDueDate}
              />

              {status === 'paid' && (
                <TextInput
                  style={styles.input}
                  placeholder="Paid Date (YYYY-MM-DD)"
                  value={paidDate}
                  onChangeText={setPaidDate}
                />
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveFee}>
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
  feeCard: {
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
  feeInfo: {
    flex: 1,
  },
  feeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  feeDetail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  feeAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginBottom: 4,
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