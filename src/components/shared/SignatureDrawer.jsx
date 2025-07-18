import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

export const SignatureDrawer = ({ label, value, onChange, width = 400, height = 150 }) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    canvas.freeDrawingBrush.color = '#000000';
    canvas.freeDrawingBrush.width = 2;

    // Load existing signature if value exists
    if (value) {
      try {
        canvas.loadFromJSON(value, () => {
          canvas.renderAll();
        });
      } catch (error) {
        console.log('Error loading signature:', error);
      }
    }

    setFabricCanvas(canvas);

    // Save signature when drawing stops
    const handlePathCreated = () => {
      setTimeout(() => {
        const signatureData = canvas.toJSON();
        onChange(JSON.stringify(signatureData));
      }, 100);
    };

    canvas.on('path:created', handlePathCreated);

    return () => {
      canvas.off('path:created', handlePathCreated);
      canvas.dispose();
    };
  }, []);

  const handleClear = () => {
    if (!fabricCanvas) return;
    fabricCanvas.clear();
    fabricCanvas.backgroundColor = '#ffffff';
    fabricCanvas.renderAll();
    onChange('');
  };

  const toggleDrawingMode = () => {
    if (!fabricCanvas) return;
    const newDrawingMode = !isDrawing;
    setIsDrawing(newDrawingMode);
    fabricCanvas.isDrawingMode = newDrawingMode;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
        {label}
      </Typography>
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          border: '1px solid #e0e0e0',
          borderRadius: 2
        }}
      >
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 1, 
            p: 1,
            backgroundColor: '#fafafa'
          }}
        >
          <canvas 
            ref={canvasRef}
            style={{ 
              cursor: isDrawing ? 'crosshair' : 'default',
              display: 'block'
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={toggleDrawingMode}
            color={isDrawing ? "primary" : "inherit"}
          >
            {isDrawing ? 'Stop Drawing' : 'Start Drawing'}
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<DeleteIcon />}
            onClick={handleClear}
            color="error"
          >
            Clear
          </Button>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
          Click "Start Drawing" to sign, then draw your signature above
        </Typography>
      </Paper>
    </Box>
  );
};