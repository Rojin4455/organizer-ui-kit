import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Visibility as ViewIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Home as HomeIcon,
  SwapHoriz as FlipIcon,
  Description as DescriptionIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { useToast } from '@/hooks/use-toast';
import { FormDetailView } from '../components/FormDetailView';
import { clearAllAuthAndPurge } from '../utils/authLogout';
import { persistor } from '../store/store';
import businessLogo from '../assets/New-log.png';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  is_active: boolean;
}

interface FormSubmission {
  id: string;
  form_type: string; // 'personal', 'business', or 'rental'
  form_name?: string;
  status: string; // 'drafted' or 'submitted'
  submitted_at: string;
  submission_data?: any;
}

interface EngagementLetter {
  id: number;
  taxpayer_name: string;
  signature: string;
  date_signed: string;
  created_at: string;
  updated_at: string;
}

interface AdminUserDetailProps {
  user: User;
  onBack: () => void;
}

const AdminUserDetail: React.FC<AdminUserDetailProps> = ({ user, onBack }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: adminUser, permissions } = useSelector((state: any) => state.adminAuth);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<{
    personal: FormSubmission[];
    business: FormSubmission[];
    rental: FormSubmission[];
    flip: FormSubmission[];
  }>({
    personal: [],
    business: [],
    rental: [],
    flip: [],
  });
  const [engagementLetter, setEngagementLetter] = useState<EngagementLetter | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormSubmission | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [adminFlipForms, setAdminFlipForms] = useState<FormSubmission[]>([]);
  const [loadingAdminForms, setLoadingAdminForms] = useState(false);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  /** Display names derived from submission_data (business name, first+last, entity name) for admin table */
  const [formDisplayNames, setFormDisplayNames] = useState<Record<string, string>>({});

  // Get permissions or default to false
  const isSuperAdmin = permissions?.is_super_admin || false;
  const canViewPersonal = isSuperAdmin || permissions?.can_view_personal_organizer || false;
  const canViewBusiness = isSuperAdmin || permissions?.can_view_business_organizer || false;
  const canViewRental = isSuperAdmin || permissions?.can_view_rental_organizer || false;
  const canViewFlip = isSuperAdmin || permissions?.can_view_flip_organizer || false;
  const canViewEngagement = isSuperAdmin || permissions?.can_view_engagement_letter || false;

  useEffect(() => {
    loadUserForms();
  }, [user.id]);

  /** Derive display name from submission_data (same logic as client organizers). */
  const getDisplayNameFromSubmission = (formType: string, submissionData: any): string | null => {
    if (!submissionData) return null;
    if (formType === 'business') {
      const name = submissionData.basicInfo?.businessName?.trim();
      return name || null;
    }
    if (formType === 'personal') {
      const b = submissionData.basicInfo || {};
      const name = [b.firstName, b.lastName].filter(Boolean).join(' ').trim();
      return name || null;
    }
    if (formType === 'rental') {
      const name = submissionData.entityInfo?.businessName?.trim();
      return name || null;
    }
    if (formType === 'flip') {
      const addr = submissionData.flipInfo?.address?.trim();
      return addr || null;
    }
    return null;
  };

  const loadUserForms = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAdminUserForms(user.id);
      const personal = response.personal || [];
      const business = response.business || [];
      const rental = response.rental || [];
      const flip = response.flip || [];
      setForms({
        personal,
        business,
        rental,
        flip,
      });
      // Set engagement letter if it exists
      if (response.engagement_letter) {
        setEngagementLetter(response.engagement_letter);
      } else {
        setEngagementLetter(null);
      }
      // Load submission data for each form to show generated titles (business name, first+last, entity name)
      const allForms: { id: string; form_type: string }[] = [
        ...personal.map((f: FormSubmission) => ({ id: f.id, form_type: 'personal' })),
        ...business.map((f: FormSubmission) => ({ id: f.id, form_type: 'business' })),
        ...rental.map((f: FormSubmission) => ({ id: f.id, form_type: 'rental' })),
        ...flip.map((f: FormSubmission) => ({ id: f.id, form_type: 'flip' })),
      ];
      const results = await Promise.allSettled(
        allForms.map((f) => apiService.getSubmission(f.id, f.form_type, true))
      );
      const names: Record<string, string> = {};
      allForms.forEach((f, i) => {
        const res = results[i];
        if (res.status === 'fulfilled' && res.value?.submission_data) {
          const name = getDisplayNameFromSubmission(f.form_type, res.value.submission_data);
          if (name) names[f.id] = name;
        }
      });
      setFormDisplayNames(names);
    } catch (error: any) {
      console.error('Error loading user forms:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user forms. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Build available tabs based on permissions
  const availableTabs = [];
  if (canViewPersonal) availableTabs.push({ type: 'personal', index: availableTabs.length });
  if (canViewBusiness) availableTabs.push({ type: 'business', index: availableTabs.length });
  if (canViewRental) availableTabs.push({ type: 'rental', index: availableTabs.length });
  if (canViewFlip) availableTabs.push({ type: 'flip', index: availableTabs.length });
  if (canViewEngagement) availableTabs.push({ type: 'engagement', index: availableTabs.length });

  const getCurrentTabType = () => {
    return availableTabs[activeTab]?.type || null;
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleViewForm = (form: FormSubmission) => {
    setSelectedForm(form);
    setDetailDialogOpen(true);
  };

  const loadAdminFlipForms = async () => {
    try {
      setLoadingAdminForms(true);
      const list = await apiService.getFormSubmissionsByType('flip', { useAdminToken: true });
      setAdminFlipForms(Array.isArray(list) ? list : []);
      setReassignDialogOpen(true);
    } catch (err: any) {
      console.error('Error loading admin flip forms:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to load your flip forms.',
        variant: 'destructive',
      });
    } finally {
      setLoadingAdminForms(false);
    }
  };

  const handleReassignToClient = async (form: FormSubmission) => {
    try {
      setReassigningId(form.id);
      await apiService.reassignSubmissionToClient(form.id, 'flip', user.id);
      toast({ title: 'Reassigned', description: `"${form.form_name || 'Flip form'}" is now under this client.` });
      setReassignDialogOpen(false);
      await loadUserForms();
    } catch (err: any) {
      console.error('Error reassigning:', err);
      toast({
        title: 'Error',
        description: err?.message || 'Failed to reassign form.',
        variant: 'destructive',
      });
    } finally {
      setReassigningId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted':
        return 'success';
      case 'draft':
        return 'default';
      case 'processing':
        return 'warning';
      case 'completed':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string, includeTime: boolean = true) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    return date.toLocaleDateString('en-US', options);
  };

  const getCurrentForms = () => {
    const tabType = getCurrentTabType();
    switch (tabType) {
      case 'personal':
        return forms.personal;
      case 'business':
        return forms.business;
      case 'rental':
        return forms.rental;
      case 'flip':
        return forms.flip;
      case 'engagement':
        return []; // Engagement letter is handled separately
      default:
        return [];
    }
  };

  const getTabLabel = (tabType: string | null) => {
    switch (tabType) {
      case 'personal':
        return 'Personal Organizer';
      case 'business':
        return 'Business Organizer';
      case 'rental':
        return 'Rental Property Organizer';
      case 'flip':
        return 'Flip Organizer';
      case 'engagement':
        return 'Engagement Letter';
      default:
        return '';
    }
  };

  const getTabIcon = (index: number) => {
    switch (index) {
      case 0:
        return <PersonIcon />;
      case 1:
        return <BusinessIcon />;
      case 2:
        return <HomeIcon />;
      case 3:
        return <FlipIcon />;
      case 4:
        return <DescriptionIcon />;
      default:
        return null;
    }
  };

  const currentForms = getCurrentForms();

  const handleLogout = () => {
    clearAllAuthAndPurge(dispatch, persistor);
    navigate('/atg-admin/login');
  };

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
              <IconButton onClick={onBack} sx={{ color: '#64748b' }}>
                <ArrowBackIcon />
              </IconButton>
              <img 
                src={businessLogo} 
                alt="Business Logo" 
                style={{ height: '40px', width: 'auto' }}
              />
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  User Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.username} • {user.email}
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
        {/* User Info Card */}
        <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                  {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
                {(user.first_name || user.last_name) && (
                  <Typography variant="body2" color="text.secondary">
                    {[user.first_name, user.last_name].filter(Boolean).join(' ')}
                  </Typography>
                )}
              </Box>
              <Chip
                label={user.is_active ? 'Active' : 'Inactive'}
                color={user.is_active ? 'success' : 'default'}
                sx={{ fontWeight: 500 }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Forms Tabs */}
        <Card sx={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)' }}>
          <CardContent>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid #e2e8f0',
                mb: 3,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                },
              }}
            >
              {canViewPersonal && (
                <Tab
                  icon={<PersonIcon />}
                  iconPosition="start"
                  label={`Personal Organizer (${forms.personal.length})`}
                />
              )}
              {canViewBusiness && (
                <Tab
                  icon={<BusinessIcon />}
                  iconPosition="start"
                  label={`Business Organizer (${forms.business.length})`}
                />
              )}
              {canViewRental && (
                <Tab
                  icon={<HomeIcon />}
                  iconPosition="start"
                  label={`Rental Property (${forms.rental.length})`}
                />
              )}
              {canViewFlip && (
                <Tab
                  icon={<FlipIcon />}
                  iconPosition="start"
                  label={`Flip Organizer (${forms.flip.length})`}
                />
              )}
              {canViewEngagement && (
                <Tab
                  icon={<DescriptionIcon />}
                  iconPosition="start"
                  label={`Engagement Letter ${engagementLetter ? '(Signed)' : '(Not Signed)'}`}
                />
              )}
            </Tabs>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : getCurrentTabType() === 'engagement' ? (
              // Engagement Letter Tab
              engagementLetter ? (
                <Paper sx={{ p: 4, border: '1px solid #e2e8f0' }}>
                  {/* Header with Logo */}
                  <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '3px solid #2c3e7e', pb: 2 }}>
                    <Box
                      component="img"
                      src={businessLogo}
                      alt="Advanced Tax Group"
                      sx={{ height: 80, mb: 1 }}
                    />
                  </Box>

                  {/* Status Badge */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
                    <Chip label="Signed" color="success" sx={{ fontWeight: 500 }} />
                  </Box>

                  {/* Document Title */}
                  <Typography variant="h5" sx={{ fontWeight: 600, mb: 3, textAlign: 'center' }}>
                    Engagement Letter Individual Tax Returns
                  </Typography>

                  {/* Document Content */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" paragraph>
                      Dear Client:
                    </Typography>

                    <Typography variant="body1" paragraph>
                      This letter confirms the arrangements for our income tax services, as follows:
                    </Typography>

                    <Typography variant="body1" paragraph>
                      1. We will prepare your federal and state individual income tax returns from information
                      provided by you. The number of tax returns we complete is based on information provided
                      to us. At your request, we will furnish you with the tax organizer and worksheets to assist
                      you in gathering the necessary information. We will not audit or verify the data you submit,
                      although we may ask you to clarify it, or furnish us with additional data. It is your
                      responsibility to provide information required for preparation of complete and accurate returns.
                      You should keep all documents, canceled checks, and other data that support your reported
                      income and deductions. They may be necessary to prove accuracy and completeness of the return
                      to a taxing authority. You are responsible for the returns, so review them carefully before
                      you sign them.
                    </Typography>

                    <Typography variant="body1" paragraph>
                      2. By your signature below, you are confirming to us that unless we are otherwise advised,
                      your, business, travel, entertainment, gifts and related expenses are supported by the
                      necessary records required under Section 274 of the Internal Revenue Code. If you claim
                      business use of a vehicle, you acknowledge you have written documentation of the use and
                      purpose of that vehicle. If you have any questions as to the type of records required, please
                      ask us for advice.
                    </Typography>

                    <Typography variant="body1" paragraph>
                      3. We will use our professional judgment in preparing your returns. Whenever we are aware
                      that possible applicable tax law is unclear or that there are conflicting interpretations of the
                      law by authorities (e.g., tax agencies and courts), we will discuss with you our knowledge
                      and understanding of the possible positions which may be taken on your return. We will
                      adopt whatever position you request on your return so long as it is consistent with our
                      professional standards and ethics. If the Internal Revenue Service should later contest the
                      position taken, then there may be an assessment of additional tax liability, plus interest and
                      possible penalties. We assume no liability for any such additional assessments.
                    </Typography>

                    <Typography variant="body1" paragraph>
                      4. The Tax Equity and Fiscal Responsibility Act of 1982 ("TEFRA"), and the Tax Reform Act
                      of 1986 contained a new Section 6661 calling for penalties against taxpayers for substantial
                      understatement of tax (defined as being more than 25% of the tax). This penalty may be
                      assessed unless the taxpayer can show that there was "substantial authority" for any position
                      that was ultimately disallowed or that there was "adequate disclosure" in the return of any
                      conflict between an Internal Revenue Service position and that taken by the taxpayer.
                      Should a material tax issue arise, you agree to advise us if you wish such disclosure to be
                      made in your returns or if you desire us to identify or perform further research with respect to
                      this tax issue.
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ pageBreakBefore: 'always', pt: 2 }}>
                      <strong>Page 2</strong>
                    </Typography>

                    <Typography variant="body1" paragraph>
                      5. Your returns are subject to review by taxing authorities. Any item which may be resolved
                      against you by the examining agent is subject to certain rights of appeal. In the event of any
                      tax examination, we will provide basic phone support as needed. If additional tax
                      representation services are requested, such as reviews of the income tax aspects of proposed
                      or completed transactions, compile income tax projections, engage in research in connection
                      with such matters or tax court representation, we will render additional invoices for such
                      services at our then normal billing rate.
                    </Typography>

                    <Typography variant="body1" paragraph>
                      6. We may request verbally or in writing documentation to support the preparation of your
                      income taxes.
                    </Typography>

                    <Typography variant="body1" paragraph>
                      7. We would expect to continue to perform our services under the arrangements discussed
                      above from year to year unless we are notified. If the foregoing meets with your agreement,
                      please sign this letter and return it to us.
                    </Typography>

                    <Typography variant="body1" paragraph sx={{ mt: 3 }}>
                      ATG Tax Elite, LLC
                    </Typography>
                  </Box>

                  {/* Agreement Section */}
                  <Box sx={{ mt: 4, p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      I have read and understand, and agree to these terms.
                    </Typography>

                    {/* Signature Field */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 1 }}>
                        Taxpayer Signature
                      </Typography>
                      <Box
                        sx={{
                          border: '1px solid #e2e8f0',
                          borderRadius: 2,
                          p: 2,
                          backgroundColor: '#ffffff',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          minHeight: 100,
                        }}
                      >
                        {engagementLetter.signature ? (
                          <img
                            src={engagementLetter.signature}
                            alt="Signature"
                            style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain' }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No signature available
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Taxpayer Name */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Taxpayer Name
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                        {engagementLetter.taxpayer_name}
                      </Typography>
                    </Box>

                    {/* Date Signed */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Date Signed
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, mt: 1 }}>
                        {formatDate(engagementLetter.date_signed, false)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', gap: 1, mt: 3, pt: 2, borderTop: '1px solid #e2e8f0' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(engagementLetter.created_at)}
                    </Typography>
                    {engagementLetter.updated_at !== engagementLetter.created_at && (
                      <Typography variant="caption" color="text.secondary">
                        • Updated: {formatDate(engagementLetter.updated_at)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              ) : (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  This user has not signed the Tax Engagement Letter yet.
                </Alert>
              )
            ) : getCurrentTabType() === 'flip' ? (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Fill a flip form on behalf of this client; it will be saved to their account.
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<FlipIcon />}
                    onClick={() => {
                      const base = window.location.origin + (window.location.pathname.startsWith('/atg-admin') ? '/' : window.location.pathname);
                      window.location.href = `${base}?for_user_id=${user.id}&type=flip`;
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    Fill Flip Form for this client
                  </Button>
                </Box>
                {currentForms.length === 0 ? (
                  <>
                    <Alert severity="info" sx={{ borderRadius: 2, mb: 2 }}>
                      No flip forms found for this user. Use the button above to fill one on their behalf.
                    </Alert>
                    <Box sx={{ mt: 2, p: 2, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Already submitted a flip form while logged in as admin?
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Load your flip forms and reassign one to this client so it appears here.
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FlipIcon />}
                        onClick={loadAdminFlipForms}
                        disabled={loadingAdminForms}
                        sx={{ textTransform: 'none' }}
                      >
                        {loadingAdminForms ? 'Loading…' : 'Load my flip forms'}
                      </Button>
                    </Box>
                  </>
                ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Form ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Form Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Submitted</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentForms.map((form) => (
                      <TableRow
                        key={form.id}
                        sx={{
                          '&:hover': { backgroundColor: '#f8fafc' },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {form.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formDisplayNames[form.id] || form.form_name || 'Untitled Form'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={form.status === 'submitted' ? 'Submitted' : 'Draft'}
                            color={getStatusColor(form.status) as any}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(form.submitted_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewForm(form)}
                            sx={{
                              textTransform: 'none',
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              '&:hover': {
                                borderColor: '#2563eb',
                                backgroundColor: '#eff6ff',
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
                )}
              </>
            ) : currentForms.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                No {getTabLabel(getCurrentTabType()).toLowerCase()} forms found for this user.
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Form ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Form Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: '#1e293b' }}>Submitted</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: '#1e293b' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentForms.map((form) => (
                      <TableRow
                        key={form.id}
                        sx={{
                          '&:hover': { backgroundColor: '#f8fafc' },
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {form.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {formDisplayNames[form.id] || form.form_name || 'Untitled Form'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={form.status === 'submitted' ? 'Submitted' : 'Draft'}
                            color={getStatusColor(form.status) as any}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(form.submitted_at)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => handleViewForm(form)}
                            sx={{
                              textTransform: 'none',
                              borderColor: '#3b82f6',
                              color: '#3b82f6',
                              '&:hover': {
                                borderColor: '#2563eb',
                                backgroundColor: '#eff6ff',
                              },
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* Form Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Form Details
          </Typography>
          <IconButton onClick={() => setDetailDialogOpen(false)} size="small">
            <ArrowBackIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedForm && (
            <FormDetailView
              form={{
                id: selectedForm.id,
                form_type: selectedForm.form_type || 'personal',
                form_name: formDisplayNames[selectedForm.id] || selectedForm.form_name || 'Tax Form',
                status: selectedForm.status,
                submitted_at: selectedForm.submitted_at,
              }}
              onBack={() => setDetailDialogOpen(false)}
              onEdit={() => {}}
              userToken={localStorage.getItem('adminAccessToken')}
              useAdminToken={true}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Reassign flip form to client dialog */}
      <Dialog
        open={reassignDialogOpen}
        onClose={() => setReassignDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Reassign flip form to this client
        </DialogTitle>
        <DialogContent dividers>
          {adminFlipForms.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              You have no flip forms under your admin account. Fill one using &quot;Fill Flip Form for this client&quot; above so it saves to this client.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8fafc' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Form Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {adminFlipForms.map((form) => (
                    <TableRow key={form.id}>
                      <TableCell>{form.form_name || 'Untitled'}</TableCell>
                      <TableCell>
                        <Chip
                          label={form.status === 'submitted' ? 'Submitted' : 'Draft'}
                          color={getStatusColor(form.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleReassignToClient(form)}
                          disabled={reassigningId === form.id}
                          sx={{ textTransform: 'none' }}
                        >
                          {reassigningId === form.id ? 'Reassigning…' : 'Reassign to this client'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReassignDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminUserDetail;

