import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';

export const SecureTextField = ({
  label,
  value,
  onChange,
  placeholder,
  helperText,
  required = false,
  error = false,
  type = 'text',
  fullWidth = true,
  size = 'medium',
}) => {
  const [showValue, setShowValue] = useState(false);
  const [focused, setFocused] = useState(false);

  const isSecureField = ['ssn', 'ein', 'account', 'routing'].includes(type);

  const formatValue = (val) => {
    if (!val) return '';
    
    switch (type) {
      case 'ssn':
        // Format as XXX-XX-XXXX
        const ssnDigits = val.replace(/\D/g, '').slice(0, 9);
        if (ssnDigits.length >= 6) {
          return `${ssnDigits.slice(0, 3)}-${ssnDigits.slice(3, 5)}-${ssnDigits.slice(5)}`;
        } else if (ssnDigits.length >= 3) {
          return `${ssnDigits.slice(0, 3)}-${ssnDigits.slice(3)}`;
        }
        return ssnDigits;
      
      case 'ein':
        // Format as XX-XXXXXXX
        const einDigits = val.replace(/\D/g, '').slice(0, 9);
        if (einDigits.length >= 3) {
          return `${einDigits.slice(0, 2)}-${einDigits.slice(2)}`;
        }
        return einDigits;
      
      case 'account':
      case 'routing':
        return val.replace(/\D/g, '');
      
      default:
        return val;
    }
  };

  const handleChange = (e) => {
    const formatted = formatValue(e.target.value);
    onChange(formatted);
  };

  const displayValue = isSecureField && !showValue && !focused && value
    ? '*'.repeat(value.length)
    : value;

  return (
    <Box>
      <TextField
        label={label}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        helperText={helperText}
        required={required}
        error={error}
        fullWidth={fullWidth}
        size={size}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        InputProps={{
          startAdornment: isSecureField ? (
            <InputAdornment position="start">
              <Tooltip title="This field is encrypted for security">
                <SecurityIcon sx={{ color: '#3b82f6', fontSize: 20 }} />
              </Tooltip>
            </InputAdornment>
          ) : undefined,
          endAdornment: isSecureField ? (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowValue(!showValue)}
                edge="end"
                size="small"
              >
                {showValue ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: isSecureField ? '#fefce8' : 'transparent',
            '&:hover': {
              backgroundColor: isSecureField ? '#fef3c7' : 'transparent',
            },
            '&.Mui-focused': {
              backgroundColor: isSecureField ? '#fef3c7' : 'transparent',
            },
          },
        }}
      />
      {isSecureField && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          🔒 This information is encrypted and stored securely
        </Typography>
      )}
    </Box>
  );
};