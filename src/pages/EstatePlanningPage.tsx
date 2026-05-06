import React from 'react';
import { EstateFormProvider } from '../contexts/EstateFormContext';
import MultiStepEstateForm from '../components/estate-planning/MultiStepEstateForm';
import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { User, Users, FileCheck, ScrollText, Landmark, LogOut } from 'lucide-react';

import businessLogo from '../assets/New-log.png';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { clearAllAuthAndPurge } from '../utils/authLogout';
import { useNavigate } from 'react-router-dom';
import { persistor } from '../store/store';

const estateSteps = [
    { id: 1, title: 'Personal Information', description: 'Demographics & contact details', icon: User },
    { id: 2, title: 'Heirs & Legal', description: 'Dependents, Fiduciaries & Legal', icon: Users },
    { id: 3, title: 'Trust Distribution', description: 'Asset allocation & contingencies', icon: ScrollText },
    { id: 4, title: 'Financial, Business & Property', description: 'Assets & Real Estate', icon: Landmark },
    { id: 5, title: 'Review & Submit', description: 'Finalize and launch', icon: FileCheck },
];

const EstatePlanningPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: any) => state.auth);

    const handleLogout = () => {
        clearAllAuthAndPurge(dispatch, persistor);
        navigate('/login');
    };

    const getInitials = (username: string) => {
        return username ? username.slice(0, 2).toUpperCase() : 'U';
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            {/* Common Navbar mirroring ClientProfileCreator but minimalized */}
            <AppBar position="static" elevation={0} sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', zIndex: 1200 }}>
                <Toolbar sx={{
                    flexWrap: { xs: 'wrap', sm: 'nowrap' },
                    minHeight: { xs: 'auto', sm: '64px' },
                    py: { xs: 1, sm: 0 },
                    gap: { xs: 1, sm: 0 }
                }}>
                    <Box sx={{
                        mr: { xs: 1, sm: 2 },
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <Box
                            component="img"
                            src={businessLogo}
                            alt="Business Logo"
                            sx={{ height: '40px', width: 'auto', maxHeight: { xs: '32px', sm: '40px' } }}
                        />
                    </Box>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            color: '#1e293b',
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.25rem' },
                            display: { xs: 'none', sm: 'block' }
                        }}
                    >
                        Tax Organizer Pro
                    </Typography>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 1, sm: 2 },
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'space-between', sm: 'flex-end' },
                        order: { xs: 3, sm: 2 }
                    }}>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <IconButton
                                    color="inherit"
                                    sx={{
                                        color: '#64748b',
                                        flexShrink: 0
                                    }}
                                >
                                    <SettingsIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
                                </IconButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56" style={{ zIndex: 1300 }}>
                                <DropdownMenuLabel>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                                {getInitials(user?.username)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium">{user?.username || 'User'}</span>
                                            {user?.email && (
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            )}
                                        </div>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Logout</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Box>
                </Toolbar>
            </AppBar>

            <div className="flex-grow p-4 md:p-8 flex justify-center items-start pt-12">
                <div className="w-full">
                    <EstateFormProvider steps={estateSteps}>
                        <MultiStepEstateForm />
                    </EstateFormProvider>
                </div>
            </div>
        </div>
    );
};

export default EstatePlanningPage;
