import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Switch,
  CircularProgress,
  Alert,
  Pagination,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  Logout as LogoutIcon,
  Shield as ShieldIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  CalendarToday as CalendarIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { clearAllAuthAndPurge } from '../utils/authLogout';
import { persistor } from '../store/store';
import { apiService } from '../services/api';
import businessLogo from '../assets/New-log.png';
import { useToast } from '@/hooks/use-toast';
import AdminUserDetail from './AdminUserDetail';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: adminUser, permissions, isAuthenticated } = useSelector((state: any) => state.adminAuth);
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAdminOptions, setShowAdminOptions] = useState(false);
  
  const isSuperAdmin = permissions?.is_super_admin || false;

  useEffect(() => {
    // Check if admin is authenticated
    const adminToken = localStorage.getItem('adminAccessToken');
    
    if (!adminToken && !isAuthenticated) {
      navigate('/atg-admin/login');
      return;
    }
    
    // Load permissions if not already loaded
    if (!permissions && adminToken) {
      loadPermissions();
    }
    
    loadUsers('', 1);
  }, [navigate, isAuthenticated]);

  const loadPermissions = async () => {
    try {
      const perms = await apiService.getAdminPermissions();
      // Update Redux store with permissions
      // This would require updating the adminAuthSlice to have a setPermissions action
    } catch (error) {
      console.error('Error loading permissions:', error);
    }
  };

  useEffect(() => {
    // Reset to page 1 when search changes
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    // Debounce search
    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }
    
    const timer = setTimeout(() => {
      loadUsers(searchQuery, page);
    }, 500);
    
    setSearchDebounce(timer);
    
    return () => {
      if (searchDebounce) {
        clearTimeout(searchDebounce);
      }
    };
  }, [searchQuery, page]);

  const loadUsers = async (search = '', currentPage = 1) => {
    try {
      setLoading(true);
      const response = await apiService.getAdminUsers(search, currentPage);
      
      // Handle paginated response
      if (response.results) {
        // Paginated response format
        setUsers(response.results || []);
        setTotalCount(response.count || 0);
        setTotalPages(Math.ceil((response.count || 0) / 20));
        
        // Update stats from response
        if (response.stats) {
          setActiveCount(response.stats.active || 0);
          setInactiveCount(response.stats.inactive || 0);
        } else {
          // Fallback: calculate from current page if stats not available
          setActiveCount(response.results.filter((u: User) => u.is_active).length);
          setInactiveCount(response.results.filter((u: User) => !u.is_active).length);
        }
      } else {
        // Fallback for non-paginated response
        setUsers(response.users || []);
        setTotalCount(response.count || response.users?.length || 0);
        setTotalPages(1);
        
        // Update stats from response
        if (response.stats) {
          setActiveCount(response.stats.active || 0);
          setInactiveCount(response.stats.inactive || 0);
        } else {
          // Fallback: calculate from all users if stats not available
          const allUsers = response.users || [];
          setActiveCount(allUsers.filter((u: User) => u.is_active).length);
          setInactiveCount(allUsers.filter((u: User) => !u.is_active).length);
        }
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users. Please try again.',
        variant: 'destructive',
      });
      if (error.status === 401) {
        clearAllAuthAndPurge(dispatch, persistor);
        navigate('/atg-admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  const handleToggleActive = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await apiService.toggleUserActive(userId);
      const newStatus = !currentStatus;
      
      // Update local state
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, is_active: newStatus }
          : user
      ));
      
      // Update stats
      if (newStatus) {
        setActiveCount(prev => prev + 1);
        setInactiveCount(prev => Math.max(0, prev - 1));
      } else {
        setActiveCount(prev => Math.max(0, prev - 1));
        setInactiveCount(prev => prev + 1);
      }
      
      toast({
        title: 'Success',
        description: response.message || `User ${newStatus ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update user status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    clearAllAuthAndPurge(dispatch, persistor);
    navigate('/atg-admin/login');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = (username: string) => {
    return username ? username.slice(0, 2).toUpperCase() : 'U';
  };

  // Show user detail view if a user is selected
  if (selectedUser) {
    return <AdminUserDetail user={selectedUser} onBack={handleBackToUsers} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <Box sx={{ 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            py: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <img 
                src={businessLogo} 
                alt="Business Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                  Admin Dashboard
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  User Management Portal
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'right', mr: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {adminUser?.username || 'Admin'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {adminUser?.email || ''}
                </Typography>
              </Box>
              <IconButton
                onClick={handleLogout}
                sx={{ 
                  color: '#64748b',
                  '&:hover': { backgroundColor: '#f1f5f9' }
                }}
                title="Logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Admin Options Section - Only visible to super admins */}
        {isSuperAdmin && (
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <ShieldIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b82f6' }}>
                      Admin Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', ml: 5 }}>
                    Create and manage admin users with granular permission controls
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/atg-admin/create-admin')}
                    size="medium"
                    sx={{
                      backgroundColor: '#3b82f6',
                      color: '#ffffff',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { 
                        backgroundColor: '#2563eb',
                      },
                    }}
                  >
                    Create Admin
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/atg-admin/manage-admins')}
                    size="medium"
                    sx={{
                      borderColor: '#3b82f6',
                      borderWidth: 1.5,
                      color: '#3b82f6',
                      fontWeight: 600,
                      px: 3,
                      py: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { 
                        borderColor: '#2563eb',
                        backgroundColor: '#eff6ff',
                      },
                    }}
                  >
                    Manage Admins
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          <Card sx={{ flex: 1, minWidth: 200, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                {totalCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#22c55e' }}>
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
          <Card sx={{ flex: 1, minWidth: 200, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Inactive Users
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ef4444' }}>
                {inactiveCount}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Search and User List */}
        <Card sx={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <CardContent>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: '#1e293b' }}>
                User Management
              </Typography>
              <TextField
                fullWidth
                placeholder="Search users by username, email, or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#64748b' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#ffffff',
                  },
                }}
              />
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : users.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                {searchQuery ? 'No users found matching your search.' : 'No users found.'}
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Joined</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Active</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow 
                        key={user.id}
                        onClick={() => setSelectedUser(user)}
                        sx={{ 
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': { 
                            backgroundColor: '#f1f5f9',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                            transform: 'translateY(-1px)',
                          },
                          '&:last-child td': { borderBottom: 0 },
                          '& td': {
                            borderColor: '#e2e8f0',
                          }
                        }}
                      >
                        <TableCell>
                          <Box 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1.5,
                            }}
                          >
                            <Box
                              sx={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                flexShrink: 0,
                              }}
                            >
                              {getInitials(user.username)}
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                {user.username}
                              </Typography>
                              {(user.first_name || user.last_name) && (
                                <Typography variant="caption" color="text.secondary">
                                  {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {user.email || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(user.date_joined)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.is_active ? 'Active' : 'Inactive'}
                            color={user.is_active ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                            <Switch
                              checked={user.is_active}
                              onChange={(e) => {
                                e.stopPropagation(); // Prevent row click
                                handleToggleActive(user.id, user.is_active);
                              }}
                              color="success"
                              disabled={user.id === adminUser?.id}
                            />
                            <ChevronRightIcon 
                              sx={{ 
                                color: '#94a3b8',
                                fontSize: '1.25rem',
                                ml: 1,
                                transition: 'transform 0.2s ease-in-out',
                                'tr:hover &': {
                                  transform: 'translateX(4px)',
                                  color: '#3b82f6',
                                }
                              }} 
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            
            {/* Pagination */}
            {!loading && users.length > 0 && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminDashboard;

