import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  ThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SignaturePad } from '../components/shared/SignaturePad';
import businessLogo from '../assets/business-logo.png';
import { ArrowLeft } from 'lucide-react';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
});

export const TaxEngagementLetter = () => {
  const navigate = useNavigate();
  const [signature, setSignature] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [taxpayerName, setTaxpayerName] = useState('');

  const handleSubmit = () => {
    // TODO: Implement submission logic
    console.log('Submitting engagement letter:', { signature, date, taxpayerName });
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 3 }}>
            <Button
              startIcon={<ArrowLeft />}
              onClick={() => navigate('/')}
              sx={{ mb: 2 }}
            >
              Back to Dashboard
            </Button>
          </Box>

          <Paper sx={{ p: 4 }}>
            {/* Header with Logo */}
            <Box sx={{ textAlign: 'center', mb: 4, borderBottom: '3px solid #2c3e7e', pb: 2 }}>
              <Box
                component="img"
                src={businessLogo}
                alt="Advanced Tax Group"
                sx={{ height: 80, mb: 1 }}
              />
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
                made in your returns or if you desire us to identify or perform further research with respect
                to this tax issue.
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
                <SignaturePad
                  label="Taxpayer Signature"
                  value={signature}
                  onChange={setSignature}
                  width={500}
                  height={150}
                />
              </Box>

              {/* Taxpayer Name Field */}
              <TextField
                fullWidth
                label="Accepted by: Taxpayer"
                value={taxpayerName}
                onChange={(e) => setTaxpayerName(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              {/* Date Field */}
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                required
              />
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={!signature || !taxpayerName || !date}
              >
                Submit Agreement
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default TaxEngagementLetter;
