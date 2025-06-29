import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  TextField,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { 
  Save as SaveIcon, 
  School as SchoolIcon,
  Today as TodayIcon 
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { subjectAPI, studentAPI, attendanceAPI } from '../services/api';
import { toast } from 'react-toastify';

const AttendanceMark = () => {
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Calculate derived values
  const selectedSubjectName = subjects.find(s => s.id === selectedSubject)?.subject_name || '';
  const totalCount = students.length;
  const presentCount = Object.values(attendance).filter(isPresent => isPresent).length;

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchStudentsBySubject();
    }
  }, [selectedSubject]);

  // NEW: Load existing attendance when both subject and date are selected
  useEffect(() => {
    if (selectedSubject && selectedDate && students.length > 0) {
      loadExistingAttendance();
    }
  }, [selectedSubject, selectedDate, students.length]);

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchStudentsBySubject = async () => {
    if (!selectedSubject) return;
    
    setLoading(true);
    try {
      const response = await studentAPI.getBySubject(selectedSubject);
      setStudents(response.data);
      
      // Initialize attendance state - this will be updated by loadExistingAttendance
      const initialAttendance = {};
      response.data.forEach(student => {
        initialAttendance[student.id] = false;
      });
      setAttendance(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students for this subject');
    } finally {
      setLoading(false);
    }
  };

  // NEW: Function to load existing attendance records
  const loadExistingAttendance = async () => {
    try {
      const response = await attendanceAPI.getAttendanceForDate(
        selectedSubject, 
        selectedDate.format('YYYY-MM-DD')
      );
      
      // Create a map of existing attendance
      const existingAttendance = {};
      students.forEach(student => {
        existingAttendance[student.id] = false; // Default to absent
      });
      
      // Update with existing records
      response.data.forEach(record => {
        existingAttendance[record.student_id] = record.status === 'present';
      });
      
      setAttendance(existingAttendance);
    } catch (error) {
      console.error('Error loading existing attendance:', error);
      // Don't show error toast for this as it might be normal (no existing records)
    }
  };

  const handleSubjectChange = (event) => {
    setSelectedSubject(event.target.value);
    setAttendance({});
    setStudents([]);
  };

  // NEW: Handle date change and reload attendance
  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    // attendance will be reloaded by useEffect
  };

  const handleAttendanceChange = (studentId, isPresent) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: isPresent
    }));
  };

  const handleSelectAll = (isPresent) => {
    const newAttendance = {};
    students.forEach(student => {
      newAttendance[student.id] = isPresent;
    });
    setAttendance(newAttendance);
  };

  const handleSubmit = async () => {
    if (!selectedSubject) {
      setError('Please select a subject');
      return;
    }

    if (students.length === 0) {
      setError('No students found for this subject');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const attendanceData = {
        subject_id: selectedSubject,
        date: selectedDate.format('YYYY-MM-DD'),
        attendances: Object.entries(attendance).map(([studentId, isPresent]) => ({
          student_id: parseInt(studentId),
          status: isPresent ? 'present' : 'absent',
          remarks: ''
        }))
      };

      await attendanceAPI.markAttendance(attendanceData);
      toast.success('Attendance marked successfully');
      
      // Don't reset form - keep the current selection and data
      // This allows teachers to make corrections if needed
    } catch (error) {
      console.error('Error marking attendance:', error);
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mark Attendance
      </Typography>

      {/* Filters Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SchoolIcon />
          Class Details
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth required>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={handleSubjectChange}
              >
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <DatePicker
              label="Date"
              value={selectedDate}
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box display="flex" alignItems="center" gap={1}>
              <TodayIcon color="primary" />
              <Typography variant="body2" color="textSecondary">
                {selectedDate.format('dddd, MMMM D, YYYY')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Card */}
      {selectedSubject && students.length > 0 && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Subject
                </Typography>
                <Typography variant="h6">
                  {selectedSubjectName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Students
                </Typography>
                <Typography variant="h6">
                  {totalCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Present
                </Typography>
                <Typography variant="h6" color="success.main">
                  {presentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Absent
                </Typography>
                <Typography variant="h6" color="error.main">
                  {totalCount - presentCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Attendance Table */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Student Attendance
          </Typography>
          {students.length > 0 && (
            <Box gap={1} display="flex">
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleSelectAll(true)}
              >
                Mark All Present
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleSelectAll(false)}
              >
                Mark All Absent
              </Button>
            </Box>
          )}
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!selectedSubject ? (
          <Alert severity="info">
            Please select a subject to view students
          </Alert>
        ) : loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : students.length === 0 ? (
          <Alert severity="warning">
            No students enrolled in this subject
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Registration No</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell align="center">Present</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.registration_number}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={attendance[student.id] || false}
                          onChange={(e) => handleAttendanceChange(student.id, e.target.checked)}
                          color="primary"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box mt={3} display="flex" justifyContent="center">
              <Button
                variant="contained"
                size="large"
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                onClick={handleSubmit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceMark;