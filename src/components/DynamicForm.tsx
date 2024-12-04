import React, { useState, useEffect } from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Paper,
  Grid,
} from '@mui/material';
import { FormField, FormData, FormType } from '../types';
import { mockApiResponse } from '../api/mockApi';

const DynamicForm: React.FC = () => {
  const [formType, setFormType] = useState<FormType>('userInfo');
  const [fields, setFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState<FormData[]>([]);
  const [isExpiryFocused, setIsExpiryFocused] = useState(false);

  useEffect(() => {
    // Simulate API call
    const response = mockApiResponse(formType);
    setFields(response.fields);
    setFormData({});
    setErrors({});
    setProgress(0);
    setSubmitted(false);
  }, [formType]);

  const handleInputChange = (name: string, value: string) => {
    if (name === 'expiryDate') {
      // Only allow numbers and forward slash
      const cleaned = value.replace(/[^\d/]/g, '');
      // Add slash after MM if not present
      if (cleaned.length === 2 && !value.includes('/')) {
        value = cleaned + '/';
      } else {
        value = cleaned;
      }
      // Limit to MM/DD/YYYY format
      if (value.length > 10) {
        value = value.slice(0, 10);
      }
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
    updateProgress();
  };

  const validateField = (name: string, value: string) => {
    const field = fields.find((f) => f.name === name);
    if (!field) return;

    if (field.required && !value) {
      setErrors((prev) => ({ ...prev, [name]: 'This field is required' }));
    } else if (name === 'expiryDate' && value) {
      const [month, day, year] = value.split('/');
      const isValidDate = 
        month && day && year &&
        month.length === 2 && day.length === 2 && year.length === 4 &&
        parseInt(month) >= 1 && parseInt(month) <= 12 &&
        parseInt(day) >= 1 && parseInt(day) <= 31 &&
        parseInt(year) >= new Date().getFullYear();
      
      if (!isValidDate) {
        setErrors((prev) => ({ ...prev, [name]: 'Please enter a valid date (MM/DD/YYYY)' }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const updateProgress = () => {
    const totalRequired = fields.filter((field) => field.required).length;
    if (totalRequired === 0) {
      setProgress(100);
      return;
    }

    const filledRequired = fields.filter(
      (field) => field.required && formData[field.name]
    ).length;
    setProgress((filledRequired / totalRequired) * 100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = 'This field is required';
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmittedData((prev) => [...prev, formData]);
    setSubmitted(true);
  };

  const handleEdit = (index: number) => {
    const dataToEdit = submittedData[index];
    setFormData(dataToEdit);
    setSubmittedData((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDelete = (index: number) => {
    setSubmittedData((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dynamic Form Generator
      </Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Form Type</InputLabel>
        <Select
          value={formType}
          label="Form Type"
          onChange={(e) => setFormType(e.target.value as FormType)}
        >
          <MenuItem value="userInfo">User Information</MenuItem>
          <MenuItem value="address">Address Information</MenuItem>
          <MenuItem value="payment">Payment Information</MenuItem>
        </Select>
      </FormControl>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid item xs={12} key={field.name}>
                {field.type === 'dropdown' ? (
                  <FormControl fullWidth error={!!errors[field.name]}>
                    <InputLabel>{field.label}</InputLabel>
                    <Select
                      value={formData[field.name] || ''}
                      label={field.label}
                      onChange={(e) => handleInputChange(field.name, e.target.value)}
                    >
                      {field.options?.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField
                    fullWidth
                    label={field.label}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleInputChange(field.name, e.target.value)}
                    error={!!errors[field.name]}
                    helperText={errors[field.name] || (field.name === 'expiryDate' ? 'Format: MM/DD/YYYY' : '')}
                    required={field.required}
                    placeholder={field.name === 'expiryDate' ? 'MM/DD/YYYY' : undefined}
                    inputProps={{
                      maxLength: field.name === 'expiryDate' ? 10 : undefined,
                    }}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          <Box sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Progress: {Math.round(progress)}%
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mt: 1 }} />
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={Object.keys(errors).length > 0}
          >
            Submit
          </Button>
        </form>
      </Paper>

      {submitted && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Form submitted successfully!
        </Alert>
      )}

      {submittedData.length > 0 && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Submitted Data
          </Typography>
          {submittedData.map((data, index) => (
            <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.100' }}>
              {Object.entries(data).map(([key, value]) => (
                <Typography key={key}>
                  <strong>{key}:</strong> {value}
                </Typography>
              ))}
              <Box sx={{ mt: 1 }}>
                <Button
                  size="small"
                  onClick={() => handleEdit(index)}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDelete(index)}
                >
                  Delete
                </Button>
              </Box>
            </Box>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default DynamicForm;
