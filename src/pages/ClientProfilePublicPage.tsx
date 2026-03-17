import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';
import {
    Business as BusinessIcon,
    Person as PersonIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    InsertDriveFile as FileIcon,
    Shield as ShieldIcon,
} from '@mui/icons-material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://tools.advancedtaxgroup.com/api';

interface Business {
    id: number;
    name: string;
    purpose: string;
    assets: string;
    is_first_year: boolean;
    prior_year_return: string | null;
}

interface ProfileData {
    id: number;
    identifier: string;
    legal_name: string;
    partners_name: string | null;
    num_businesses: number;
    has_smart_vault: boolean;
    submitted_to_ghl: boolean;
    businesses: Business[];
    created_at: string;
    updated_at: string;
}

const ClientProfilePublicPage: React.FC = () => {
    const { identifier } = useParams<{ identifier: string }>();
    const [data, setData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!identifier) {
            setError('Invalid link.');
            setLoading(false);
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/form/client-profile/${identifier}/`, {
                    headers: { Accept: 'application/json' },
                });
                const json = await res.json();
                if (!res.ok) throw new Error(json.detail || 'Profile not found.');
                if (!cancelled) setData(json);
            } catch (e: any) {
                if (!cancelled) setError(e.message || 'Failed to load profile.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [identifier]);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', gap: 2 }}>
                <CircularProgress sx={{ color: '#3b82f6' }} />
                <Typography color="text.secondary">Loading profile…</Typography>
            </Box>
        );
    }

    if (error || !data) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc', p: 3 }}>
                <Alert severity="error" sx={{ maxWidth: 480, width: '100%', borderRadius: 2 }}>
                    {error || 'Profile not found. This link may be invalid or expired.'}
                </Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Header */}
            <Box sx={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
                <Container maxWidth="md">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <PersonIcon sx={{ color: '#ffffff', fontSize: 22 }} />
                        </Box>
                        <Box>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', lineHeight: 1.2 }}>
                                {data.legal_name}
                            </Typography>
                            {data.partners_name && (
                                <Typography variant="caption" color="text.secondary">
                                    Partner: {data.partners_name}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
                {/* Overview card */}
                <Card sx={{ mb: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 2 }}>
                            Overview
                        </Typography>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            <Box sx={{ flex: '1 1 180px', p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" color="text.secondary" display="block">Businesses</Typography>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>{data.num_businesses}</Typography>
                            </Box>
                            <Box sx={{ flex: '1 1 180px', p: 2, backgroundColor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                                <Typography variant="caption" color="text.secondary" display="block">SmartVault</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    {data.has_smart_vault
                                        ? <Chip icon={<CheckCircleIcon />} label="Has SmartVault" color="success" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                                        : <Chip icon={<CancelIcon />} label="No SmartVault" size="small" variant="outlined" sx={{ fontWeight: 500 }} />
                                    }
                                </Box>
                            </Box>

                        </Box>
                    </CardContent>
                </Card>

                {/* Businesses */}
                {data.businesses.length > 0 && (
                    <Card sx={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                <BusinessIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                    Businesses
                                </Typography>
                            </Box>

                            {data.businesses.map((b, i) => (
                                <React.Fragment key={b.id}>
                                    {i > 0 && <Divider sx={{ my: 2 }} />}
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'flex-start' }}>
                                        {/* Avatar */}
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <BusinessIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
                                        </Box>

                                        {/* Details */}
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mb: 0.5 }}>
                                                <Typography variant="body1" sx={{ fontWeight: 600, color: '#1e293b' }}>{b.name}</Typography>
                                                {b.is_first_year ? <Chip
                                                    label={b.is_first_year ? 'First Year' : ''}
                                                    size="small"
                                                    color={b.is_first_year ? 'success' : 'default'}
                                                    variant="outlined"
                                                    sx={{ fontWeight: 500, height: 22 }}
                                                /> : ""}

                                            </Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{b.purpose}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                <strong>Assets:</strong> {b.assets}
                                            </Typography>
                                            {b.prior_year_return && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.75 }}>
                                                    <FileIcon sx={{ color: '#3b82f6', fontSize: 15 }} />
                                                    <a
                                                        href={b.prior_year_return}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#3b82f6', fontSize: 13, textDecoration: 'none', fontWeight: 500 }}
                                                    >
                                                        Prior-Year Tax Return
                                                    </a>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </React.Fragment>
                            ))}
                        </CardContent>
                    </Card>
                )}

                {/* Footer */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap', mt: 3, color: '#94a3b8' }}>
                    <ShieldIcon sx={{ fontSize: 14 }} />
                    <Typography variant="caption">
                        This profile is accessible via a private link. Do not share it publicly.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default ClientProfilePublicPage;
