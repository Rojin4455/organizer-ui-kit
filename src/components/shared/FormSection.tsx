import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Collapse,
  IconButton,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  isExpanded?: boolean;
  onToggle?: () => void;
  isSecure?: boolean;
  isCompleted?: boolean;
  isRequired?: boolean;
  errorCount?: number;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  isExpanded = true,
  onToggle,
  isSecure = false,
  isCompleted = false,
  isRequired = false,
  errorCount = 0,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
        },
      }}
    >
      <Box
        sx={{
          p: 3,
          backgroundColor: isExpanded ? '#f8fafc' : 'transparent',
          borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
          cursor: onToggle ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
        onClick={onToggle}
      >
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            {isRequired && (
              <Chip
                label="Required"
                size="small"
                color="error"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
            {isSecure && (
              <Chip
                icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                label="Secure"
                size="small"
                color="primary"
                variant="outlined"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
            {isCompleted && (
              <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 20 }} />
            )}
            {errorCount > 0 && (
              <Chip
                label={`${errorCount} error${errorCount > 1 ? 's' : ''}`}
                size="small"
                color="error"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        {onToggle && (
          <IconButton
            sx={{
              transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        )}
      </Box>
      <Collapse in={isExpanded}>
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Collapse>
    </Paper>
  );
};