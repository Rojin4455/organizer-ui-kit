import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas } from 'fabric';
import { Box, Button, Typography, Paper } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';

export const SignatureDrawer = ({ label, value, onChange, width = 400, height = 150 }) => {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const [isDrawing, setIsDrawing] = useState(true); // Start in drawing mode

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: width,
      height: height,
      backgroundColor: '#ffffff',
      isDrawingMode: true,
    });

    // Wait for canvas to be fully initialized
    setTimeout(() => {
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = '#000000';
        canvas.freeDrawingBrush.width = 2;
      }

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
    }, 100);

    return () => {
      if (canvas) {
        canvas.dispose();
      }
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
    
    if (newDrawingMode && fabricCanvas.freeDrawingBrush) {
      fabricCanvas.freeDrawingBrush.color = '#000000';
      fabricCanvas.freeDrawingBrush.width = 2;
    }
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
            backgroundColor: '#fafafa',
            cursor: 'crosshair'
          }}
        >
          <canvas 
            ref={canvasRef}
            style={{ 
              cursor: 'crosshair',
              display: 'block',
              touchAction: 'none'
            }}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button
            variant={isDrawing ? "contained" : "outlined"}
            size="small"
            startIcon={<EditIcon />}
            onClick={toggleDrawingMode}
            color="primary"
          >
            {isDrawing ? 'Drawing Mode' : 'Selection Mode'}
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
          Click and drag to draw your signature above
        </Typography>
      </Paper>
    </Box>
  );
};