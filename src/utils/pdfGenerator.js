import jsPDF from 'jspdf';

export const generatePDFFromFormData = (formData) => {
  const doc = new jsPDF();
  let yPosition = 30;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 7;
  const sectionSpacing = 15;

  // Helper function to add a new page if needed
  const checkPageSpace = (requiredSpace = 15) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 30;
      return true; // New page added
    }
    return false;
  };

  // Helper function to wrap text
  const wrapText = (text, maxWidth) => {
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

  // Add professional header
  doc.setFillColor(240, 240, 240);
  doc.rect(0, 0, pageWidth, 25, 'F');
  
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.setTextColor(0, 0, 0);
  const formType = formData.form_type || 'Tax';
  doc.text(`${formType.charAt(0).toUpperCase() + formType.slice(1)} Tax Form`, margin, 15);

  // Add form metadata
  yPosition = 35;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(100, 100, 100);
  
  const formInfo = [
    `Form ID: ${formData.id || 'N/A'}`,
    `Status: ${formData.status || 'N/A'}`,
    `Submitted: ${formData.submitted_at ? new Date(formData.submitted_at).toLocaleDateString() : 'N/A'}`,
    `Generated: ${new Date().toLocaleDateString()}`
  ];

  formInfo.forEach(info => {
    doc.text(info, margin, yPosition);
    yPosition += 5;
  });

  // Add separator line
  yPosition += 5;
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Process form data sections
  if (formData.submission_data) {
    Object.entries(formData.submission_data).forEach(([sectionKey, sectionData]) => {
      if (!sectionData || (typeof sectionData === 'object' && Object.keys(sectionData).length === 0)) {
        return;
      }

      checkPageSpace(25);

      // Section header with background
      doc.setFillColor(248, 249, 250);
      doc.rect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 12, 'F');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      
      const sectionTitle = sectionKey
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .replace(/info/gi, 'Information');
      
      doc.text(sectionTitle, margin, yPosition + 3);
      yPosition += 20;

      // Section content
      if (typeof sectionData === 'object' && sectionData !== null) {
        Object.entries(sectionData).forEach(([field, value]) => {
          checkPageSpace(20);

          // Field label
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.setTextColor(60, 60, 60);
          
          const fieldLabel = field
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
          
          doc.text(fieldLabel + ':', margin, yPosition);
          yPosition += lineHeight;

          // Field value
          doc.setFont(undefined, 'normal');
          doc.setTextColor(0, 0, 0);
          
          const formattedValue = formatValue(value);
          const valueLines = wrapText(formattedValue, pageWidth - 2 * margin - 10);
          
          valueLines.forEach(line => {
            checkPageSpace(lineHeight);
            doc.text(line, margin + 10, yPosition);
            yPosition += lineHeight;
          });

          yPosition += 3; // Small spacing between fields
        });
      }

      yPosition += sectionSpacing;
    });
  }

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Footer background
    doc.setFillColor(248, 249, 250);
    doc.rect(0, pageHeight - 15, pageWidth, 15, 'F');
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(100, 100, 100);
    
    // Page number
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 5,
      { align: 'right' }
    );
    
    // Company/form identifier
    doc.text(
      'Tax Organizer Form',
      margin,
      pageHeight - 5
    );
  }

  return doc;
};

export const downloadFormAsPDF = (formData) => {
  try {
    const doc = generatePDFFromFormData(formData);
    const formType = formData.form_type || 'tax';
    const formId = formData.id ? formData.id.slice(0, 8) : 'unknown';
    const fileName = `${formType}_tax_form_${formId}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};