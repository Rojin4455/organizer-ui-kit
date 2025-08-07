import jsPDF from 'jspdf';

const PAGE_HEIGHT = 297; // A4 height in mm
const PAGE_WIDTH = 210; // A4 width in mm
const MARGIN = 15;
const CELL_HEIGHT = 8;
const ROW_HEIGHT = 10;

// Helper function to add a new page if needed
const checkPageSpace = (doc, yPosition, requiredSpace = 20) => {
  if (yPosition + requiredSpace > PAGE_HEIGHT - MARGIN) {
    doc.addPage();
    return MARGIN + 10; // Reset yPosition for new page
  }
  return yPosition;
};

// Helper function to format values for PDF display
const formatValue = (value, type = 'text') => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (type === 'boolean') {
    return value ? '☑' : '☐';
  }

  if (type === 'secure') {
    return value ? '***-**-****' : '';
  }

  return String(value);
};

// Helper function to draw a bordered table
const drawTable = (doc, x, y, width, height, title = '', fillHeader = true) => {
  // Draw outer border
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(x, y, width, height);
  
  if (title && fillHeader) {
    // Fill header background
    doc.setFillColor(220, 220, 220);
    doc.rect(x, y, width, CELL_HEIGHT, 'F');
    
    // Add title text
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, x + 2, y + 6);
  }
  
  return y + (title ? CELL_HEIGHT : 0);
};

// Helper function to draw table row
const drawTableRow = (doc, x, y, columns, values = [], height = CELL_HEIGHT) => {
  let currentX = x;
  
  // Draw row border
  doc.setLineWidth(0.5);
  doc.setDrawColor(0, 0, 0);
  doc.rect(x, y, columns.reduce((sum, col) => sum + col.width, 0), height);
  
  // Draw column separators and content
  columns.forEach((column, index) => {
    if (index > 0) {
      doc.line(currentX, y, currentX, y + height);
    }
    
    // Add content if provided
    if (values[index] !== undefined) {
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      const text = String(values[index]);
      const maxWidth = column.width - 4;
      const lines = doc.splitTextToSize(text, maxWidth);
      
      let textY = y + 6;
      lines.forEach(line => {
        if (textY < y + height - 2) {
          doc.text(line, currentX + 2, textY);
          textY += 4;
        }
      });
    }
    
    currentX += column.width;
  });
  
  return y + height;
};

// Helper function to add signature image from base64
const addSignatureImage = (doc, base64Data, x, y, width, height) => {
  if (!base64Data) return;
  
  try {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    doc.addImage(base64, 'PNG', x, y, width, height);
  } catch (error) {
    console.error('Error adding signature image:', error);
    // Fallback: draw a placeholder box
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.rect(x, y, width, height);
    doc.setFontSize(8);
    doc.text('Signature', x + 2, y + height/2 + 2);
  }
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
      { label: 'Social Security Number', value: submissionData?.basicInfo?.ssn, type: 'secure' },
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
        { label: 'Spouse SSN', value: submissionData?.basicInfo?.spouseSSN, type: 'secure' },
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
    fields: [
      { label: 'Foreign Bank Account', value: submissionData?.generalQuestions?.foreignBankAccount, type: 'boolean' },
      { label: 'Healthcare Coverage', value: submissionData?.generalQuestions?.healthcareCoverage, type: 'boolean' },
      { label: 'Presidential Election Campaign Fund', value: submissionData?.generalQuestions?.presidentialCampaignFund, type: 'boolean' },
    ]
  },
  {
    title: 'Income',
    fields: [
      { label: 'Has W-2 Forms', value: submissionData?.income?.hasW2, type: 'boolean' },
      { label: 'Has 1099 Forms', value: submissionData?.income?.has1099, type: 'boolean' },
      { label: 'Has Other Income', value: submissionData?.income?.hasOtherIncome, type: 'boolean' },
      { label: 'Unemployment Income', value: submissionData?.income?.unemploymentIncome },
      { label: 'Social Security Income', value: submissionData?.income?.socialSecurityIncome },
      { label: 'Retirement Income', value: submissionData?.income?.retirementIncome },
    ]
  },
  {
    title: 'Deductions',
    fields: [
      { label: 'Medical Expenses', value: submissionData?.deductions?.medicalExpenses },
      { label: 'Charitable Contributions', value: submissionData?.deductions?.charitableContributions },
      { label: 'State and Local Taxes', value: submissionData?.deductions?.stateLocalTaxes },
      { label: 'Mortgage Interest', value: submissionData?.deductions?.mortgageInterest },
      { label: 'Student Loan Interest', value: submissionData?.deductions?.studentLoanInterest },
    ]
  },
  {
    title: 'Tax Payments',
    fields: [
      { label: 'Federal Tax Withheld', value: submissionData?.taxPayments?.federalTaxWithheld },
      { label: 'State Tax Withheld', value: submissionData?.taxPayments?.stateTaxWithheld },
      { label: 'Estimated Tax Payments', value: submissionData?.taxPayments?.estimatedTaxPayments },
    ]
  }
];

const getBusinessFormStructure = (submissionData) => [
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
          { label: 'Employer Identification Number (EIN)', value: submissionData?.basicInfo?.ein, type: 'secure' },
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
        value: `Name: ${owner.firstName || ''} ${owner.middleInitial || ''} ${owner.lastName || ''}\nSSN: ${owner.ssn || 'Not provided'}\nAddress: ${owner.address || ''}\nCity: ${owner.city || ''}, State: ${owner.state || ''}, Zip: ${owner.zip || ''}\nCountry: ${owner.country || ''}\nWork Telephone: ${owner.workTelephone || ''}\nOwnership Percentage: ${owner.ownershipPercentage || '0'}%`,
        type: 'multiline'
      })) :
      [{ label: 'Owners', value: 'None reported' }]
  },
  {
    title: 'Income & Expenses',
    fields: [
      { label: 'Gross Receipts', value: submissionData?.incomeExpenses?.grossReceipts },
      { label: 'Returns and Allowances', value: submissionData?.incomeExpenses?.returnsAllowances },
      { label: 'Cost of Goods Sold', value: submissionData?.incomeExpenses?.costOfGoodsSold },
      { label: 'Advertising', value: submissionData?.incomeExpenses?.advertising },
      { label: 'Car and Truck Expenses', value: submissionData?.incomeExpenses?.carTruckExpenses },
      { label: 'Office Expenses', value: submissionData?.incomeExpenses?.officeExpenses },
      { label: 'Professional Services', value: submissionData?.incomeExpenses?.professionalServices },
      { label: 'Rent', value: submissionData?.incomeExpenses?.rent },
      { label: 'Utilities', value: submissionData?.incomeExpenses?.utilities },
    ]
  },
  {
    title: 'Business Use of Home',
    fields: [
      { label: 'Uses Home for Business', value: submissionData?.assets?.hasHomeOffice, type: 'boolean' },
      ...(submissionData?.assets?.hasHomeOffice ? [
        { label: 'Rent', value: submissionData?.assets?.rent },
        { label: 'Utilities', value: submissionData?.assets?.utilities },
        { label: 'Insurance', value: submissionData?.assets?.insurance },
        { label: 'Janitorial', value: submissionData?.assets?.janitorial },
        { label: 'Miscellaneous', value: submissionData?.assets?.miscellaneous },
        { label: 'Exclusive Business Use', value: submissionData?.assets?.exclusiveBusinessUse, type: 'boolean' },
        { label: 'Size of Home', value: submissionData?.assets?.sizeOfHome },
        { label: 'Size of Home Office', value: submissionData?.assets?.sizeOfHomeOffice },
        { label: 'Repairs & Maintenance', value: submissionData?.assets?.repairsAndMaintenance },
        { label: 'Other Expenses', value: submissionData?.assets?.otherExpenses?.join(', ') || 'None' },
      ] : [])
    ]
  },
  {
    title: 'Taxpayer and Partner Representation',
    fields: [
      { label: 'Taxpayer Signature', value: submissionData?.assets?.signatures?.taxpayer ? 'Signature provided' : 'Not signed' },
      { label: 'Taxpayer Date', value: submissionData?.assets?.signatures?.taxpayerDate },
      { label: 'Partner Signature', value: submissionData?.assets?.signatures?.partner ? 'Signature provided' : 'Not signed' },
      { label: 'Partner Date', value: submissionData?.assets?.signatures?.partnerDate },
    ]
  },
  {
    title: 'Notes',
    fields: [
      { label: 'Notes', value: submissionData?.assets?.notes, type: 'multiline' },
    ]
  }
];

// Generate Personal Tax Form PDF with professional table structure
const generatePersonalTaxFormPDF = (doc, submissionData) => {
  let yPosition = MARGIN + 10;
  const tableWidth = PAGE_WIDTH - 2 * MARGIN;
  
  // Header with Name and SSN fields (like the sample)
  yPosition = checkPageSpace(doc, yPosition, 15);
  const headerColumns = [
    { width: tableWidth * 0.7 },
    { width: tableWidth * 0.3 }
  ];
  yPosition = drawTableRow(doc, MARGIN, yPosition, headerColumns, [
    'Name: ___________________________',
    'Soc. Sec. (last 4 digits)'
  ]);
  
  // BASIC TAXPAYER INFORMATION Section
  yPosition = checkPageSpace(doc, yPosition, 40);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'BASIC TAXPAYER INFORMATION', true);
  
  // Personal Information Table
  yPosition = checkPageSpace(doc, yPosition, 80);
  const personalInfoY = yPosition;
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth * 0.75, 0, 'PERSONAL INFORMATION', true);
  
  // Returning Client checkbox (top right)
  const returningClientY = personalInfoY;
  const returningClientX = MARGIN + tableWidth * 0.75 + 5;
  yPosition = drawTableRow(doc, returningClientX, returningClientY, 
    [{ width: tableWidth * 0.25 - 5 }], 
    [`${formatValue(submissionData?.basicInfo?.returningClient, 'boolean')} Returning Client, No Changes to Personal Information`]);
  
  // Personal info table structure
  const personalColumns = [
    { width: 30 }, // Row labels
    { width: 45 }, // Name
    { width: 35 }, // SSN
    { width: 30 }, // DOB
    { width: 35 }, // Occupation
    { width: 30 }  // Cell Phone
  ];
  
  yPosition = personalInfoY + CELL_HEIGHT;
  yPosition = drawTableRow(doc, MARGIN, yPosition, personalColumns, [
    '', 'Name', 'Social Security No.', 'Date of Birth', 'Occupation', 'Cell Phone'
  ]);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, personalColumns, [
    'Taxpayer',
    `${submissionData?.basicInfo?.firstName || ''} ${submissionData?.basicInfo?.lastName || ''}`,
    formatValue(submissionData?.basicInfo?.ssn, 'secure'),
    submissionData?.basicInfo?.dateOfBirth || '',
    submissionData?.basicInfo?.occupation || '',
    submissionData?.basicInfo?.cellPhone || ''
  ]);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, personalColumns, [
    'Spouse',
    `${submissionData?.basicInfo?.spouseFirstName || ''} ${submissionData?.basicInfo?.spouseLastName || ''}`,
    formatValue(submissionData?.basicInfo?.spouseSSN, 'secure'),
    submissionData?.basicInfo?.spouseDateOfBirth || '',
    submissionData?.basicInfo?.spouseOccupation || '',
    submissionData?.basicInfo?.spouseCellPhone || ''
  ]);
  
  // Address section
  yPosition = checkPageSpace(doc, yPosition, 30);
  const addressColumns = [
    { width: 90 }, // Street Address
    { width: 30 }, // City
    { width: 25 }, // County
    { width: 20 }, // State
    { width: 15 }  // ZIP
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, addressColumns, [
    'Street Address', 'City', 'County', 'State', 'ZIP'
  ]);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, addressColumns, [
    submissionData?.basicInfo?.streetAddress || '',
    submissionData?.basicInfo?.city || '',
    submissionData?.basicInfo?.county || '',
    submissionData?.basicInfo?.state || '',
    submissionData?.basicInfo?.zipCode || ''
  ]);
  
  // Email and Phone
  yPosition = checkPageSpace(doc, yPosition, 15);
  const contactColumns = [
    { width: tableWidth * 0.7 },
    { width: tableWidth * 0.3 }
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, contactColumns, [
    `Email Address: ${submissionData?.basicInfo?.email || ''}`,
    `Home Phone: ${submissionData?.basicInfo?.homePhone || ''}`
  ]);
  
  // Additional Information Section
  yPosition = checkPageSpace(doc, yPosition, 60);
  const additionalInfoColumns = [
    { width: 60 }, // Left section
    { width: 70 }, // Middle section
    { width: 50 }  // Right section
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, additionalInfoColumns, [
    'Taxpayer    Spouse\nBlind    ☐ Yes ☐ No    ☐ Yes ☐ No\nDisabled ☐ Yes ☐ No    ☐ Yes ☐ No',
    'Filing Status\n☐ Single\n☐ Married filing separately\n☐ Qualifying widow(er)',
    '☐ Married filing jointly\n☐ Head of Household'
  ], CELL_HEIGHT * 3);
  
  // DEPENDENTS Section
  yPosition = checkPageSpace(doc, yPosition, 80);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth * 0.75, 0, 'DEPENDENTS (CHILDREN & OTHERS)', true);
  
  // Returning Client checkbox for dependents
  const dependentsReturnY = yPosition - CELL_HEIGHT;
  yPosition = drawTableRow(doc, returningClientX, dependentsReturnY, 
    [{ width: tableWidth * 0.25 - 5 }], 
    ['☐ Returning Client, No Changes to Dependent Information']);
  
  // Dependents table headers
  const dependentColumns = [
    { width: 40 }, // Full Name
    { width: 25 }, // SSN
    { width: 20 }, // Relationship
    { width: 15 }, // Months
    { width: 15 }, // DOB
    { width: 20 }, // Care Expense
    { width: 20 }  // Student
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, dependentColumns, [
    'Full Name\n(First, Last)',
    'Social Security\nNumber',
    'Relationship',
    'Months Lived\nWith You',
    'Date of\nBirth\n/ /',
    'Current Year\nChild Care Expense',
    'Full Time\nStudent\n☐ Yes ☐ No'
  ], CELL_HEIGHT * 2);
  
  // Draw 4 empty dependent rows
  for (let i = 0; i < 4; i++) {
    const dependent = submissionData?.dependents?.dependents?.[i];
    yPosition = drawTableRow(doc, MARGIN, yPosition, dependentColumns, [
      dependent ? `${dependent.firstName || ''} ${dependent.lastName || ''}` : '',
      dependent ? formatValue(dependent.ssn, 'secure') : '',
      dependent?.relationship || '',
      dependent?.monthsLivedWithYou || '',
      dependent?.dateOfBirth ? '/ /' : '/ /',
      dependent?.childCareExpense ? `$${dependent.childCareExpense}` : '',
      dependent ? `${formatValue(dependent.isFullTimeStudent, 'boolean')} Yes ☐ No` : '☐ Yes ☐ No'
    ]);
  }
  
  // CHILD AND DEPENDENT CARE EXPENSES Section
  yPosition = checkPageSpace(doc, yPosition, 60);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'CHILD AND DEPENDENT CARE EXPENSES', true);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, [{ width: tableWidth }], [
    'Enter below the persons or organizations who provided the child and dependent care.'
  ]);
  
  const careColumns = [
    { width: 10 }, // Number
    { width: 40 }, // Name
    { width: 50 }, // Address
    { width: 30 }, // EIN/SSN
    { width: 25 }, // Amount
    { width: 25 }  // Child
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, careColumns, [
    '', 'NAME', 'ADDRESS', 'EIN or Soc.Sec.#', 'AMOUNT PAID', 'CHILD'
  ]);
  
  // Draw 3 care expense rows
  for (let i = 0; i < 3; i++) {
    const expense = submissionData?.dependents?.careExpenses?.[i];
    yPosition = drawTableRow(doc, MARGIN, yPosition, careColumns, [
      `${i + 1}.`,
      expense?.name || '',
      expense?.address || '',
      expense?.einOrSsn || '',
      expense?.amountPaid ? `$${expense.amountPaid}` : '',
      expense?.child || ''
    ]);
  }
  
  // Add signatures if they exist
  if (submissionData?.reviewSubmit?.taxpayerSignature) {
    yPosition = checkPageSpace(doc, yPosition, 40);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Taxpayer Signature:', MARGIN, yPosition);
    
    addSignatureImage(doc, submissionData.reviewSubmit.taxpayerSignature, MARGIN + 40, yPosition - 5, 50, 20);
    
    yPosition += 30;
  }
  
  return yPosition;
};

// Generate Business Tax Form PDF with professional table structure
const generateBusinessTaxFormPDF = (doc, submissionData) => {
  let yPosition = MARGIN + 10;
  const tableWidth = PAGE_WIDTH - 2 * MARGIN;
  
  // Business Information Section
  yPosition = checkPageSpace(doc, yPosition, 40);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'BUSINESS INFORMATION', true);
  
  // Business basic info table
  const businessInfoColumns = [
    { width: tableWidth * 0.6 },
    { width: tableWidth * 0.4 }
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, businessInfoColumns, [
    `Business Name: ${submissionData?.basicInfo?.businessName || ''}`,
    `EIN: ${formatValue(submissionData?.basicInfo?.ein, 'secure')}`
  ]);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, businessInfoColumns, [
    `Start Date: ${submissionData?.basicInfo?.startDate || ''}`,
    `First Year: ${formatValue(submissionData?.basicInfo?.firstYear, 'boolean')} Yes ☐ No`
  ]);
  
  // Business Address
  yPosition = checkPageSpace(doc, yPosition, 30);
  const addressColumns = [
    { width: 70 }, // Address
    { width: 30 }, // City
    { width: 20 }, // State
    { width: 20 }, // Zip
    { width: 40 }  // Country
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, addressColumns, [
    'Business Address', 'City', 'State', 'Zip', 'Country'
  ]);
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, addressColumns, [
    submissionData?.basicInfo?.businessAddress || '',
    submissionData?.basicInfo?.city || '',
    submissionData?.basicInfo?.state || '',
    submissionData?.basicInfo?.zip || '',
    submissionData?.basicInfo?.country || ''
  ]);
  
  // Entity Type Section
  yPosition = checkPageSpace(doc, yPosition, 40);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'TYPE OF ENTITY', true);
  
  const entityTypes = [
    { label: 'Corporation', value: submissionData?.basicInfo?.entityTypes?.corporation },
    { label: 'S Corporation', value: submissionData?.basicInfo?.entityTypes?.sCorporation },
    { label: 'Single Member LLC', value: submissionData?.basicInfo?.entityTypes?.singleMemberLLC },
    { label: 'Multi-Member LLC', value: submissionData?.basicInfo?.entityTypes?.multiMemberLLC },
    { label: 'Sole Proprietor', value: submissionData?.basicInfo?.entityTypes?.soleProprietor }
  ];
  
  const entityColumns = [
    { width: tableWidth * 0.2 },
    { width: tableWidth * 0.2 },
    { width: tableWidth * 0.2 },
    { width: tableWidth * 0.2 },
    { width: tableWidth * 0.2 }
  ];
  
  yPosition = drawTableRow(doc, MARGIN, yPosition, entityColumns, 
    entityTypes.map(type => `${formatValue(type.value, 'boolean')} ${type.label}`)
  );
  
  // Owner Information
  if (submissionData?.ownerInfo?.owners?.length > 0) {
    yPosition = checkPageSpace(doc, yPosition, 60);
    yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'OWNER INFORMATION', true);
    
    const ownerColumns = [
      { width: 50 }, // Name
      { width: 40 }, // SSN
      { width: 60 }, // Address
      { width: 30 }  // Ownership %
    ];
    
    yPosition = drawTableRow(doc, MARGIN, yPosition, ownerColumns, [
      'Owner Name', 'SSN', 'Address', 'Ownership %'
    ]);
    
    submissionData.ownerInfo.owners.forEach(owner => {
      yPosition = drawTableRow(doc, MARGIN, yPosition, ownerColumns, [
        `${owner.firstName || ''} ${owner.middleInitial || ''} ${owner.lastName || ''}`,
        formatValue(owner.ssn, 'secure'),
        `${owner.address || ''}, ${owner.city || ''}, ${owner.state || ''} ${owner.zip || ''}`,
        `${owner.ownershipPercentage || '0'}%`
      ]);
    });
  }
  
  // Income & Expenses Section
  yPosition = checkPageSpace(doc, yPosition, 80);
  yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'INCOME & EXPENSES', true);
  
  const incomeExpenseFields = [
    { label: 'Gross Receipts', value: submissionData?.incomeExpenses?.grossReceipts },
    { label: 'Returns and Allowances', value: submissionData?.incomeExpenses?.returnsAllowances },
    { label: 'Cost of Goods Sold', value: submissionData?.incomeExpenses?.costOfGoodsSold },
    { label: 'Advertising', value: submissionData?.incomeExpenses?.advertising },
    { label: 'Car and Truck Expenses', value: submissionData?.incomeExpenses?.carTruckExpenses },
    { label: 'Office Expenses', value: submissionData?.incomeExpenses?.officeExpenses },
    { label: 'Professional Services', value: submissionData?.incomeExpenses?.professionalServices },
    { label: 'Rent', value: submissionData?.incomeExpenses?.rent },
    { label: 'Utilities', value: submissionData?.incomeExpenses?.utilities }
  ];
  
  const expenseColumns = [
    { width: tableWidth * 0.5 },
    { width: tableWidth * 0.5 }
  ];
  
  for (let i = 0; i < incomeExpenseFields.length; i += 2) {
    const field1 = incomeExpenseFields[i];
    const field2 = incomeExpenseFields[i + 1];
    
    yPosition = drawTableRow(doc, MARGIN, yPosition, expenseColumns, [
      `${field1.label}: ${field1.value || ''}`,
      field2 ? `${field2.label}: ${field2.value || ''}` : ''
    ]);
  }
  
  // Signatures Section
  if (submissionData?.assets?.signatures) {
    yPosition = checkPageSpace(doc, yPosition, 60);
    yPosition = drawTable(doc, MARGIN, yPosition, tableWidth, 0, 'TAXPAYER AND PARTNER REPRESENTATION', true);
    
    const signatureColumns = [
      { width: tableWidth * 0.5 },
      { width: tableWidth * 0.5 }
    ];
    
    yPosition = drawTableRow(doc, MARGIN, yPosition, signatureColumns, [
      'Taxpayer Signature', 'Partner Signature'
    ], CELL_HEIGHT * 3);
    
    // Add signature images if they exist
    if (submissionData.assets.signatures.taxpayer) {
      addSignatureImage(doc, submissionData.assets.signatures.taxpayer, MARGIN + 5, yPosition - 20, 40, 15);
    }
    
    if (submissionData.assets.signatures.partner) {
      addSignatureImage(doc, submissionData.assets.signatures.partner, MARGIN + tableWidth * 0.5 + 5, yPosition - 20, 40, 15);
    }
    
    yPosition = drawTableRow(doc, MARGIN, yPosition, signatureColumns, [
      `Date: ${submissionData.assets.signatures.taxpayerDate || ''}`,
      `Date: ${submissionData.assets.signatures.partnerDate || ''}`
    ]);
  }
  
  return yPosition;
};

export const generatePDFFromFormData = (formData, formInfo) => {
  const doc = new jsPDF();
  let yPosition = MARGIN;
  
  // Add professional header
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, PAGE_WIDTH, 20, 'F');
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  const formType = formInfo?.form_type || 'Tax';
  doc.text(`${formType.charAt(0).toUpperCase() + formType.slice(1)} Tax Organizer`, MARGIN, 15);
  
  // Add form metadata in top right
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Form ID: ${formInfo?.id?.slice(0, 8) || 'N/A'}`, PAGE_WIDTH - MARGIN - 30, 8);
  doc.text(`Status: ${formInfo?.status || 'N/A'}`, PAGE_WIDTH - MARGIN - 30, 13);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, PAGE_WIDTH - MARGIN - 30, 18);
  
  // Generate form based on type
  if (formInfo?.form_type === 'personal') {
    generatePersonalTaxFormPDF(doc, formData.submission_data);
  } else {
    generateBusinessTaxFormPDF(doc, formData.submission_data);
  }
  
  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    
    doc.text(
      `Page ${i} of ${totalPages}`,
      PAGE_WIDTH - MARGIN,
      PAGE_HEIGHT - 5,
      { align: 'right' }
    );
    
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