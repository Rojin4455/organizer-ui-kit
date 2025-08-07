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

// Helper function to wrap text
const wrapText = (doc, text, maxWidth) => {
  return doc.splitTextToSize(text, maxWidth);
};

// Helper function to format values for PDF
const formatValue = (value, type = 'text') => {
  if (value === null || value === undefined || value === '') {
    return '_____';
  }

  if (type === 'boolean') {
    return value ? '☑ Yes' : '☐ No';
  }

  if (type === 'secure') {
    return value ? '***-**-****' : '_____';
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
  const formStructure = formInfo?.form_type === 'personal' ? 
    getPersonalFormStructure(formData.submission_data) :
    getBusinessFormStructure(formData.submission_data);

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
          yPosition = checkPageSpace(doc, yPosition, 15);

          // Field label and value on same line for checkboxes and short fields
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(60, 60, 60);
          
          const formattedValue = formatValue(field.value, field.type);
          const fieldText = `${field.label}: ${formattedValue}`;
          const fieldLines = wrapText(doc, fieldText, PAGE_WIDTH - 2 * MARGIN - 20);
          
          fieldLines.forEach(line => {
            yPosition = checkPageSpace(doc, yPosition, LINE_HEIGHT);
            doc.text(line, MARGIN + 10, yPosition);
            yPosition += LINE_HEIGHT;
          });

          yPosition += 2; // Small spacing between fields
        });

        yPosition += 8; // Spacing between subsections
      });
    } 
    // Handle sections with direct fields
    else if (section.fields) {
      section.fields.forEach(field => {
        yPosition = checkPageSpace(doc, yPosition, 20);

        // For multiline fields, show label and value separately
        if (field.type === 'multiline') {
          // Field label
          doc.setFontSize(11);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(60, 60, 60);
          doc.text(field.label + ':', MARGIN, yPosition);
          yPosition += LINE_HEIGHT + 2;

          // Field value
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          
          const formattedValue = formatValue(field.value, field.type);
          const valueLines = wrapText(doc, formattedValue, PAGE_WIDTH - 2 * MARGIN - 10);
          
          valueLines.forEach(line => {
            yPosition = checkPageSpace(doc, yPosition, LINE_HEIGHT);
            doc.text(line, MARGIN + 10, yPosition);
            yPosition += LINE_HEIGHT;
          });

          yPosition += 5; // Extra spacing after multiline fields
        } else {
          // Field label and value on same line for simple fields
          doc.setFontSize(10);
          doc.setFont(undefined, 'normal');
          doc.setTextColor(60, 60, 60);
          
          const formattedValue = formatValue(field.value, field.type);
          const fieldText = `${field.label}: ${formattedValue}`;
          const fieldLines = wrapText(doc, fieldText, PAGE_WIDTH - 2 * MARGIN - 10);
          
          fieldLines.forEach(line => {
            yPosition = checkPageSpace(doc, yPosition, LINE_HEIGHT);
            doc.text(line, MARGIN, yPosition);
            yPosition += LINE_HEIGHT;
          });

          yPosition += 3; // Small spacing between fields
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