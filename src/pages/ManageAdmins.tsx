import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  LockReset as LockResetIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Shield as ShieldIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';

interface Admin {
  user_id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_active: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  can_list_users: boolean;
  can_view_personal_organizer: boolean;
  can_view_business_organizer: boolean;
  can_view_rental_organizer: boolean;
  can_view_flip_organizer: boolean;
  can_view_engagement_letter: boolean;
}

const ManageAdmins = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
  const [resetPasswordAdmin, setResetPasswordAdmin] = useState<Admin | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await apiService.listAdmins();
      // Handle paginated response (results array) or direct array response
      const adminsList = Array.isArray(response) 
        ? response 
        : (response?.results || response || []);
      setAdmins(adminsList);
    } catch (error: any) {
      console.error('Error loading admins:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admins. Please try again.',
        variant: 'destructive',
      });
      setAdmins([]); // Ensure admins is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setEditDialogOpen(true);
  };

  const handleSavePermissions = async (permissions: Partial<Admin>) => {
    if (!editingAdmin) return;

    try {
      setSubmitting(true);
      await apiService.updateAdminPermissions(editingAdmin.user_id, permissions);
      
      toast({
        title: 'Success',
        description: 'Admin permissions updated successfully!',
      });
      
      setEditDialogOpen(false);
      setEditingAdmin(null);
      loadAdmins();
    } catch (error: any) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update permissions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (admin: Admin) => {
    try {
      await apiService.deactivateAdmin(admin.user_id);
      
      toast({
        title: 'Success',
        description: `Admin ${admin.is_active ? 'deactivated' : 'activated'} successfully!`,
      });
      
      loadAdmins();
    } catch (error: any) {
      console.error('Error toggling admin status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update admin status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleResetPassword = async () => {
    if (!resetPasswordAdmin) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters long.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await apiService.resetAdminPassword(resetPasswordAdmin.user_id, newPassword, confirmPassword);
      
      toast({
        title: 'Success',
        description: 'Password reset successfully!',
      });
      
      setResetPasswordDialogOpen(false);
      setResetPasswordAdmin(null);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reset password. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (username: string) => {
    return username ? username.slice(0, 2).toUpperCase() : 'A';
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc', py: 4 }}>
      <Container maxWidth="xl">
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
              <ShieldIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6', mb: 0.5 }}>
                  Manage Admins
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  View and manage admin users, permissions, and access controls
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0', borderRadius: 2 }}>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress size={48} />
              </Box>
            ) : admins.length === 0 ? (
              <Box sx={{ p: 4 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    backgroundColor: '#eff6ff',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  No admins found. Create your first admin to get started.
                </Alert>
              </Box>
            ) : (
              <TableContainer 
                component={Paper} 
                elevation={0} 
                sx={{ 
                  borderRadius: 0,
                  border: 'none',
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Admin</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Permissions</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#1e293b', py: 2, fontSize: '0.875rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow 
                        key={admin.user_id}
                        sx={{
                          '&:hover': { backgroundColor: '#f8fafc' },
                          borderBottom: '1px solid #e2e8f0',
                        }}
                      >
                        <TableCell sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '1rem',
                                boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)',
                              }}
                            >
                              {getInitials(admin.username)}
                            </Box>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {admin.username}
                              </Typography>
                              {(admin.first_name || admin.last_name) && (
                                <Typography variant="caption" color="text.secondary">
                                  {[admin.first_name, admin.last_name].filter(Boolean).join(' ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {admin.email}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ py: 2.5 }}>
                          <Chip
                            label={admin.is_super_admin ? 'Super Admin' : 'Admin'}
                            color={admin.is_super_admin ? 'primary' : 'default'}
                            size="small"
                              sx={{
                                fontWeight: 600,
                                ...(admin.is_super_admin && {
                                  backgroundColor: '#3b82f6',
                                  color: '#ffffff',
                                }),
                              }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {admin.can_list_users && (
                              <Chip label="Users" size="small" variant="outlined" />
                            )}
                            {admin.can_view_personal_organizer && (
                              <Chip label="Personal" size="small" variant="outlined" />
                            )}
                            {admin.can_view_business_organizer && (
                              <Chip label="Business" size="small" variant="outlined" />
                            )}
                            {admin.can_view_rental_organizer && (
                              <Chip label="Rental" size="small" variant="outlined" />
                            )}
                            {admin.can_view_flip_organizer && (
                              <Chip label="Flip" size="small" variant="outlined" />
                            )}
                            {admin.can_view_engagement_letter && (
                              <Chip label="Engagement" size="small" variant="outlined" />
                            )}
                            {admin.is_super_admin && (
                              <Chip label="All" size="small" color="primary" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={admin.is_active ? 'Active' : 'Inactive'}
                            color={admin.is_active ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ py: 2.5 }}>
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Tooltip title="Edit Permissions" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(admin)}
                              sx={{ 
                                color: '#3b82f6',
                                '&:hover': { 
                                  backgroundColor: '#eff6ff',
                                  transform: 'scale(1.1)',
                                },
                                transition: 'all 0.2s ease',
                              }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Password" arrow>
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setResetPasswordAdmin(admin);
                                  setResetPasswordDialogOpen(true);
                                }}
                                sx={{ 
                                  color: '#f59e0b',
                                  '&:hover': { 
                                    backgroundColor: '#fef3c7',
                                    transform: 'scale(1.1)',
                                  },
                                  transition: 'all 0.2s ease',
                                }}
                              >
                                <LockResetIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={admin.is_active ? 'Deactivate Admin' : 'Activate Admin'} arrow>
                              <Switch
                                checked={admin.is_active}
                                onChange={() => handleToggleActive(admin)}
                                color="success"
                                sx={{
                                  '& .MuiSwitch-switchBase.Mui-checked': {
                                    color: '#22c55e',
                                  },
                                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                    backgroundColor: '#22c55e',
                                  },
                                }}
                              />
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Edit Permissions Dialog */}
        <Dialog 
          open={editDialogOpen} 
          onClose={() => setEditDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            fontSize: '1.5rem',
            pb: 2,
            borderBottom: '1px solid #e2e8f0',
          }}>
            Edit Admin Permissions
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {editingAdmin && (
              <EditPermissionsForm
                admin={editingAdmin}
                onSave={handleSavePermissions}
                onCancel={() => setEditDialogOpen(false)}
                submitting={submitting}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog 
          open={resetPasswordDialogOpen} 
          onClose={() => setResetPasswordDialogOpen(false)} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
            }
          }}
        >
          <DialogTitle sx={{ 
            fontWeight: 700, 
            fontSize: '1.5rem',
            pb: 2,
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}>
            <LockResetIcon sx={{ color: '#f59e0b' }} />
            Reset Password
          </DialogTitle>
          <DialogContent>
            {resetPasswordAdmin && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
                <Alert severity="info" sx={{ borderRadius: 2, backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  Resetting password for <strong>{resetPasswordAdmin.username}</strong> ({resetPasswordAdmin.email})
                </Alert>
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  variant="outlined"
                  helperText="Password must be at least 8 characters long"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <TextField
                  label="Confirm Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  variant="outlined"
                  error={confirmPassword !== '' && newPassword !== confirmPassword}
                  helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
            <Button 
              onClick={() => setResetPasswordDialogOpen(false)} 
              disabled={submitting}
              sx={{ 
                borderColor: '#3b82f6',
                color: '#3b82f6',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: '#eff6ff',
                },
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              variant="contained"
              disabled={submitting || !newPassword || !confirmPassword}
              sx={{
                backgroundColor: '#3b82f6',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1,
                borderRadius: 2,
                '&:hover': { 
                  backgroundColor: '#2563eb',
                },
                '&:disabled': {
                  backgroundColor: '#cbd5e1',
                },
              }}
            >
              {submitting ? 'Resetting...' : 'Reset Password'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

const EditPermissionsForm = ({
  admin,
  onSave,
  onCancel,
  submitting,
}: {
  admin: Admin;
  onSave: (permissions: Partial<Admin>) => void;
  onCancel: () => void;
  submitting: boolean;
}) => {
  const [permissions, setPermissions] = useState({
    is_super_admin: admin.is_super_admin,
    can_list_users: admin.can_list_users,
    can_view_personal_organizer: admin.can_view_personal_organizer,
    can_view_business_organizer: admin.can_view_business_organizer,
    can_view_rental_organizer: admin.can_view_rental_organizer,
    can_view_flip_organizer: admin.can_view_flip_organizer ?? false,
    can_view_engagement_letter: admin.can_view_engagement_letter,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(permissions);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, border: '1px solid #e2e8f0', borderRadius: 2, backgroundColor: '#ffffff' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
              Super Admin (Full Access)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Complete access to all features and admin management
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
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4, pt: 3, borderTop: '1px solid #e2e8f0' }}>
        <Button 
          onClick={onCancel} 
          disabled={submitting}
          variant="outlined"
          sx={{
            borderColor: '#3b82f6',
            color: '#3b82f6',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
            borderRadius: 2,
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
          disabled={submitting}
          sx={{
            backgroundColor: '#3b82f6',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1,
            borderRadius: 2,
            '&:hover': { 
              backgroundColor: '#2563eb',
            },
            '&:disabled': {
              backgroundColor: '#cbd5e1',
            },
          }}
        >
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </Box>
    </form>
  );
};

export default ManageAdmins;
