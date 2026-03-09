import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Alert, Button } from '@mui/material';
import { FormDetailView } from '../components/FormDetailView';
import { apiService } from '../services/api';

/**
 * Public page: /submission/:id
 * Shows submission details without requiring login. Same view as admin/user form detail.
 * ID can be in any format (e.g. full UUID or short).
 */
const PublicSubmissionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Missing submission ID');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiService.getPublicSubmission(id);
        if (!cancelled) {
          setData(response);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || 'Failed to load submission');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading submission...</Typography>
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Submission not found'}
        </Alert>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Go to home
        </Button>
      </Box>
    );
  }

  const form = {
    id: data.id,
    form_type: data.form_type || 'personal',
    form_name: data.form_name || 'Tax Form',
    status: data.status || 'submitted',
    submitted_at: data.submitted_at,
  };

  return (
    <FormDetailView
      form={form}
      onBack={handleBack}
      onEdit={undefined}
      userToken={null}
      useAdminToken={false}
      initialFormData={data}
      hideAppBar={true}
    />
  );
};

export default PublicSubmissionPage;
