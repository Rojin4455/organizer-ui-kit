import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import apiService from '../services/api';

import { AppBar, Toolbar, Box, Typography, IconButton } from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import businessLogo from '../assets/New-log.png';
import { useSelector, useDispatch } from 'react-redux';
import { clearAllAuthAndPurge } from '../utils/authLogout';
import { completeOnboarding } from '../store/authSlice';
import { persistor } from '../store/store';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, X, Loader2 } from 'lucide-react';

interface Business {
    name: string;
    purpose: string;
    assets: string;
}

const ClientProfileCreator = () => {
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

    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        legalName: '',
        partnersName: '',
        numBusinesses: 0,
        isFirstYear: 'yes',
        hasSmartVault: 'no',
        priorYearReturn: null as File | null,
    });

    const [businesses, setBusinesses] = useState<Business[]>([]);

    const handleNumBusinessesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const num = Math.min(10, Math.max(0, parseInt(e.target.value) || 0));
        setFormData({ ...formData, numBusinesses: num });

        setBusinesses(prev => {
            const newBusinesses = [...prev];
            if (num > newBusinesses.length) {
                for (let i = newBusinesses.length; i < num; i++) {
                    newBusinesses.push({ name: '', purpose: '', assets: '' });
                }
            } else if (num < newBusinesses.length) {
                newBusinesses.splice(num);
            }
            return newBusinesses;
        });
    };

    const handleBusinessChange = (index: number, field: keyof Business, value: string) => {
        setBusinesses(prev => {
            const newBusinesses = [...prev];
            newBusinesses[index] = { ...newBusinesses[index], [field]: value };
            return newBusinesses;
        });
    };

    const removeBusiness = (index: number) => {
        setBusinesses(prev => {
            const newBusinesses = prev.filter((_, i) => i !== index);
            setFormData(current => ({ ...current, numBusinesses: newBusinesses.length }));
            return newBusinesses;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate prior year return requirement
        if (formData.isFirstYear === 'no' && !formData.priorYearReturn) {
            toast.error('Please upload your prior-year tax returns.');
            return;
        }

        setIsLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('legalName', formData.legalName);
            submitData.append('partnersName', formData.partnersName);
            submitData.append('numBusinesses', formData.numBusinesses.toString());
            submitData.append('isFirstYear', formData.isFirstYear);
            submitData.append('hasSmartVault', formData.hasSmartVault);
            submitData.append('businesses', JSON.stringify(businesses));

            if (formData.priorYearReturn) {
                submitData.append('priorYearReturn', formData.priorYearReturn);
            }

            const loadingToastId = toast.loading('Submitting profile... Please wait for synchronization.');

            await apiService.submitClientProfile(submitData);

            toast.dismiss(loadingToastId);
            toast.success('Profile completed successfully! Redirecting...');

            // Update local Redux state manually
            dispatch(completeOnboarding());

            // Redirect logic for when successful. Using root for now.
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || 'Failed to submit profile. Please try again.');
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFormData({ ...formData, priorYearReturn: e.target.files[0] });
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
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

            <div className="flex-grow p-4 md:p-8 flex justify-center">
                <div className="w-full max-w-3xl space-y-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Client Profile Creator</h1>
                        <p className="text-muted-foreground">
                            Please complete your profile so our team has full visibility into your scope.
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Basic details about you and any partners.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="legalName">Legal Name <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="legalName"
                                            required
                                            value={formData.legalName}
                                            onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="partnersName">Partner(s) Name</Label>
                                        <Input
                                            id="partnersName"
                                            value={formData.partnersName}
                                            onChange={(e) => setFormData({ ...formData, partnersName: e.target.value })}
                                            placeholder="Jane Doe (Optional)"
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="numBusinesses">Number of Businesses <span className="text-destructive">*</span></Label>
                                        <Input
                                            id="numBusinesses"
                                            type="number"
                                            min="0"
                                            max="10"
                                            required
                                            value={formData.numBusinesses}
                                            onChange={handleNumBusinessesChange}
                                        />
                                    </div>

                                    {businesses.map((business, index) => (
                                        <Card key={index} className="bg-muted/50 relative group">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive transition-colors hidden group-hover:flex z-10"
                                                onClick={() => removeBusiness(index)}
                                                title="Remove business"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <CardHeader className="py-3 pr-10">
                                                <CardTitle className="text-lg">Business {index + 1}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-4 py-3">
                                                <div className="space-y-2">
                                                    <Label>Business Name <span className="text-destructive">*</span></Label>
                                                    <Input
                                                        required
                                                        value={business.name}
                                                        onChange={(e) => handleBusinessChange(index, 'name', e.target.value)}
                                                        placeholder="Acme Corp"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Purpose <span className="text-destructive">*</span></Label>
                                                    <Input
                                                        required
                                                        value={business.purpose}
                                                        onChange={(e) => handleBusinessChange(index, 'purpose', e.target.value)}
                                                        placeholder="E-commerce Retail"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Assets Held <span className="text-destructive">*</span></Label>
                                                    <Input
                                                        required
                                                        value={business.assets}
                                                        onChange={(e) => handleBusinessChange(index, 'assets', e.target.value)}
                                                        placeholder="Inventory, Equipment"
                                                    />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <Label>Is this your first year filing with us? <span className="text-destructive">*</span></Label>
                                        <RadioGroup
                                            value={formData.isFirstYear}
                                            onValueChange={(val) => setFormData({ ...formData, isFirstYear: val })}
                                            className="flex flex-col space-y-1"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="yes" id="firstYear-yes" />
                                                <Label htmlFor="firstYear-yes" className="font-normal">Yes</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="no" id="firstYear-no" />
                                                <Label htmlFor="firstYear-no" className="font-normal">No</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {formData.isFirstYear === 'no' && (
                                        <div className="space-y-2 p-4 border rounded-md bg-secondary/20">
                                            <Label htmlFor="priorYearReturn">
                                                Prior-Year Tax Return Upload <span className="text-destructive">*</span>
                                            </Label>
                                            <p className="text-sm text-muted-foreground mb-2">
                                                Since it's not your first year, please upload your prior-year tax returns.
                                            </p>
                                            <Input
                                                id="priorYearReturn"
                                                type="file"
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={handleFileChange}
                                                required={formData.isFirstYear === 'no'}
                                            />
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                <div className="space-y-3">
                                    <Label>Do you already have a SmartVault account with us? <span className="text-destructive">*</span></Label>
                                    <RadioGroup
                                        value={formData.hasSmartVault}
                                        onValueChange={(val) => setFormData({ ...formData, hasSmartVault: val })}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="yes" id="sv-yes" />
                                            <Label htmlFor="sv-yes" className="font-normal">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="no" id="sv-no" />
                                            <Label htmlFor="sv-no" className="font-normal">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </div>
                                    ) : (
                                        'Submit Profile'
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ClientProfileCreator;
