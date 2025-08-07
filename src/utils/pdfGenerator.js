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
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'Not provided';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
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

// Form structure definitions
const getPersonalFormStructure = (submissionData) => [
  {
    title: 'Basic Information',
    fields: [
      { label: 'First Name', value: submissionData?.basicInfo?.firstName },
      { label: 'Middle Initial', value: submissionData?.basicInfo?.middleInitial },
      { label: 'Last Name', value: submissionData?.basicInfo?.lastName },
      { label: 'Social Security Number', value: submissionData?.basicInfo?.ssn },
      { label: 'Date of Birth', value: submissionData?.basicInfo?.dateOfBirth },
      { label: 'Filing Status', value: submissionData?.basicInfo?.filingStatus },
      { label: 'Phone Number', value: submissionData?.basicInfo?.phoneNumber },
      { label: 'Email Address', value: submissionData?.basicInfo?.emailAddress },
      { label: 'Address', value: submissionData?.basicInfo?.address },
      { label: 'City', value: submissionData?.basicInfo?.city },
      { label: 'State', value: submissionData?.basicInfo?.state },
      { label: 'ZIP Code', value: submissionData?.basicInfo?.zipCode },
    ]
  },
  {
    title: 'Dependents',
    fields: submissionData?.dependents?.length > 0 ? 
      submissionData.dependents.map((dep, index) => ({
        label: `Dependent ${index + 1}`,
        value: `${dep.firstName || ''} ${dep.lastName || ''} - SSN: ${dep.ssn || 'Not provided'} - Relationship: ${dep.relationship || 'Not provided'}`
      })) : 
      [{ label: 'Dependents', value: 'None reported' }]
  },
  {
    title: 'Income Information',
    fields: [
      { label: 'Has W-2 Forms', value: submissionData?.income?.hasW2 },
      { label: 'Has 1099 Forms', value: submissionData?.income?.has1099 },
      { label: 'Has Other Income', value: submissionData?.income?.hasOtherIncome },
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
  },
  {
    title: 'General Questions',
    fields: [
      { label: 'Foreign Bank Account', value: submissionData?.generalQuestions?.foreignBankAccount },
      { label: 'Healthcare Coverage', value: submissionData?.generalQuestions?.healthcareCoverage },
      { label: 'Presidential Election Campaign Fund', value: submissionData?.generalQuestions?.presidentialCampaignFund },
    ]
  }
];

const getBusinessFormStructure = (submissionData) => [
  {
    title: 'Business Information',
    fields: [
      { label: 'Business Name', value: submissionData?.basicInfo?.businessName },
      { label: 'EIN', value: submissionData?.basicInfo?.ein },
      { label: 'Business Type', value: submissionData?.basicInfo?.businessType },
      { label: 'Address', value: submissionData?.basicInfo?.address },
      { label: 'City', value: submissionData?.basicInfo?.city },
      { label: 'State', value: submissionData?.basicInfo?.state },
      { label: 'ZIP Code', value: submissionData?.basicInfo?.zipCode },
      { label: 'Business Started Date', value: submissionData?.basicInfo?.businessStartedDate },
      { label: 'Accounting Method', value: submissionData?.basicInfo?.accountingMethod },
    ]
  },
  {
    title: 'Owner Information',
    fields: submissionData?.ownerInfo?.owners?.length > 0 ?
      submissionData.ownerInfo.owners.map((owner, index) => ({
        label: `Owner ${index + 1}`,
        value: `${owner.firstName || ''} ${owner.lastName || ''} - SSN: ${owner.ssn || 'Not provided'} - Ownership: ${owner.ownershipPercentage || '0'}%`
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
      { label: 'Uses Home for Business', value: submissionData?.homeOffice?.usesHomeForBusiness },
      { label: 'Home Office Square Footage', value: submissionData?.homeOffice?.homeOfficeSquareFootage },
      { label: 'Total Home Square Footage', value: submissionData?.homeOffice?.totalHomeSquareFootage },
      { label: 'Home Office Expenses', value: submissionData?.homeOffice?.homeOfficeExpenses },
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

    // Section content
    section.fields.forEach(field => {
      yPosition = checkPageSpace(doc, yPosition, 20);

      // Field label
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(60, 60, 60);
      doc.text(field.label + ':', MARGIN, yPosition);
      yPosition += LINE_HEIGHT;

      // Field value
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      
      const formattedValue = formatValue(field.value);
      const valueLines = wrapText(doc, formattedValue, PAGE_WIDTH - 2 * MARGIN - 10);
      
      valueLines.forEach(line => {
        yPosition = checkPageSpace(doc, yPosition, LINE_HEIGHT);
        doc.text(line, MARGIN + 10, yPosition);
        yPosition += LINE_HEIGHT;
      });

      yPosition += 3; // Small spacing between fields
    });

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