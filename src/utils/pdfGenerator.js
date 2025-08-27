import jsPDF from 'jspdf';

const PAGE_HEIGHT = 297; // A4 height in mm
const PAGE_WIDTH = 210; // A4 width in mm
const MARGIN = 20;
const LINE_HEIGHT = 7;
const SECTION_SPACING = 15;

// Helper function to add a new page if needed
const checkPageSpace = (doc, yPosition, requiredSpace = 15) => {
  if (yPosition + requiredSpace > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return 30; // Reset yPosition for new page
  }
  return yPosition;
};

// Helper function to wrap text with consistent formatting
const wrapText = (doc, text, maxWidth) => {
  const lines = doc.splitTextToSize(String(text || ''), maxWidth);
  return Array.isArray(lines) ? lines : [lines];
};

// Helper function to add text with consistent formatting and automatic page breaks
const addFormattedText = (doc, text, x, y, options = {}) => {
  const {
    fontSize = 10,
    fontStyle = 'normal',
    maxWidth = PAGE_WIDTH - (2 * MARGIN),
    align = 'left',
    color = [0, 0, 0]
  } = options;
  
  doc.setFontSize(fontSize);
  doc.setFont('helvetica', fontStyle);
  doc.setTextColor(color[0], color[1], color[2]);
  
  const wrappedLines = wrapText(doc, text, maxWidth);
  let currentY = y;
  
  wrappedLines.forEach((line, index) => {
    currentY = checkPageSpace(doc, currentY, LINE_HEIGHT);
    doc.text(line.trim(), x, currentY, { align });
    currentY += LINE_HEIGHT;
  });
  
  return currentY;
};

// Helper function to format values for PDF with proper boolean formatting
const formatValue = (value, type = 'text') => {
  if (value === null || value === undefined || value === '') {
    return '_____';
  }

  if (type === 'boolean') {
    if (value === true || value === 'yes' || value === 'Yes') {
      return '☑ Yes';
    } else if (value === false || value === 'no' || value === 'No') {
      return '☐ No';
    } else {
      return '☐ No';
    }
  }

  if (type === 'secure') {
    return value ? '***-**-****' : '_____';
  }

  if (type === 'signature') {
    return value ? 'SIGNATURE_IMAGE' : 'No signature provided';
  }

  if (type === 'multiline') {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? '☑ Yes' : '☐ No';
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    return value.map((item, index) => {
      if (typeof item === 'object' && item !== null) {
        return `Item ${index + 1}: ${Object.entries(item)
          .map(([key, val]) => `${key}: ${val || 'Not provided'}`)
          .join(', ')}`;
      }
      return `${index + 1}. ${item}`;
    }).join('\n');
  }

  if (typeof value === 'object' && value !== null) {
    return Object.entries(value)
      .map(([key, val]) => `${key}: ${val || 'Not provided'}`)
      .join('\n');
  }

  if (typeof value === 'number') {
    return value.toLocaleString();
  }

  return String(value);
};

// Form structure definitions - matching the exact form components
const getPersonalFormStructure = (submissionData) => [
  {
    title: 'Basic Taxpayer Information',
    fields: [
      { label: 'Returning Client, No Changes to Personal Information', value: submissionData?.basicInfo?.returningClient, type: 'boolean' },
    ]
  },
  {
    title: 'Personal Information',
    fields: [
      { label: 'First Name', value: submissionData?.basicInfo?.firstName },
      { label: 'Last Name', value: submissionData?.basicInfo?.lastName },
      { label: 'Social Security Number', value: submissionData?.basicInfo?.ssn },
      { label: 'Date of Birth', value: submissionData?.basicInfo?.dateOfBirth },
      { label: 'Occupation', value: submissionData?.basicInfo?.occupation },
      { label: 'Cell Phone', value: submissionData?.basicInfo?.cellPhone },
    ]
  },
  {
    title: 'Spouse Information',
    fields: [
      { label: 'Married/Have spouse', value: submissionData?.basicInfo?.hasSpouse, type: 'boolean' },
      ...(submissionData?.basicInfo?.hasSpouse ? [
        { label: 'Spouse First Name', value: submissionData?.basicInfo?.spouseFirstName },
        { label: 'Spouse Last Name', value: submissionData?.basicInfo?.spouseLastName },
        { label: 'Spouse SSN', value: submissionData?.basicInfo?.spouseSSN },
        { label: 'Spouse Date of Birth', value: submissionData?.basicInfo?.spouseDateOfBirth },
        { label: 'Spouse Occupation', value: submissionData?.basicInfo?.spouseOccupation },
        { label: 'Spouse Cell Phone', value: submissionData?.basicInfo?.spouseCellPhone },
      ] : [])
    ]
  },
  {
    title: 'Filing Status',
    fields: [
      { label: 'Filing Status', value: submissionData?.basicInfo?.filingStatus },
    ]
  },
  {
    title: 'Contact Information',
    fields: [
      { label: 'Street Address', value: submissionData?.basicInfo?.streetAddress },
      { label: 'City', value: submissionData?.basicInfo?.city },
      { label: 'County', value: submissionData?.basicInfo?.county },
      { label: 'State', value: submissionData?.basicInfo?.state },
      { label: 'ZIP Code', value: submissionData?.basicInfo?.zipCode },
      { label: 'Email Address', value: submissionData?.basicInfo?.email },
      { label: 'Home Phone', value: submissionData?.basicInfo?.homePhone },
    ]
  },
  {
    title: 'Additional Information',
    subsections: [
      {
        title: 'Taxpayer',
        fields: [
          { label: 'Blind', value: submissionData?.basicInfo?.taxpayerBlind, type: 'boolean' },
          { label: 'Disabled', value: submissionData?.basicInfo?.taxpayerDisabled, type: 'boolean' },
        ]
      },
      ...(submissionData?.basicInfo?.hasSpouse ? [{
        title: 'Spouse',
        fields: [
          { label: 'Blind', value: submissionData?.basicInfo?.spouseBlind, type: 'boolean' },
          { label: 'Disabled', value: submissionData?.basicInfo?.spouseDisabled, type: 'boolean' },
        ]
      }] : []),
      {
        title: 'Eligible to be claimed as a dependent on another return',
        fields: [
          { label: 'Taxpayer', value: submissionData?.basicInfo?.taxpayerDependentEligible, type: 'boolean' },
          ...(submissionData?.basicInfo?.hasSpouse ? [
            { label: 'Spouse', value: submissionData?.basicInfo?.spouseDependentEligible, type: 'boolean' },
          ] : [])
        ]
      },
      ...(submissionData?.basicInfo?.filingStatus === 'qualifyingWidow' ? [{
        title: 'Date of Spouse\'s Death',
        fields: [
          { label: 'Date of Spouse\'s Death', value: submissionData?.basicInfo?.spouseDeathDate },
        ]
      }] : []),
      {
        title: 'Marital Status Change',
        fields: [
          { label: 'Did your Marital Status change during the current tax year?', value: submissionData?.basicInfo?.maritalStatusChanged, type: 'boolean' },
          ...(submissionData?.basicInfo?.maritalStatusChanged ? [
            { label: 'If yes, please explain', value: submissionData?.basicInfo?.maritalStatusExplanation, type: 'multiline' },
          ] : [])
        ]
      }
    ]
  },
  {
    title: 'Dependents (Children & Others)',
    fields: submissionData?.dependents?.dependents?.length > 0 ? 
      submissionData.dependents.dependents.map((dep, index) => ({
        label: `Dependent #${index + 1}`,
        value: `Name: ${dep.firstName || ''} ${dep.lastName || ''}\nSSN: ${dep.ssn || 'Not provided'}\nRelationship: ${dep.relationship || ''}\nDate of Birth: ${dep.dateOfBirth || ''}\nMonths Lived With You: ${dep.monthsLivedWithYou || 12}\nChild Care Expense: $${dep.childCareExpense || 0}\nFull Time Student: ${dep.isFullTimeStudent ? 'Yes' : 'No'}`,
        type: 'multiline'
      })) : 
      [{ label: 'Dependents', value: 'No dependents added yet' }]
  },
  {
    title: 'Child and Dependent Care Expenses',
    fields: submissionData?.dependents?.careExpenses?.length > 0 ? 
      submissionData.dependents.careExpenses.map((expense, index) => ({
        label: `Care Provider #${index + 1}`,
        value: `Name: ${expense.name || ''}\nAddress: ${expense.address || ''}\nEIN or SSN: ${expense.einOrSsn || ''}\nAmount Paid: $${expense.amountPaid || 0}\nChild: ${expense.child || ''}`,
        type: 'multiline'
      })) : 
      [{ label: 'Care Expenses', value: 'No care expenses added yet' }]
  },
  {
    title: 'General Questions',
    subsections: [
      {
        title: 'Personal Information',
        fields: [
          { label: '1. Did you move your residence more than 50 miles due to a change of employment?', value: submissionData?.generalQuestions?.movedResidence, type: 'boolean' },
          { label: '2. Did you sell your primary residence in the current year?', value: submissionData?.generalQuestions?.soldPrimaryResidence, type: 'boolean' },
        ]
      },
      {
        title: 'Dependent Information',
        fields: [
          { label: '3. Do you have dependents who must file?', value: submissionData?.generalQuestions?.dependentsMustFile, type: 'boolean' },
          { label: '4. Do you have children under age 14 with investment income greater than $1,600?', value: submissionData?.generalQuestions?.childrenUnder14WithInvestment, type: 'boolean' },
          { label: '5. Are any of your dependents not U.S. citizens or residents?', value: submissionData?.generalQuestions?.dependentsNotUSCitizens, type: 'boolean' },
          { label: '6. Did you provide over half the support for any other person during the current year?', value: submissionData?.generalQuestions?.providedOverHalfSupport, type: 'boolean' },
          { label: '7. Did you incur adoption expenses during the current year?', value: submissionData?.generalQuestions?.adoptionExpenses, type: 'boolean' },
        ]
      },
      {
        title: 'Items Related to Income/Losses',
        fields: [
          { label: '8. Did you receive any disability payments in the current year?', value: submissionData?.generalQuestions?.disabilityPayments, type: 'boolean' },
          { label: '9. Did you sell and/or purchase a principal residence in the current year?', value: submissionData?.generalQuestions?.soldPurchasedResidence, type: 'boolean' },
          { label: '10. Did you receive/pay alimony payments?', value: submissionData?.generalQuestions?.alimonyPayments, type: 'boolean' },
        ]
      },
      {
        title: 'Prior Year Tax Returns',
        fields: [
          { label: '11. Were you notified by the Internal Revenue Service or state taxing authority of changes to a prior year\'s return?', value: submissionData?.generalQuestions?.irsNotification, type: 'boolean' },
          ...(submissionData?.generalQuestions?.irsNotification === 'yes' ? [
            { label: 'IRS Notification Details', value: submissionData?.generalQuestions?.irsNotificationDetails, type: 'multiline' }
          ] : []),
          { label: '12. Were there changes to a prior year\'s income, deductions, credits, etc which would require filing an amended return?', value: submissionData?.generalQuestions?.priorYearChanges, type: 'boolean' },
          ...(submissionData?.generalQuestions?.priorYearChanges === 'yes' ? [
            { label: 'Prior Year Changes Details', value: submissionData?.generalQuestions?.priorYearChangesDetails, type: 'multiline' }
          ] : []),
        ]
      },
      {
        title: 'Foreign Bank Accounts and Taxes',
        fields: [
          { label: '13. Did you have foreign income or pay any foreign taxes in the current year?', value: submissionData?.generalQuestions?.foreignIncome, type: 'boolean' },
          { label: '14. At any time during the tax year, did you have an interest in or a signature or other authority over a bank account, or other financial account in a foreign country?', value: submissionData?.generalQuestions?.foreignBankAccount, type: 'boolean' },
          { label: '15. Were you the grantor of or transferor to a foreign trust which existed during the tax year?', value: submissionData?.generalQuestions?.foreignTrust, type: 'boolean' },
        ]
      },
      {
        title: 'Gifts to Trusts or Tuition Plans',
        fields: [
          { label: '16. Did you or your spouse make gifts of over $14,000 to an individual or contribute to a prepaid tuition plan?', value: submissionData?.generalQuestions?.giftsOverLimit, type: 'boolean' },
        ]
      },
      {
        title: 'Electronic Filing and Direct Deposit',
        fields: [
          { label: '17. If your tax return is eligible for Electronic Filing, would you like to file electronically?', value: submissionData?.generalQuestions?.electronicFiling, type: 'boolean' },
          { label: '18. Would you like direct deposit for your refund?', value: submissionData?.generalQuestions?.directDeposit, type: 'boolean' },
          ...(submissionData?.generalQuestions?.directDeposit === 'yes' ? [
            { label: 'Bank Name', value: submissionData?.generalQuestions?.bankName },
            { label: 'Routing Number', value: submissionData?.generalQuestions?.routingNumber },
            { label: 'Account Number', value: submissionData?.generalQuestions?.accountNumber },
            { label: 'Account Type', value: submissionData?.generalQuestions?.accountType },
            { label: 'Voided Check Attached', value: submissionData?.generalQuestions?.voidedCheckAttached, type: 'boolean' },
          ] : []),
        ]
      },
      {
        title: 'Investments/Business',
        fields: [
          { label: '19. Did you buy or sell any stocks or bonds in the current year?', value: submissionData?.generalQuestions?.stocksBonds, type: 'boolean' },
          { label: '20. Did you start a business, purchase a rental property or farm, or acquire interests in partnerships or S corporations?', value: submissionData?.generalQuestions?.startedBusiness, type: 'boolean' },
          { label: '21. At any time during the tax year, did you receive, sell, exchange, or otherwise dispose of any financial interest in any virtual currency?', value: submissionData?.generalQuestions?.virtualCurrency, type: 'boolean' },
          { label: '22. Did you purchase any business equipment or make any capital improvements to business property?', value: submissionData?.generalQuestions?.businessEquipment, type: 'boolean' },
          { label: '23. Did you use part of your home for business purposes or to care for daycare recipients?', value: submissionData?.generalQuestions?.homeOfficeExpenses, type: 'boolean' },
          { label: '24. Did you use a vehicle for business purposes (other than commuting)?', value: submissionData?.generalQuestions?.businessVehicle, type: 'boolean' },
        ]
      },
      {
        title: 'Healthcare and Insurance',
        fields: [
          { label: '25. Did you have qualifying health care coverage for all 12 months of the tax year?', value: submissionData?.generalQuestions?.healthInsurance, type: 'boolean' },
          { label: '26. Did you contribute to a Health Savings Account (HSA)?', value: submissionData?.generalQuestions?.healthSavingsAccount, type: 'boolean' },
          { label: '27. Did you receive advance payments of the premium tax credit?', value: submissionData?.generalQuestions?.premiumTaxCredit, type: 'boolean' },
          { label: '28. Did you pay premiums for long-term care insurance?', value: submissionData?.generalQuestions?.longTermCareInsurance, type: 'boolean' },
        ]
      },
      {
        title: 'Education and Student Loans',
        fields: [
          { label: '29. Did you, your spouse, or dependents attend a post-secondary school during the tax year?', value: submissionData?.generalQuestions?.educationExpenses, type: 'boolean' },
          { label: '30. Did you pay interest on qualified student loans?', value: submissionData?.generalQuestions?.studentLoanInterest, type: 'boolean' },
          { label: '31. Are you eligible for education credits (American Opportunity, Lifetime Learning)?', value: submissionData?.generalQuestions?.educationCredits, type: 'boolean' },
          { label: '32. Did you contribute to or receive distributions from an education savings account (529 plan)?', value: submissionData?.generalQuestions?.educationSavings, type: 'boolean' },
        ]
      },
      {
        title: 'Retirement and Savings',
        fields: [
          { label: '33. Did you make contributions to an IRA for the tax year?', value: submissionData?.generalQuestions?.iraContributions, type: 'boolean' },
          { label: '34. Did you receive any distributions from retirement plans, annuities, or IRAs?', value: submissionData?.generalQuestions?.retirement401k, type: 'boolean' },
          { label: '35. Did you roll over any retirement plan distributions?', value: submissionData?.generalQuestions?.retirementPlanRollover, type: 'boolean' },
          { label: '36. Did you contribute to a SEP-IRA or Simple IRA?', value: submissionData?.generalQuestions?.sepIraContribution, type: 'boolean' },
        ]
      }
    ]
  },
  {
    title: 'Income',
    subsections: [
      {
        title: 'Standard Forms',
        fields: [
          // W-2 Forms
          { label: 'W-2 (Year End Wages statement from Employer)', value: submissionData?.income?.hasW2, type: 'boolean' },
          ...(submissionData?.income?.hasW2 ? [
            { label: 'W-2 Count', value: submissionData?.income?.w2Count }
          ] : []),
          
          // 1099-R Forms
          { label: '1099 R (Distribution from Pension, Annuities, Retirement, or Profit sharing)', value: submissionData?.income?.has1099R, type: 'boolean' },
          ...(submissionData?.income?.has1099R ? [
            { label: '1099-R Count', value: submissionData?.income?.form1099RCount },
            { label: 'Rollover Explanation', value: submissionData?.income?.rolloverExplanation, type: 'multiline' },
            { label: 'Partial Rollover Explanation', value: submissionData?.income?.partialRolloverExplanation, type: 'multiline' }
          ] : []),
          
          // 1098 (Home Mortgage Interest)
          { label: '1098- (Home Mortgage Interest)', value: submissionData?.income?.has1098, type: 'boolean' },
          ...(submissionData?.income?.has1098 ? [
            { label: '1098 Count', value: submissionData?.income?.form1098Count },
            { label: 'Mortgage/Rental List', value: submissionData?.income?.mortgageRentalList, type: 'multiline' }
          ] : []),
          
          // 1098-T
          { label: '1098 T (Education and Tuition Fees)', value: submissionData?.income?.has1098T, type: 'boolean' },
          ...(submissionData?.income?.has1098T ? [
            { label: '1098-T Count', value: submissionData?.income?.form1098TCount },
            { label: 'Financial Institution Name', value: submissionData?.income?.educationInstitution }
          ] : []),
          
          // 1098 (Student loan interest)
          { label: '1098 (Student loan interest)', value: submissionData?.income?.has1098StudentLoan, type: 'boolean' },
          ...(submissionData?.income?.has1098StudentLoan ? [
            { label: 'Student Loan 1098 Count', value: submissionData?.income?.form1098StudentLoanCount }
          ] : []),
          
          // 1099 Misc
          { label: '1099 Misc (Income from contracted work)', value: submissionData?.income?.has1099Misc, type: 'boolean' },
          ...(submissionData?.income?.has1099Misc ? [
            { label: '1099 Misc Count', value: submissionData?.income?.form1099MiscCount }
          ] : []),
          
          // W-2 G
          { label: 'W-2 G (Winnings from Gambling, you must possess the form)', value: submissionData?.income?.hasW2G, type: 'boolean' },
          ...(submissionData?.income?.hasW2G ? [
            { label: 'W-2 G Count', value: submissionData?.income?.w2GCount }
          ] : []),
          
          // SSA/RRB Forms
          { label: 'SSA Forms or RRB Forms (Social Security Benefit forms and Railroad benefits forms)', value: submissionData?.income?.hasSSA, type: 'boolean' },
          ...(submissionData?.income?.hasSSA ? [
            { label: 'SSA/RRB Count', value: submissionData?.income?.ssaCount }
          ] : []),
          
          // 1099 G Forms
          { label: '1099 G Forms (Government payments or Unemployment)', value: submissionData?.income?.has1099G, type: 'boolean' },
          ...(submissionData?.income?.has1099G ? [
            { label: '1099 G Count', value: submissionData?.income?.form1099GCount }
          ] : []),
          
          // 1099 INT
          { label: '1099 INT- (Interest Income)', value: submissionData?.income?.has1099Int, type: 'boolean' },
          ...(submissionData?.income?.has1099Int ? [
            { label: '1099 INT Count', value: submissionData?.income?.form1099IntCount }
          ] : []),
          
          // 1099 DIV
          { label: '1099 DIV (Dividend Income)', value: submissionData?.income?.has1099Div, type: 'boolean' },
          ...(submissionData?.income?.has1099Div ? [
            { label: '1099 DIV Count', value: submissionData?.income?.form1099DivCount }
          ] : []),
          
          // 1099-B
          { label: '1099-B (Stock Sales, Currency Trading, or Other Trading Activities)', value: submissionData?.income?.has1099B, type: 'boolean' },
          ...(submissionData?.income?.has1099B ? [
            { label: '1099-B Count', value: submissionData?.income?.form1099BCount }
          ] : []),
          
          // Crypto Currency
          { label: 'Did you exchange, send, receive, or acquire any virtual or crypto currency?', value: submissionData?.income?.hasCrypto, type: 'boolean' }
        ]
      },
      {
        title: 'Other Income',
        fields: [
          { label: 'Alimony received (Taxpayer)', value: submissionData?.income?.alimonyReceivedTaxpayer ? `$${submissionData?.income?.alimonyReceivedTaxpayer}` : 'None' },
          { label: 'Alimony received (Spouse)', value: submissionData?.income?.alimonyReceivedSpouse ? `$${submissionData?.income?.alimonyReceivedSpouse}` : 'None' },
          { label: 'Jury duty pay (Taxpayer)', value: submissionData?.income?.juryDutyPayTaxpayer ? `$${submissionData?.income?.juryDutyPayTaxpayer}` : 'None' },
          { label: 'Jury duty pay (Spouse)', value: submissionData?.income?.juryDutyPaySpouse ? `$${submissionData?.income?.juryDutyPaySpouse}` : 'None' },
          { label: 'Prizes, Bonuses, Awards (Taxpayer)', value: submissionData?.income?.prizesAndAwardsTaxpayer ? `$${submissionData?.income?.prizesAndAwardsTaxpayer}` : 'None' },
          { label: 'Prizes, Bonuses, Awards (Spouse)', value: submissionData?.income?.prizesAndAwardsSpouse ? `$${submissionData?.income?.prizesAndAwardsSpouse}` : 'None' },
          { label: 'Investment Interest (Taxpayer)', value: submissionData?.income?.investmentInterestTaxpayer ? `$${submissionData?.income?.investmentInterestTaxpayer}` : 'None' },
          { label: 'Investment Interest (Spouse)', value: submissionData?.income?.investmentInterestSpouse ? `$${submissionData?.income?.investmentInterestSpouse}` : 'None' },
          { label: 'Other Income 1 (Taxpayer)', value: submissionData?.income?.otherIncome1Taxpayer ? `$${submissionData?.income?.otherIncome1Taxpayer}` : 'None' },
          { label: 'Other Income 1 (Spouse)', value: submissionData?.income?.otherIncome1Spouse ? `$${submissionData?.income?.otherIncome1Spouse}` : 'None' },
          { label: 'Other Income 2 (Taxpayer)', value: submissionData?.income?.otherIncome2Taxpayer ? `$${submissionData?.income?.otherIncome2Taxpayer}` : 'None' },
          { label: 'Other Income 2 (Spouse)', value: submissionData?.income?.otherIncome2Spouse ? `$${submissionData?.income?.otherIncome2Spouse}` : 'None' },
          { label: 'Other Income 3 (Taxpayer)', value: submissionData?.income?.otherIncome3Taxpayer ? `$${submissionData?.income?.otherIncome3Taxpayer}` : 'None' },
          { label: 'Other Income 3 (Spouse)', value: submissionData?.income?.otherIncome3Spouse ? `$${submissionData?.income?.otherIncome3Spouse}` : 'None' }
        ]
      }
    ]
  },
  {
    title: 'Deductions',
    subsections: [
      {
        title: 'Charitable Contributions',
        fields: [
          { label: 'Attach all copies of your Contribution Statements', value: submissionData?.deductions?.attachContributionStatements, type: 'boolean' },
          { label: 'Miles driven for charitable purposes', value: submissionData?.deductions?.charitableMiles },
          { label: 'Parking fees, tolls, and local transportation', value: submissionData?.deductions?.charitableParkingTolls ? `$${submissionData?.deductions?.charitableParkingTolls}` : 'None' },
          ...(submissionData?.deductions?.charitableOrganizations?.length > 0 ? [{
            label: 'Charitable Organizations',
            value: submissionData.deductions.charitableOrganizations
              .filter(org => org?.name || org?.amount)
              .map((org, index) => `${index + 1}. ${org?.name || 'N/A'} - ${org?.amount ? `$${org.amount}` : 'No amount'}`)
              .join('\n'),
            type: 'multiline'
          }] : [])
        ]
      },
      {
        title: 'Non-Cash Contributions',
        fields: submissionData?.deductions?.nonCashOrganizations?.length > 0 ? 
          submissionData.deductions.nonCashOrganizations
            .filter(org => org?.name || org?.amount)
            .map((org, index) => ({
              label: `Non-Cash Organization ${index + 1}`,
              value: [
                `Name: ${org?.name || 'N/A'}`,
                `Date: ${org?.dateOfContribution || 'N/A'}`,
                `Amount: ${org?.amount ? `$${org.amount}` : 'N/A'}`,
                `Address: ${org?.address || 'N/A'}, ${org?.city || 'N/A'}, ${org?.state || 'N/A'} ${org?.zip || 'N/A'}`,
                `Description: ${org?.description || 'N/A'}`
              ].join('\n'),
              type: 'multiline'
            })) : [{ label: 'No non-cash contributions recorded', value: 'None' }]
      },
      {
        title: 'General Vehicle Information',
        fields: [
          { label: 'Description of vehicle', value: submissionData?.deductions?.vehicleDescription || 'None' },
          { label: 'Date placed in service', value: submissionData?.deductions?.vehicleDatePlacedInService || 'None' },
          { label: 'Total miles for the year', value: submissionData?.deductions?.vehicleTotalMiles || 'None' },
          { label: 'Business miles', value: submissionData?.deductions?.vehicleBusinessMiles || 'None' }
        ]
      }
    ]
  },
  {
    title: 'Tax Payments and Medical Expenses',
    subsections: [
      {
        title: 'Medical and Dental Expenses',
        fields: [
          { label: 'Prescription medications', value: submissionData?.taxPayments?.medicalExpense1 ? `$${submissionData?.taxPayments?.medicalExpense1}` : 'None' },
          { label: 'Health insurance premiums (enter Medicare B on QRG6)', value: submissionData?.taxPayments?.medicalExpense2 ? `$${submissionData?.taxPayments?.medicalExpense2}` : 'None' },
          { label: 'Qualified long-term care premiums', value: submissionData?.taxPayments?.medicalExpense3 ? `$${submissionData?.taxPayments?.medicalExpense3}` : 'None' },
          { label: "Taxpayer's gross long-term care premiums", value: submissionData?.taxPayments?.medicalExpense4 ? `$${submissionData?.taxPayments?.medicalExpense4}` : 'None' },
          { label: "Spouse's gross long-term care premiums", value: submissionData?.taxPayments?.medicalExpense5 ? `$${submissionData?.taxPayments?.medicalExpense5}` : 'None' },
          { label: "Dependent's gross long-term care premiums", value: submissionData?.taxPayments?.medicalExpense6 ? `$${submissionData?.taxPayments?.medicalExpense6}` : 'None' },
          { label: 'Enter self-employed health insurance premiums', value: submissionData?.taxPayments?.medicalExpense7 ? `$${submissionData?.taxPayments?.medicalExpense7}` : 'None' },
          { label: 'Insurance reimbursement', value: submissionData?.taxPayments?.medicalExpense8 ? `$${submissionData?.taxPayments?.medicalExpense8}` : 'None' },
          { label: 'Medical savings account (MSA) distributions', value: submissionData?.taxPayments?.medicalExpense9 ? `$${submissionData?.taxPayments?.medicalExpense9}` : 'None' },
          { label: 'Doctors, dentists, etc', value: submissionData?.taxPayments?.medicalExpense10 ? `$${submissionData?.taxPayments?.medicalExpense10}` : 'None' },
          { label: 'Hospitals, clinics, etc', value: submissionData?.taxPayments?.medicalExpense11 ? `$${submissionData?.taxPayments?.medicalExpense11}` : 'None' },
          { label: 'Lab and X-ray fees', value: submissionData?.taxPayments?.medicalExpense12 ? `$${submissionData?.taxPayments?.medicalExpense12}` : 'None' },
          { label: 'Expenses for qualified long-term care', value: submissionData?.taxPayments?.medicalExpense13 ? `$${submissionData?.taxPayments?.medicalExpense13}` : 'None' },
          { label: 'Eyeglasses and contact lenses', value: submissionData?.taxPayments?.medicalExpense14 ? `$${submissionData?.taxPayments?.medicalExpense14}` : 'None' },
          { label: 'Medical equipment and supplies', value: submissionData?.taxPayments?.medicalExpense15 ? `$${submissionData?.taxPayments?.medicalExpense15}` : 'None' },
          { label: 'Miles driven for medical purposes', value: submissionData?.taxPayments?.medicalExpense16 || 'None' },
          { label: 'Ambulance fees and other medical transportation costs', value: submissionData?.taxPayments?.medicalExpense17 ? `$${submissionData?.taxPayments?.medicalExpense17}` : 'None' },
          { label: 'Lodging', value: submissionData?.taxPayments?.medicalExpense18 ? `$${submissionData?.taxPayments?.medicalExpense18}` : 'None' },
          { label: 'Other medical and dental expenses a.', value: submissionData?.taxPayments?.medicalExpense19 ? `$${submissionData?.taxPayments?.medicalExpense19}` : 'None' },
          { label: 'Other medical and dental expenses b.', value: submissionData?.taxPayments?.medicalExpense20 ? `$${submissionData?.taxPayments?.medicalExpense20}` : 'None' },
          { label: 'Other medical and dental expenses c.', value: submissionData?.taxPayments?.medicalExpense21 ? `$${submissionData?.taxPayments?.medicalExpense21}` : 'None' }
        ]
      },
      {
        title: 'Tax Payments',
        fields: [
          { label: 'Real estate taxes paid on principal residence', value: submissionData?.taxPayments?.taxPayment1 ? `$${submissionData?.taxPayments?.taxPayment1}` : 'None' },
          { label: 'Real estate taxes paid on additional homes or land (Not Rentals)', value: submissionData?.taxPayments?.taxPayment2 ? `$${submissionData?.taxPayments?.taxPayment2}` : 'None' },
          { label: 'Auto registration fees based on the value of the vehicle', value: submissionData?.taxPayments?.taxPayment3 ? `$${submissionData?.taxPayments?.taxPayment3}` : 'None' },
          { label: 'Other personal property taxes', value: submissionData?.taxPayments?.taxPayment4 ? `$${submissionData?.taxPayments?.taxPayment4}` : 'None' },
          { label: 'Other taxes', value: submissionData?.taxPayments?.taxPayment5 ? `$${submissionData?.taxPayments?.taxPayment5}` : 'None' }
        ]
      },
      {
        title: 'Current Year Estimated Tax Payments',
        fields: [
          ...[1, 2, 3, 4, 5, 6, 7].map(index => {
            const quarterNames = [
              'Qtr 1 due by 04/15 of current year',
              'Qtr 2 due by 06/15 of current year', 
              'Qtr 3 due by 09/15 of current year',
              'Qtr 4 due by 01/15 of following year',
              'Additional payments (a)',
              'Additional payments (b)',
              'Prior year overpayment applied to current year'
            ];
            
            const federalDate = submissionData?.taxPayments?.[`federalDate${index}`];
            const federalAmount = submissionData?.taxPayments?.[`federalAmount${index}`];
            const stateDate = submissionData?.taxPayments?.[`stateDate${index}`];
            const stateAmount = submissionData?.taxPayments?.[`stateAmount${index}`];
            const stateId = submissionData?.taxPayments?.[`stateId${index}`];
            const localDate = submissionData?.taxPayments?.[`localDate${index}`];
            const localAmount = submissionData?.taxPayments?.[`localAmount${index}`];
            const localId = submissionData?.taxPayments?.[`localId${index}`];
            
            const hasData = federalDate || federalAmount || stateDate || stateAmount || stateId || localDate || localAmount || localId;
            
            if (!hasData) return null;
            
            return {
              label: quarterNames[index - 1] || `Quarter ${index}`,
              value: [
                federalDate ? `Federal Date: ${federalDate}` : null,
                federalAmount ? `Federal Amount: $${federalAmount}` : null,
                stateDate ? `State Date: ${stateDate}` : null,
                stateAmount ? `State Amount: $${stateAmount}` : null,
                stateId ? `State ID: ${stateId}` : null,
                localDate ? `Local Date: ${localDate}` : null,
                localAmount ? `Local Amount: $${localAmount}` : null,
                localId ? `Local ID: ${localId}` : null
              ].filter(Boolean).join('\n') || 'No data entered',
              type: 'multiline'
            };
          }).filter(Boolean),
          ...(submissionData?.taxPayments && (submissionData.taxPayments.federalDate1 || submissionData.taxPayments.federalAmount1 || submissionData.taxPayments.stateDate1 || submissionData.taxPayments.stateAmount1 || submissionData.taxPayments.localDate1 || submissionData.taxPayments.localAmount1) === undefined ? 
            [{ label: 'No estimated tax payments recorded', value: 'None' }] : [])
        ]
      },
      {
        title: 'Notes and Additional Information',
        fields: (() => {
          const notes = [];
          // Collect all note fields (note1, note2, etc.)
          for (let i = 1; i <= 10; i++) {
            const noteValue = submissionData?.taxPayments?.[`note${i}`];
            if (noteValue && noteValue.trim()) {
              notes.push({ label: `Note ${i}`, value: noteValue, type: 'multiline' });
            }
          }
          return notes.length > 0 ? notes : [{ label: 'Additional Notes', value: 'No additional notes provided' }];
        })()
      },
      {
        title: 'Taxpayer and Spouse Representation',
        fields: [
          { label: 'Taxpayer Signature', value: submissionData?.taxPayments?.taxpayerSignature, type: 'signature' },
          { label: 'Taxpayer Signature Date', value: submissionData?.taxPayments?.taxpayerSignatureDate || 'No date provided' },
          { label: 'Spouse Signature', value: submissionData?.taxPayments?.spouseSignature, type: 'signature' },
          { label: 'Spouse Signature Date', value: submissionData?.taxPayments?.spouseSignatureDate || 'No date provided' }
        ]
      }
    ]
  },
  {
    title: 'Personal Notes',
    fields: [
      { label: 'Tell us More About Yourself and Notes', value: submissionData?.personalNotes || 'No personal notes provided', type: 'multiline' },
      { label: 'Additional Note', value: submissionData?.additionalNote || 'No additional note provided', type: 'multiline' }
    ]
  }
];

const getRentalFormStructure = (submissionData) => [
  {
    title: 'Entity Information',
    fields: [
      { label: 'Property held in personal name', value: submissionData?.entityInfo?.propertyInName, type: 'boolean' },
      ...(submissionData?.entityInfo?.propertyInName ? [] : [
        { label: 'Business Name', value: submissionData?.entityInfo?.businessName },
        { label: 'State date of LLC', value: submissionData?.entityInfo?.stateDateLLC },
        { label: 'Business Address', value: submissionData?.entityInfo?.businessAddress },
        { label: 'City', value: submissionData?.entityInfo?.city },
        { label: 'State', value: submissionData?.entityInfo?.state },
        { label: 'Zip', value: submissionData?.entityInfo?.zip },
        { label: 'County', value: submissionData?.entityInfo?.county },
        { label: 'Employer Identification Number', value: submissionData?.entityInfo?.ein },
      ])
    ]
  },
  {
    title: 'Owner Information',
    fields: submissionData?.ownerInfo?.owners?.length > 0 ?
      submissionData.ownerInfo.owners.map((owner, index) => ({
        label: `Owner #${index + 1}`,
        value: `Name: ${owner.firstName || ''} ${owner.initial || ''} ${owner.lastName || ''}\nSSN: ${owner.ssn || 'Not provided'}\nAddress: ${owner.address || ''}\nCity: ${owner.city || ''}, State: ${owner.state || ''}, Zip: ${owner.zip || ''}\nCounty: ${owner.county || ''}\nWork Phone: ${owner.workPhone || ''}\nEmail: ${owner.email || ''}\nOwnership Percentage: ${owner.ownershipPercentage || '0'}%`,
        type: 'multiline'
      })) :
      [{ label: 'Owners', value: 'None reported' }]
  },
  {
    title: 'Property Information',
    fields: [
      { label: 'Property Address', value: submissionData?.propertyInfo?.propertyAddress },
      { label: 'City', value: submissionData?.propertyInfo?.city },
      { label: 'State', value: submissionData?.propertyInfo?.state },
      { label: 'ZIP', value: submissionData?.propertyInfo?.zip },
      { label: 'Single Family Res', value: submissionData?.propertyInfo?.propertyTypes?.singleFamily, type: 'boolean' },
      { label: 'Multi-Family Res', value: submissionData?.propertyInfo?.propertyTypes?.multiFamily, type: 'boolean' },
      { label: 'Commercial', value: submissionData?.propertyInfo?.propertyTypes?.commercial, type: 'boolean' },
      { label: 'Land', value: submissionData?.propertyInfo?.propertyTypes?.land, type: 'boolean' },
      { label: 'Fair rental days', value: submissionData?.propertyInfo?.fairRentalDays },
      { label: 'Personal use days', value: submissionData?.propertyInfo?.personalUseDays },
      { label: 'New property purchased/converted to rental', value: submissionData?.propertyInfo?.newPropertyPurchased, type: 'boolean' },
    ]
  },
  {
    title: 'Income & Expenses',
    subsections: [
      {
        title: 'Property Income',
        fields: [
          { label: 'Rents received', value: submissionData?.incomeExpenses?.rentsReceived || submissionData?.rentsReceived ? `$${submissionData?.incomeExpenses?.rentsReceived || submissionData?.rentsReceived}` : 'Not provided' },
        ]
      },
      {
        title: 'Expenses',
        fields: [
          { label: 'Advertising', value: submissionData?.incomeExpenses?.advertising || submissionData?.advertising ? `$${submissionData?.incomeExpenses?.advertising || submissionData?.advertising}` : 'Not provided' },
          { label: 'Association dues', value: submissionData?.incomeExpenses?.associationDues || submissionData?.associationDues ? `$${submissionData?.incomeExpenses?.associationDues || submissionData?.associationDues}` : 'Not provided' },
          { label: 'Auto and travel', value: submissionData?.incomeExpenses?.autoAndTravel || submissionData?.autoAndTravel ? `$${submissionData?.incomeExpenses?.autoAndTravel || submissionData?.autoAndTravel}` : 'Not provided' },
          { label: 'Cleaning/Maintenance', value: submissionData?.incomeExpenses?.cleaningMaintenance || submissionData?.cleaningMaintenance ? `$${submissionData?.incomeExpenses?.cleaningMaintenance || submissionData?.cleaningMaintenance}` : 'Not provided' },
          { label: 'Insurance', value: submissionData?.incomeExpenses?.insurance || submissionData?.insurance ? `$${submissionData?.incomeExpenses?.insurance || submissionData?.insurance}` : 'Not provided' },
          { label: 'Professional fees', value: submissionData?.incomeExpenses?.professionalFees || submissionData?.professionalFees ? `$${submissionData?.incomeExpenses?.professionalFees || submissionData?.professionalFees}` : 'Not provided' },
          { label: 'Mortgage interest', value: submissionData?.incomeExpenses?.mortgageInterest || submissionData?.mortgageInterest ? `$${submissionData?.incomeExpenses?.mortgageInterest || submissionData?.mortgageInterest}` : 'Not provided' },
          { label: 'Repairs and Maintenance', value: submissionData?.incomeExpenses?.repairsMaintenance || submissionData?.repairsMaintenance ? `$${submissionData?.incomeExpenses?.repairsMaintenance || submissionData?.repairsMaintenance}` : 'Not provided' },
          { label: 'Taxes', value: submissionData?.incomeExpenses?.taxes || submissionData?.taxes ? `$${submissionData?.incomeExpenses?.taxes || submissionData?.taxes}` : 'Not provided' },
          { label: 'Utilities', value: submissionData?.incomeExpenses?.utilities || submissionData?.utilities ? `$${submissionData?.incomeExpenses?.utilities || submissionData?.utilities}` : 'Not provided' },
        ]
      }
    ]
  },
  {
    title: 'Notes',
    fields: [
      { label: 'Notes', value: submissionData?.notes?.notes || submissionData?.notes || 'No additional notes provided', type: 'multiline' },
    ]
  }
  // {
  //   title: 'Signatures',
  //   fields: [
  //     { label: 'Taxpayer Signature', value: submissionData?.signatures?.taxpayer || submissionData?.taxpayerSignature, type: 'signature' },
  //     { label: 'Taxpayer Date', value: submissionData?.signatures?.taxpayerDate || submissionData?.taxpayerDate || 'Not provided' },
  //     { label: 'Partner Signature', value: submissionData?.signatures?.partner || submissionData?.partnerSignature, type: 'signature' },
  //     { label: 'Partner Date', value: submissionData?.signatures?.partnerDate || submissionData?.partnerDate || 'Not provided' },
  //   ]
  // }
];

const getBusinessFormStructure = (submissionData) => [
  // {
  //   title: 'Contact Information',
  //   fields: [
  //     { label: 'Full Name', value: submissionData?.contactInfo?.fullName },
  //     { label: 'Email Address', value: submissionData?.contactInfo?.email },
  //     { label: 'Phone Number', value: submissionData?.contactInfo?.phone },
  //   ]
  // },
  {
    title: 'Business Information',
    subsections: [
      {
        title: 'Business Name and First Year',
        fields: [
          { label: 'Business Name', value: submissionData?.basicInfo?.businessName },
          { label: 'First year', value: submissionData?.basicInfo?.firstYear },
        ]
      },
      {
        title: 'Start Date',
        fields: [
          { label: 'Start Date of Business', value: submissionData?.basicInfo?.startDate },
        ]
      },
      {
        title: 'Business Description',
        fields: [
          { label: 'Real Estate', value: submissionData?.basicInfo?.businessDescriptions?.realEstate, type: 'boolean' },
          { label: 'E-Commerce', value: submissionData?.basicInfo?.businessDescriptions?.eCommerce, type: 'boolean' },
          { label: 'Stocks', value: submissionData?.basicInfo?.businessDescriptions?.stocks, type: 'boolean' },
          { label: 'Other', value: submissionData?.basicInfo?.businessDescriptions?.other, type: 'boolean' },
          ...(submissionData?.basicInfo?.businessDescriptions?.other ? [
            { label: 'Other Business Description', value: submissionData?.basicInfo?.otherBusinessDescription },
          ] : [])
        ]
      },
      {
        title: 'Business Address',
        fields: [
          { label: 'Business Address', value: submissionData?.basicInfo?.businessAddress },
          { label: 'City', value: submissionData?.basicInfo?.city },
          { label: 'State', value: submissionData?.basicInfo?.state },
          { label: 'Zip', value: submissionData?.basicInfo?.zip },
          { label: 'Country', value: submissionData?.basicInfo?.country },
        ]
      },
      {
        title: 'EIN and Registration',
        fields: [
          { label: 'Employer Identification Number (EIN)', value: submissionData?.basicInfo?.ein },
          { label: 'State Business Registered In', value: submissionData?.basicInfo?.stateRegistered },
        ]
      },
      {
        title: 'Type of Entity',
        fields: [
          { label: 'Corporation', value: submissionData?.basicInfo?.entityTypes?.corporation, type: 'boolean' },
          { label: 'S Corporation', value: submissionData?.basicInfo?.entityTypes?.sCorporation, type: 'boolean' },
          { label: 'Single Member LLC', value: submissionData?.basicInfo?.entityTypes?.singleMemberLLC, type: 'boolean' },
          { label: 'Multi-Member LLC', value: submissionData?.basicInfo?.entityTypes?.multiMemberLLC, type: 'boolean' },
          { label: 'Sole Proprietor', value: submissionData?.basicInfo?.entityTypes?.soleProprietor, type: 'boolean' },
        ]
      }
    ]
  },
  {
    title: 'Owner Information',
    fields: submissionData?.ownerInfo?.owners?.length > 0 ?
      submissionData.ownerInfo.owners.map((owner, index) => ({
        label: `Owner #${index + 1}`,
        value: `Name: ${owner.firstName || ''} ${owner.initial || ''} ${owner.lastName || ''}\nSSN: ${formatValue(owner.ssn, 'secure') || 'Not provided'}\nAddress: ${owner.address || ''}\nCity: ${owner.city || ''}, State: ${owner.state || ''}, Zip: ${owner.zip || ''}\nCountry: ${owner.country || ''}\nWork Telephone: ${owner.workTel || ''}\nOwnership Percentage: ${owner.ownershipPercentage || '0'}%`,
        type: 'multiline'
      })) :
      [{ label: 'Owners', value: 'None reported' }]
  },
  {
    title: 'Income',
    fields: [
      { label: 'Gross receipts or sales', value: submissionData?.incomeExpenses?.grossReceipts },
      { label: 'Returns and allowances', value: submissionData?.incomeExpenses?.returnsAllowances },
      { label: 'Interest income/Trust deed income', value: submissionData?.incomeExpenses?.interestIncome },
      { label: 'Other income From Business', value: submissionData?.incomeExpenses?.otherIncome },
    ]
  },
  {
    title: 'Cost of Goods Sold',
    fields: [
      { label: 'Inventory at beginning of year', value: submissionData?.incomeExpenses?.inventoryBeginning },
      { label: 'Inventory at end of year', value: submissionData?.incomeExpenses?.inventoryEnd },
      { label: 'Purchases', value: submissionData?.incomeExpenses?.purchases },
      { label: 'Cost of items for personal use', value: submissionData?.incomeExpenses?.costPersonalUse },
      { label: 'Contracted Labor', value: submissionData?.incomeExpenses?.contractedLabor },
      { label: 'Materials and supplies', value: submissionData?.incomeExpenses?.materialsSupplies },
      { label: 'Other costs', value: submissionData?.incomeExpenses?.otherCosts },
    ]
  },
  {
    title: 'Business Income and Expenses',
    fields: [
      { label: 'Advertising', value: submissionData?.incomeExpenses?.advertising },
      { label: 'Office Expenses', value: submissionData?.incomeExpenses?.officeExpenses },
      { label: 'Bank Fees', value: submissionData?.incomeExpenses?.bankFees },
      { label: 'Other Interest', value: submissionData?.incomeExpenses?.otherInterest },
      { label: 'Commissions', value: submissionData?.incomeExpenses?.commissions },
      { label: 'Parking & Tolls', value: submissionData?.incomeExpenses?.parkingTolls },
      { label: 'Computer Purchase', value: submissionData?.incomeExpenses?.computerPurchase },
      { label: 'Rent - other business property', value: submissionData?.incomeExpenses?.rentOtherBusiness },
      { label: 'Consulting/Training', value: submissionData?.incomeExpenses?.consultingTraining },
      { label: 'Rent - vehicles machinery & equipment', value: submissionData?.incomeExpenses?.rentVehiclesMachinery },
      { label: 'Dues and Subscriptions', value: submissionData?.incomeExpenses?.duesSubscriptions },
      { label: 'Repairs', value: submissionData?.incomeExpenses?.repairs },
      { label: 'Entity Creation', value: submissionData?.incomeExpenses?.entityCreation },
      { label: 'Shipping/Postage', value: submissionData?.incomeExpenses?.shippingPostage },
      { label: 'Food/Eat Out', value: submissionData?.incomeExpenses?.foodEatOut },
      { label: 'Taxes - real estate', value: submissionData?.incomeExpenses?.taxesRealEstate },
      { label: 'Health Insurance Premiums', value: submissionData?.incomeExpenses?.healthInsurancePremiums },
      { label: 'Taxes - other', value: submissionData?.incomeExpenses?.taxesOther },
      { label: 'Insurance other than health', value: submissionData?.incomeExpenses?.insuranceOtherHealth },
      { label: 'Telephone', value: submissionData?.incomeExpenses?.telephone },
      { label: 'Interest (mortgage, etc.)', value: submissionData?.incomeExpenses?.interestMortgage },
      { label: 'Total meals', value: submissionData?.incomeExpenses?.totalMeals },
      { label: 'Internet', value: submissionData?.incomeExpenses?.internet },
      { label: 'Travel', value: submissionData?.incomeExpenses?.travel },
      { label: 'Legal & Professional', value: submissionData?.incomeExpenses?.legalProfessional },
      { label: 'Utilities', value: submissionData?.incomeExpenses?.utilities },
      { label: 'Licenses', value: submissionData?.incomeExpenses?.licenses },
      { label: 'Wages', value: submissionData?.incomeExpenses?.wages },
      { label: 'Merchant fees', value: submissionData?.incomeExpenses?.merchantFees },
      { label: 'Web Fees', value: submissionData?.incomeExpenses?.webFees },
      { label: 'Wholesale/Drop Shipper fees', value: submissionData?.incomeExpenses?.wholesaleDropShipper },
    ]
  },
  {
    title: 'Vehicle Mileage',
    fields: [
      ...(submissionData?.incomeExpenses?.vehicles?.length > 0 ? 
        submissionData.incomeExpenses.vehicles.map((vehicle, index) => ({
          label: `Vehicle ${index + 1}`,
          value: `Description: ${vehicle.description || 'Not provided'}\nDate placed in service: ${vehicle.datePlacedInService || 'Not provided'}\nTotal miles for the year: ${vehicle.totalMiles || 'Not provided'}\nBusiness miles: ${vehicle.businessMiles || 'Not provided'}`,
          type: 'multiline'
        })) : 
        [{ label: 'Vehicle Information', value: 'No vehicles reported' }]
      )
    ]
  },
  {
    title: 'Other Expenses',
    fields: [
      ...(submissionData?.incomeExpenses?.otherExpenses?.length > 0 ?
        submissionData.incomeExpenses.otherExpenses.filter(expense => expense.description || expense.amount).map((expense, index) => ({
          label: `Other Expense ${index + 1}`,
          value: `${expense.description || 'No description'}: $${expense.amount || '0'}`
        })) :
        [{ label: 'Other Expenses', value: 'No other expenses reported' }]
      )
    ]
  },
  {
    title: 'Business Use of Home',
    fields: [
      { label: 'Has Home Office', value: submissionData?.homeOffice?.hasHomeOffice || submissionData?.assets?.hasHomeOffice, type: 'boolean' },
      ...((submissionData?.homeOffice?.hasHomeOffice || submissionData?.assets?.hasHomeOffice) ? [
        { label: 'Rent', value: (submissionData?.homeOffice?.rent || submissionData?.assets?.rent) ? `$${submissionData?.homeOffice?.rent || submissionData?.assets?.rent}` : 'Not provided' },
        { label: 'Utilities', value: (submissionData?.homeOffice?.utilities || submissionData?.assets?.utilities) ? `$${submissionData?.homeOffice?.utilities || submissionData?.assets?.utilities}` : 'Not provided' },
        { label: 'Insurance', value: (submissionData?.homeOffice?.insurance || submissionData?.assets?.insurance) ? `$${submissionData?.homeOffice?.insurance || submissionData?.assets?.insurance}` : 'Not provided' },
        { label: 'Janitorial', value: (submissionData?.homeOffice?.janitorial || submissionData?.assets?.janitorial) ? `$${submissionData?.homeOffice?.janitorial || submissionData?.assets?.janitorial}` : 'Not provided' },
        { label: 'Miscellaneous', value: (submissionData?.homeOffice?.miscellaneous || submissionData?.assets?.miscellaneous) ? `$${submissionData?.homeOffice?.miscellaneous || submissionData?.assets?.miscellaneous}` : 'Not provided' },
        { label: '% of Exclusive Business use', value: (submissionData?.homeOffice?.exclusiveBusinessUse || submissionData?.assets?.exclusiveBusinessUse) ? `${submissionData?.homeOffice?.exclusiveBusinessUse || submissionData?.assets?.exclusiveBusinessUse}%` : 'Not provided' },
        { label: 'Size of Home', value: (submissionData?.homeOffice?.sizeOfHome || submissionData?.assets?.sizeOfHome) ? `${submissionData?.homeOffice?.sizeOfHome || submissionData?.assets?.sizeOfHome} sq ft` : 'Not provided' },
        { label: 'Size of Home Office', value: (submissionData?.homeOffice?.sizeOfHomeOffice || submissionData?.assets?.sizeOfHomeOffice) ? `${submissionData?.homeOffice?.sizeOfHomeOffice || submissionData?.assets?.sizeOfHomeOffice} sq ft` : 'Not provided' },
        { label: 'Repairs & Maintenance', value: (submissionData?.homeOffice?.repairsMaintenance || submissionData?.assets?.repairsMaintenance) ? `$${submissionData?.homeOffice?.repairsMaintenance || submissionData?.assets?.repairsMaintenance}` : 'Not provided' },
        { label: 'Other Expenses', value: (submissionData?.homeOffice?.otherExpenses || submissionData?.assets?.otherExpenses)?.filter(exp => exp && exp.trim()).join(', ') || 'None' },
      ] : [])
    ]
  },
  {
    title: 'Taxpayer and Partner Representation',
    fields: [
      { label: 'Taxpayer Signature', value: submissionData?.homeOffice?.signatures?.taxpayerSignature || submissionData?.assets?.signatures?.taxpayerSignature, type: 'signature' },
      { label: 'Taxpayer Date', value: submissionData?.homeOffice?.signatures?.taxpayerDate || submissionData?.assets?.signatures?.taxpayerDate || 'Not provided' },
      { label: 'Partner Signature', value: submissionData?.homeOffice?.signatures?.partnerSignature || submissionData?.assets?.signatures?.partnerSignature, type: 'signature' },
      { label: 'Partner Date', value: submissionData?.homeOffice?.signatures?.partnerDate || submissionData?.assets?.signatures?.partnerDate || 'Not provided' },
    ]
  },
  {
    title: 'Additional Notes',
    fields: [
      { label: 'Notes', value: submissionData?.homeOffice?.notes || submissionData?.assets?.notes || 'No additional notes provided', type: 'multiline' },
    ]
  }
];

export const generatePDFFromFormData = (formData, formInfo) => {
  const doc = new jsPDF();
  let yPosition = 30;

  // Add professional header
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, PAGE_WIDTH, 25, 'F');
  
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  const formType = formInfo?.form_type || 'Tax';
  doc.text(`${formType.charAt(0).toUpperCase() + formType.slice(1)} Tax Organizer`, MARGIN, 15);

  // Add form metadata
  yPosition = 35;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  
  const formInfoData = [
    `Form ID: ${formInfo?.id || 'N/A'}`,
    `Status: ${formInfo?.status || 'N/A'}`,
    `Submitted: ${formInfo?.submitted_at ? new Date(formInfo.submitted_at).toLocaleDateString() : 'N/A'}`,
    `Generated: ${new Date().toLocaleDateString()}`
  ];

  formInfoData.forEach(info => {
    doc.text(info, MARGIN, yPosition);
    yPosition += 5;
  });

  // Add separator line
  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, yPosition, PAGE_WIDTH - MARGIN, yPosition);
  yPosition += 10;

  // Get form structure based on type
  let formStructure;
  switch (formInfo?.form_type) {
    case 'personal':
      formStructure = getPersonalFormStructure(formData.submission_data);
      break;
    case 'business':
      formStructure = getBusinessFormStructure(formData.submission_data);
      break;
    case 'rental':
      formStructure = getRentalFormStructure(formData.submission_data);
      break;
    default:
      formStructure = getPersonalFormStructure(formData.submission_data);
  }

  // Process form sections
  formStructure.forEach(section => {
    yPosition = checkPageSpace(doc, yPosition, 25);

    // Section header with background
    doc.setFillColor(248, 249, 250);
    doc.rect(MARGIN - 5, yPosition - 5, PAGE_WIDTH - 2 * MARGIN + 10, 12, 'F');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(section.title, MARGIN, yPosition + 3);
    yPosition += 20;

    // Handle sections with subsections
    if (section.subsections) {
      section.subsections.forEach(subsection => {
        yPosition = checkPageSpace(doc, yPosition, 20);

        // Subsection title
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(30, 30, 30);
        doc.text(subsection.title, MARGIN + 5, yPosition);
        yPosition += 12;

        // Subsection fields
        subsection.fields.forEach(field => {
          yPosition = checkPageSpace(doc, yPosition, 20);

          if (field.type === 'multiline') {
            // Field label - bold style
            yPosition = addFormattedText(doc, field.label + ':', MARGIN + 10, yPosition, {
              fontSize: 10,
              fontStyle: 'bold',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 20,
              color: [60, 60, 60]
            });
            yPosition += 3;

            // Field value - normal style with indentation
            const formattedValue = formatValue(field.value, field.type);
            yPosition = addFormattedText(doc, formattedValue, MARGIN + 15, yPosition, {
              fontSize: 10,
              fontStyle: 'normal',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 25,
              color: [0, 0, 0]
            });
            yPosition += 5;
          } else if (field.type === 'signature') {
            // Field label - bold style
            yPosition = addFormattedText(doc, field.label + ':', MARGIN + 10, yPosition, {
              fontSize: 10,
              fontStyle: 'bold',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 20,
              color: [60, 60, 60]
            });
            yPosition += 3;

            if (field.value && field.value.startsWith('data:image')) {
              try {
                // Add signature image
                yPosition = checkPageSpace(doc, yPosition, 40);
                doc.addImage(field.value, 'PNG', MARGIN + 15, yPosition, 60, 25);
                yPosition += 30;
              } catch (error) {
                console.warn('Failed to add signature image:', error);
                yPosition = addFormattedText(doc, 'Signature provided (image could not be embedded)', MARGIN + 15, yPosition, {
                  fontSize: 10,
                  fontStyle: 'italic',
                  maxWidth: PAGE_WIDTH - 2 * MARGIN - 25,
                  color: [100, 100, 100]
                });
                yPosition += 5;
              }
            } else {
              yPosition = addFormattedText(doc, 'No signature provided', MARGIN + 15, yPosition, {
                fontSize: 10,
                fontStyle: 'italic',
                maxWidth: PAGE_WIDTH - 2 * MARGIN - 25,
                color: [150, 150, 150]
              });
              yPosition += 5;
            }
          } else {
            // Single line - question and answer together
            const formattedValue = formatValue(field.value, field.type);
            const questionText = field.label;
            const answerText = formattedValue;
            
            // Add question
            yPosition = addFormattedText(doc, questionText, MARGIN + 10, yPosition, {
              fontSize: 10,
              fontStyle: 'normal',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 80,
              color: [60, 60, 60]
            });
            
            // Add answer on same or next line if question wrapped
            const questionLines = wrapText(doc, questionText, PAGE_WIDTH - 2 * MARGIN - 80);
            const lastLineY = yPosition - LINE_HEIGHT;
            
            // Check if answer fits on the same line as the last line of question
            doc.setFontSize(10);
            const lastQuestionLine = questionLines[questionLines.length - 1] || '';
            const lastLineWidth = doc.getTextWidth(lastQuestionLine);
            const answerWidth = doc.getTextWidth(': ' + answerText);
            const availableWidth = PAGE_WIDTH - 2 * MARGIN - 20 - lastLineWidth;
            
            if (answerWidth <= availableWidth && questionLines.length === 1) {
              // Answer fits on same line
              doc.setTextColor(0, 0, 0);
              doc.setFont('helvetica', 'normal');
              doc.text(': ' + answerText, MARGIN + 10 + lastLineWidth, lastLineY);
            } else {
              // Answer goes on next line
              yPosition = addFormattedText(doc, ': ' + answerText, MARGIN + 15, yPosition, {
                fontSize: 10,
                fontStyle: 'normal',
                maxWidth: PAGE_WIDTH - 2 * MARGIN - 25,
                color: [0, 0, 0]
              });
            }
            yPosition += 4;
          }
        });

        yPosition += 8; // Spacing between subsections
      });
    } 
    // Handle sections with direct fields
    else if (section.fields) {
      section.fields.forEach(field => {
        yPosition = checkPageSpace(doc, yPosition, 20);

        if (field.type === 'multiline') {
          // Field label - bold style
          yPosition = addFormattedText(doc, field.label + ':', MARGIN, yPosition, {
            fontSize: 10,
            fontStyle: 'bold',
            maxWidth: PAGE_WIDTH - 2 * MARGIN,
            color: [60, 60, 60]
          });
          yPosition += 3;

          // Field value - normal style with indentation
          const formattedValue = formatValue(field.value, field.type);
          yPosition = addFormattedText(doc, formattedValue, MARGIN + 10, yPosition, {
            fontSize: 10,
            fontStyle: 'normal',
            maxWidth: PAGE_WIDTH - 2 * MARGIN - 10,
            color: [0, 0, 0]
          });
          yPosition += 5;
        } else if (field.type === 'signature') {
          // Field label - bold style
          yPosition = addFormattedText(doc, field.label + ':', MARGIN, yPosition, {
            fontSize: 10,
            fontStyle: 'bold',
            maxWidth: PAGE_WIDTH - 2 * MARGIN,
            color: [60, 60, 60]
          });
          yPosition += 3;

          if (field.value && field.value.startsWith('data:image')) {
            try {
              // Add signature image
              yPosition = checkPageSpace(doc, yPosition, 40);
              doc.addImage(field.value, 'PNG', MARGIN + 10, yPosition, 60, 25);
              yPosition += 30;
            } catch (error) {
              console.warn('Failed to add signature image:', error);
              yPosition = addFormattedText(doc, 'Signature provided (image could not be embedded)', MARGIN + 10, yPosition, {
                fontSize: 10,
                fontStyle: 'italic',
                maxWidth: PAGE_WIDTH - 2 * MARGIN - 10,
                color: [100, 100, 100]
              });
              yPosition += 5;
            }
          } else {
            yPosition = addFormattedText(doc, 'No signature provided', MARGIN + 10, yPosition, {
              fontSize: 10,
              fontStyle: 'italic',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 10,
              color: [150, 150, 150]
            });
            yPosition += 5;
          }
        } else {
          // Single line - question and answer together
          const formattedValue = formatValue(field.value, field.type);
          const questionText = field.label;
          const answerText = formattedValue;
          
          // Add question
          yPosition = addFormattedText(doc, questionText, MARGIN, yPosition, {
            fontSize: 10,
            fontStyle: 'normal',
            maxWidth: PAGE_WIDTH - 2 * MARGIN - 60,
            color: [60, 60, 60]
          });
          
          // Add answer on same or next line if question wrapped
          const questionLines = wrapText(doc, questionText, PAGE_WIDTH - 2 * MARGIN - 60);
          const lastLineY = yPosition - LINE_HEIGHT;
          
          // Check if answer fits on the same line as the last line of question
          doc.setFontSize(10);
          const lastQuestionLine = questionLines[questionLines.length - 1] || '';
          const lastLineWidth = doc.getTextWidth(lastQuestionLine);
          const answerWidth = doc.getTextWidth(': ' + answerText);
          const availableWidth = PAGE_WIDTH - 2 * MARGIN - lastLineWidth;
          
          if (answerWidth <= availableWidth && questionLines.length === 1) {
            // Answer fits on same line
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            doc.text(': ' + answerText, MARGIN + lastLineWidth, lastLineY);
          } else {
            // Answer goes on next line
            yPosition = addFormattedText(doc, ': ' + answerText, MARGIN + 10, yPosition, {
              fontSize: 10,
              fontStyle: 'normal',
              maxWidth: PAGE_WIDTH - 2 * MARGIN - 10,
              color: [0, 0, 0]
            });
          }
          yPosition += 4;
        }
      });
    }

    yPosition += SECTION_SPACING;
  });

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, PAGE_HEIGHT - 15, PAGE_WIDTH, 15, 'F');
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Page number
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 5,
      { align: 'right' }
    );
    
    // Company/form identifier
    doc.text(
      'Tax Organizer Form',
      MARGIN,
      PAGE_HEIGHT - 5
    );
  }

  return doc;
};

export const downloadFormAsPDF = (formData, formInfo) => {
  try {
    const doc = generatePDFFromFormData(formData, formInfo);
    const formType = formInfo?.form_type || 'tax';
    const formId = formInfo?.id ? formInfo.id.slice(0, 8) : 'unknown';
    const fileName = `${formType}_tax_organizer_${formId}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};