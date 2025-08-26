import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Box } from '@mui/material';

export const TooltipWrapper = ({ children, content, ...props }) => {
  if (!content) {
    return children;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Box component="span" sx={{ display: 'inline-flex' }}>
            {children}
          </Box>
        </TooltipTrigger>
        <TooltipContent side="top" align="start">
          <p>{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};