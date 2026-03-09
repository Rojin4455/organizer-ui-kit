import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  PlayCircleOutline as PlayIcon,
  HelpOutline as HelpIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Helper function to get embed URL
const getEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

const VideoCard = ({ videoUrl }) => {
  const embedUrl = getEmbedUrl(videoUrl);
  
  if (!embedUrl) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography color="error">Invalid video URL</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        paddingBottom: '56.25%', // 16:9 aspect ratio
        height: 0,
        overflow: 'hidden',
        borderRadius: 2,
        backgroundColor: '#000',
        minHeight: { xs: '200px', sm: 'auto' },
      }}
    >
      <iframe
        src={embedUrl}
        title="Video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          maxWidth: '100%',
        }}
      />
    </Box>
  );
};

export const ToolBox = () => {
  const [expandedSection, setExpandedSection] = useState(false);

  const handleChange = (section) => (event, isExpanded) => {
    setExpandedSection(isExpanded ? section : false);
  };

  const videoSections = [
    {
      id: 'faq',
      title: 'FAQ Overview',
      icon: HelpIcon,
      description: 'Learn about frequently asked questions and how to use the Tax ToolBox',
      videoUrl: 'https://youtu.be/-t75aP5JgLg',
    },
    {
      id: 'personal',
      title: 'Personal Organizer Walkthrough',
      icon: PersonIcon,
      description: 'Step-by-step guide on how to complete the Personal Tax Organizer',
      videoUrl: 'https://youtu.be/NqgYbZIWrek',
    },
    {
      id: 'business',
      title: 'Business Organizer Walkthrough',
      icon: BusinessIcon,
      description: 'Step-by-step guide on how to complete the Business Tax Organizer',
      videoUrl: 'https://youtu.be/dz1CJcjDZ2M',
    },
  ];

  return (
    <Box sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 0 } }}>
      <Box sx={{ textAlign: 'center', mb: 4, px: { xs: 2, sm: 0 } }}>
        {/* <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 700, 
            mb: 1,
            fontSize: { xs: '1.5rem', sm: '2.125rem' }
          }}
        >
          ToolBox
        </Typography> */}
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 700, 
            mx: 'auto',
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 2, sm: 0 }
          }}
        >
          Access helpful video guides and tutorials to understand FAQs and complete your tax organizers
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#f8fafc',
          borderRadius: 3,
          p: { xs: 1, sm: 2 },
        }}
      >
        {videoSections.map((section) => (
          <Accordion
            key={section.id}
            expanded={expandedSection === section.id}
            onChange={handleChange(section.id)}
            sx={{
              mb: 2,
              '&:before': {
                display: 'none',
              },
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
              '&.Mui-expanded': {
                margin: '0 0 16px 0',
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                backgroundColor: '#ffffff',
                borderRadius: 2,
                px: { xs: 1.5, sm: 2 },
                '&.Mui-expanded': {
                  borderBottomLeftRadius: 0,
                  borderBottomRightRadius: 0,
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <section.icon sx={{ mr: { xs: 1, sm: 2 }, color: '#3b82f6', fontSize: { xs: 20, sm: 28 }, flexShrink: 0 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.95rem', sm: '1.25rem' }
                    }}
                  >
                    {section.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      display: { xs: 'none', sm: 'block' }
                    }}
                  >
                    {section.description}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: '#ffffff',
                borderBottomLeftRadius: 2,
                borderBottomRightRadius: 2,
                pt: { xs: 2, sm: 3 },
                px: { xs: 1, sm: 3 },
                pb: { xs: 2, sm: 3 },
              }}
            >
              <VideoCard
                videoUrl={section.videoUrl}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

