import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  RadioGroup,
  Radio,
  TextField,
  Grid,
  Divider,
} from '@mui/material';
import { FormSection } from '../../shared/FormSection';

export const GeneralQuestions = ({ data = {}, onChange }) => {
  const handleChange = (field, value) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const renderYesNoQuestion = (field, question, showDetails = false, detailsField = null) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
        {question}
      </Typography>
      <RadioGroup
        row
        value={data[field] || ''}
        onChange={(e) => handleChange(field, e.target.value)}
      >
        <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
        <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
      </RadioGroup>
      {showDetails && data[field] === 'yes' && detailsField && (
        <TextField
          fullWidth
          size="small"
          placeholder="Please explain..."
          value={data[detailsField] || ''}
          onChange={(e) => handleChange(detailsField, e.target.value)}
          sx={{ mt: 1 }}
        />
      )}
    </Box>
  );

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
        General Questions
      </Typography>

      {/* Personal Information Section */}
      <FormSection
        title="Personal Information"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'movedResidence',
              '1. Did you move your residence more than 50 miles due to a change of employment?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'soldPrimaryResidence',
              '2. Did you sell your primary residence in the current year?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Dependent Information Section */}
      <FormSection
        title="Dependent Information"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'dependentsMustFile',
              '3. Do you have dependents who must file?'
            )}
            {renderYesNoQuestion(
              'childrenUnder14WithInvestment',
              '4. Do you have children under age 14 with investment income greater than $1,600?'
            )}
            {renderYesNoQuestion(
              'dependentsNotUSCitizens',
              '5. Are any of your dependents not U.S. citizens or residents?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'providedOverHalfSupport',
              '6. Did you provide over half the support for any other person during the current year?'
            )}
            {renderYesNoQuestion(
              'adoptionExpenses',
              '7. Did you incur adoption expenses during the current year?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Items Related to Income/Losses Section */}
      <FormSection
        title="Items Related to Income/Losses"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'disabilityPayments',
              '8. Did you receive any disability payments in the current year?'
            )}
            {renderYesNoQuestion(
              'soldPurchasedResidence',
              '9. Did you sell and/or purchase a principal residence in the current year? (Attach copies of your purchase and/or sale escrow statements.)'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'alimonyPayments',
              '10. Did you receive/pay alimony payments?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Prior Year Tax Returns Section */}
      <FormSection
        title="Prior Year Tax Returns"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderYesNoQuestion(
              'irsNotification',
              '11. Were you notified by the Internal Revenue Service or state taxing authority of changes to a prior year\'s return? If yes, enclose agent\'s report or notice of change.',
              true,
              'irsNotificationDetails'
            )}
            {renderYesNoQuestion(
              'priorYearChanges',
              '12. Were there changes to a prior year\'s income, deductions, credits, etc which would require filing an amended return?',
              true,
              'priorYearChangesDetails'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Foreign Bank Accounts and Taxes Section */}
      <FormSection
        title="Foreign Bank Accounts and Taxes"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderYesNoQuestion(
              'foreignIncome',
              '13. Did you have foreign income or pay any foreign taxes in the current year?'
            )}
            {renderYesNoQuestion(
              'foreignBankAccount',
              '14. At any time during the tax year, did you have an interest in or a signature or other authority over a bank account, or other financial account in a foreign country?'
            )}
            {renderYesNoQuestion(
              'foreignTrust',
              '15. Were you the grantor of or transferor to a foreign trust which existed during the tax year, whether or not you have any beneficial interest in the trust?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Gifts to Trusts or Tuition Plans Section */}
      <FormSection
        title="Gifts to Trusts or Tuition Plans"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {renderYesNoQuestion(
              'giftsOverLimit',
              '16. Did you or your spouse make gifts of over $14,000 to an individual or contribute to a prepaid tuition plan?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Electronic Filing and Direct Deposit Section */}
      <FormSection
        title="Electronic Filing and Direct Deposit or Refund"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'electronicFiling',
              '17. If your tax return is eligible for Electronic Filing, would you like to file electronically?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'directDeposit',
              '18. The Internal Revenue Service is able to deposit many refunds directly into taxpayers\' accounts. If you receive a refund, would you like direct deposit?'
            )}
          </Grid>
          
          {data.directDeposit === 'yes' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Direct Deposit Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Name of your financial institution"
                    value={data.bankName || ''}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Routing Transit Number"
                    helperText="(must begin with 01 through 12 or 21 through 32)"
                    value={data.routingNumber || ''}
                    onChange={(e) => handleChange('routingNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Account number"
                    value={data.accountNumber || ''}
                    onChange={(e) => handleChange('accountNumber', e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    What type of account is this?
                  </Typography>
                  <RadioGroup
                    row
                    value={data.accountType || ''}
                    onChange={(e) => handleChange('accountType', e.target.value)}
                  >
                    <FormControlLabel value="checking" control={<Radio size="small" />} label="Checking" />
                    <FormControlLabel value="savings" control={<Radio size="small" />} label="Savings" />
                  </RadioGroup>
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={data.voidedCheckAttached || false}
                        onChange={(e) => handleChange('voidedCheckAttached', e.target.checked)}
                      />
                    }
                    label="Please attach a voided check (not a deposit slip)"
                  />
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </FormSection>

      {/* Investments/Business Section */}
      <FormSection
        title="Investments / Business"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'stocksBonds',
              '19. Did you buy or sell any stocks or bonds in the current year?'
            )}
            {renderYesNoQuestion(
              'startedBusiness',
              '20. Did you start a business, purchase a rental property or farm, or acquire interests in partnerships or S corporations?'
            )}
            {renderYesNoQuestion(
              'virtualCurrency',
              '21. At any time during the tax year, did you receive, sell, exchange, or otherwise dispose of any financial interest in any virtual currency?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'businessEquipment',
              '22. Did you purchase any business equipment or make any capital improvements to business property?'
            )}
            {renderYesNoQuestion(
              'homeOfficeExpenses',
              '23. Did you use part of your home for business purposes or to care for daycare recipients?'
            )}
            {renderYesNoQuestion(
              'businessVehicle',
              '24. Did you use a vehicle for business purposes (other than commuting)?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Healthcare and Insurance Section */}
      <FormSection
        title="Healthcare and Insurance"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'healthInsurance',
              '25. Did you have qualifying health care coverage for all 12 months of the tax year?'
            )}
            {renderYesNoQuestion(
              'healthSavingsAccount',
              '26. Did you contribute to a Health Savings Account (HSA)?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'premiumTaxCredit',
              '27. Did you receive advance payments of the premium tax credit?'
            )}
            {renderYesNoQuestion(
              'longTermCareInsurance',
              '28. Did you pay premiums for long-term care insurance?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Education and Student Loans Section */}
      <FormSection
        title="Education and Student Loans"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'educationExpenses',
              '29. Did you, your spouse, or dependents attend a post-secondary school during the tax year?'
            )}
            {renderYesNoQuestion(
              'studentLoanInterest',
              '30. Did you pay interest on qualified student loans?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'educationCredits',
              '31. Are you eligible for education credits (American Opportunity, Lifetime Learning)?'
            )}
            {renderYesNoQuestion(
              'educationSavings',
              '32. Did you contribute to or receive distributions from an education savings account (529 plan)?'
            )}
          </Grid>
        </Grid>
      </FormSection>

      {/* Retirement and Savings Section */}
      <FormSection
        title="Retirement and Savings"
        isExpanded
        sx={{ mb: 3 }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'iraContributions',
              '33. Did you make contributions to an IRA for the tax year?'
            )}
            {renderYesNoQuestion(
              'retirement401k',
              '34. Did you receive any distributions from retirement plans, annuities, or IRAs?'
            )}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderYesNoQuestion(
              'retirementPlanRollover',
              '35. Did you roll over any retirement plan distributions?'
            )}
            {renderYesNoQuestion(
              'sepIraContribution',
              '36. Did you contribute to a SEP-IRA or Simple IRA?'
            )}
          </Grid>
        </Grid>
      </FormSection>
    </Box>
  );
};