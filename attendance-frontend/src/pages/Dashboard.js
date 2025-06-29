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
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { subjectAPI, attendanceAPI } from '../services/api';
import { toast } from 'react-toastify';

const Dashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [startDate, setStartDate] = useState(dayjs().subtract(7, 'day'));
  const [endDate, setEndDate] = useState(dayjs());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchAttendanceReport();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      // Ensure we always set an array
      setSubjects(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      setSubjects([]); // Set empty array on error
      toast.error('Failed to fetch subjects');
    }
  };

  const fetchAttendanceReport = async () => {
    setLoading(true);
    setError('');
    
    try {
      const params = {
        start_date: startDate.format('YYYY-MM-DD'),
        end_date: endDate.format('YYYY-MM-DD'),
      };
      
      if (selectedSubject) {
        params.subject_id = selectedSubject;
      }

      const response = await attendanceAPI.getReport(params);
      
      // Debug: Log the response to see what we're getting
      console.log('API Response:', response);
      
      // Ensure we always set an array
      const data = response.data;
      if (Array.isArray(data)) {
        setAttendanceData(data);
      } else if (data && Array.isArray(data.data)) {
        // Sometimes APIs wrap data in a nested structure
        setAttendanceData(data.data);
      } else {
        console.warn('API returned non-array data:', data);
        setAttendanceData([]);
        setError('Invalid data format received from server');
      }
    } catch (error) {
      console.error('Error fetching attendance report:', error);
      setError('Failed to fetch attendance report');
      setAttendanceData([]); // Ensure we set empty array on error
      toast.error('Failed to fetch attendance report');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchAttendanceReport();
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 60) return 'warning';
    return 'error';
  };

  // Ensure attendanceData is always an array before rendering
  const safeAttendanceData = Array.isArray(attendanceData) ? attendanceData : [];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Attendance Dashboard
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Search Filters
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select
                value={selectedSubject}
                label="Subject"
                onChange={(e) => setSelectedSubject(e.target.value)}
              >
                <MenuItem value="">All Subjects</MenuItem>
                {subjects.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id}>
                    {subject.subject_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={(newValue) => setStartDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={(newValue) => setEndDate(newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Search'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attendance Report
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Registration No</TableCell>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Total Classes</TableCell>
                  <TableCell>Attended Classes</TableCell>
                  <TableCell>Attendance %</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeAttendanceData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No attendance data found
                    </TableCell>
                  </TableRow>
                ) : (
                  safeAttendanceData.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{record.registration_number}</TableCell>
                      <TableCell>{record.name}</TableCell>
                      <TableCell>{record.subject_name}</TableCell>
                      <TableCell>{record.total_classes}</TableCell>
                      <TableCell>{record.attended_classes}</TableCell>
                      <TableCell>{record.attendance_percentage}%</TableCell>
                      <TableCell>
                        <Chip
                          label={
                            record.attendance_percentage >= 80
                              ? 'Good'
                              : record.attendance_percentage >= 60
                              ? 'Average'
                              : 'Poor'
                          }
                          color={getAttendanceColor(record.attendance_percentage)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
};

export default Dashboard;