import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Autocomplete,
  CircularProgress,
  Alert,
  Switch,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
}

const CreateAdmin = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [permissions, setPermissions] = useState({
    is_super_admin: false,
    can_list_users: false,
    can_view_personal_organizer: false,
    can_view_business_organizer: false,
    can_view_rental_organizer: false,
    can_view_flip_organizer: false,
    can_view_engagement_letter: false,
  });

  useEffect(() => {
    // Only call API when search query has a value
    if (searchQuery.trim() === '') {
      setUsers([]);
      setLoading(false);
      return;
    }

    // Debounce search to avoid too many API calls
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timer = setTimeout(() => {
      loadUsers(searchQuery);
    }, 500);
    
    setSearchDebounce(timer);
    
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchQuery]);

  const loadUsers = async (search = '') => {
    try {
      setLoading(true);
      const response = await apiService.getAdminUsers(search, 1);
      const userList = response.results || response.users || [];
      // Filter out users who are already admins
      const nonAdminUsers = userList.filter((user: User) => {
        const profile = (user as any).profile;
        return !profile || !profile.is_admin;
      });
      setUsers(nonAdminUsers);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      toast({
        title: 'Error',
        description: 'Please select a user to make an admin.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiService.createAdmin(selectedUser.id, permissions);
      
      toast({
        title: 'Success',
        description: 'Admin created successfully!',
      });
      
      if (onBack) {
        onBack();
      } else {
        navigate('/atg-admin');
      }
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create admin. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
      <Container maxWidth="lg">
        {/* Header Card */}
        <Card 
          sx={{ 
            mb: 4, 
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={onBack || (() => navigate('/atg-admin'))}
                sx={{ 
                  color: '#64748b',
                  '&:hover': { backgroundColor: '#f1f5f9' },
                }}
              >
                Back
              </Button>
              <PersonAddIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 0.5 }}>
                  Create Admin
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Select a user and configure their admin permissions
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>

            <form onSubmit={handleSubmit}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3b82f6' }}>
                  Select User
                </Typography>
                {searchQuery.trim() === '' && (
                  <Alert severity="info" sx={{ mb: 2, borderRadius: 2, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                    Start typing to search for users...
                  </Alert>
                )}
                <Autocomplete
                  options={users}
                  getOptionLabel={(option) => `${option.username} (${option.email})`}
                  value={selectedUser}
                  onChange={(_, newValue) => setSelectedUser(newValue)}
                  onInputChange={(_, value) => setSearchQuery(value)}
                  loading={loading}
                  filterOptions={(x) => x} // Disable client-side filtering since we're using backend search
                  noOptionsText={searchQuery.trim() === '' ? 'Start typing to search for users...' : loading ? 'Searching...' : 'No users found'}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search users by name, email, or username..."
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {loading ? <CircularProgress size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#ffffff',
                        },
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {option.username}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {option.email}
                        </Typography>
                        {(option.first_name || option.last_name) && (
                          <Typography variant="caption" color="text.secondary">
                            {[option.first_name, option.last_name].filter(Boolean).join(' ')}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#3b82f6', fontSize: '1.25rem' }}>
                  Permissions Configuration
                </Typography>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Select the permissions this admin should have. Super Admin has access to all features and can manage other admins.
                </Alert>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Super Admin
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Full access to all features and admin management
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.is_super_admin}
                      onChange={() => setPermissions({ ...permissions, is_super_admin: !permissions.is_super_admin })}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        List Users
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View and manage user list
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_list_users}
                      onChange={() => setPermissions({ ...permissions, can_list_users: !permissions.can_list_users })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Personal Organizer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View personal tax organizer data
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_view_personal_organizer}
                      onChange={() => setPermissions({ ...permissions, can_view_personal_organizer: !permissions.can_view_personal_organizer })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Business Organizer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View business tax organizer data
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_view_business_organizer}
                      onChange={() => setPermissions({ ...permissions, can_view_business_organizer: !permissions.can_view_business_organizer })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Rental Organizer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View rental property organizer data
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_view_rental_organizer}
                      onChange={() => setPermissions({ ...permissions, can_view_rental_organizer: !permissions.can_view_rental_organizer })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Flip Organizer
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View flip organizer data
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_view_flip_organizer}
                      onChange={() => setPermissions({ ...permissions, can_view_flip_organizer: !permissions.can_view_flip_organizer })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Engagement Letter
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        View engagement letter data
                      </Typography>
                    </Box>
                    <Switch
                      checked={permissions.can_view_engagement_letter}
                      onChange={() => setPermissions({ ...permissions, can_view_engagement_letter: !permissions.can_view_engagement_letter })}
                      disabled={permissions.is_super_admin}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#3b82f6',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#3b82f6',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2, borderTop: '1px solid #e2e8f0' }}>
                <Button
                  variant="outlined"
                  onClick={onBack || (() => navigate('/atg-admin'))}
                  disabled={submitting}
                  size="medium"
                  sx={{
                    borderColor: '#3b82f6',
                    color: '#3b82f6',
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      borderColor: '#2563eb',
                      backgroundColor: '#eff6ff',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  disabled={submitting || !selectedUser}
                  size="medium"
                  sx={{
                    backgroundColor: '#3b82f6',
                    px: 4,
                    py: 1,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { 
                      backgroundColor: '#2563eb',
                    },
                    '&:disabled': {
                      backgroundColor: '#cbd5e1',
                    },
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Admin'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CreateAdmin;
