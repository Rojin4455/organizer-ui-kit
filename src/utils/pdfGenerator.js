import jsPDF from 'jspdf';

export const generatePDFFromFormData = (formData) => {
  const doc = new jsPDF();
  let yPosition = 20;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;
  const lineHeight = 7;
  const sectionSpacing = 15;

  // Helper function to add a new page if needed
  const checkPageSpace = (requiredSpace = 10) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Helper function to wrap text
  const wrapText = (text, maxWidth) => {
    return doc.splitTextToSize(text, maxWidth);
  };

  // Helper function to format different answer types
  const formatAnswer = (question) => {
    if (question.answer === null || question.answer === undefined) {
      return 'Not provided';
    }

    switch (question.field_type) {
      case 'boolean':
        return question.answer ? 'Yes' : 'No';
      
      case 'date':
        if (question.answer) {
          try {
            const date = new Date(question.answer);
            return date.toLocaleDateString();
          } catch {
            return question.answer;
          }
        }
        return 'Not provided';
      
      case 'signature':
        return '[Digital Signature Present]';
      
      case 'encrypted':
        // For sensitive data, show placeholder
        return question.is_sensitive ? '[Protected Information]' : question.answer;
      
      case 'json':
        if (Array.isArray(question.answer)) {
          return question.answer.map((item, index) => {
            if (typeof item === 'object') {
              return `Item ${index + 1}: ${Object.entries(item)
                .map(([key, value]) => `${key}: ${value}`)
                .join(', ')}`;
            }
            return `Item ${index + 1}: ${item}`;
          }).join('\n');
        }
        return JSON.stringify(question.answer, null, 2);
      
      case 'number':
        return question.answer.toString();
      
      default:
        return question.answer.toString();
    }
  };

  // Add header
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`${formData.submission_info.form_type} Tax Form`, margin, yPosition);
  yPosition += 10;

  // Add form info
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Form ID: ${formData.submission_info.id}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Status: ${formData.submission_info.status}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Submission Date: ${new Date(formData.submission_info.submission_date).toLocaleDateString()}`, margin, yPosition);
  yPosition += lineHeight;
  doc.text(`Created: ${new Date(formData.submission_info.created_at).toLocaleDateString()}`, margin, yPosition);
  yPosition += sectionSpacing;

  // Add a line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Process each section
  formData.sections.forEach((section, sectionIndex) => {
    checkPageSpace(20);

    // Section header
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(section.title, margin, yPosition);
    yPosition += 10;

    // Section questions
    section.questions.forEach((question, questionIndex) => {
      checkPageSpace(25);

      // Question text
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      const questionLines = wrapText(`Q${questionIndex + 1}: ${question.question}`, pageWidth - 2 * margin);
      questionLines.forEach(line => {
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });

      // Answer text
      doc.setFont(undefined, 'normal');
      const answerText = formatAnswer(question);
      const answerLines = wrapText(`A: ${answerText}`, pageWidth - 2 * margin - 10);
      answerLines.forEach(line => {
        doc.text(line, margin + 10, yPosition);
        yPosition += lineHeight;
      });

      yPosition += 3; // Small space between Q&A pairs
    });

    yPosition += sectionSpacing;
  });

  // Add dependents section if available
  if (formData.dependents && formData.dependents.length > 0) {
    checkPageSpace(20);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Dependents Summary', margin, yPosition);
    yPosition += 10;

    formData.dependents.forEach((dependent, index) => {
      checkPageSpace(20);

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Dependent ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;

      doc.setFont(undefined, 'normal');
      doc.text(`Name: ${dependent.name}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Relationship: ${dependent.relationship}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Date of Birth: ${new Date(dependent.date_of_birth).toLocaleDateString()}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Months Lived: ${dependent.months_lived}`, margin + 10, yPosition);
      yPosition += lineHeight;
      doc.text(`Full-time Student: ${dependent.is_student ? 'Yes' : 'No'}`, margin + 10, yPosition);
      yPosition += lineHeight;
      if (dependent.care_expense) {
        doc.text(`Care Expense: $${dependent.care_expense}`, margin + 10, yPosition);
        yPosition += lineHeight;
      }

      yPosition += 5;
    });
  }

  // Add business owners section if available
  if (formData.business_owners && formData.business_owners.length > 0) {
    checkPageSpace(20);

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Business Owners Summary', margin, yPosition);
    yPosition += 10;

    formData.business_owners.forEach((owner, index) => {
      checkPageSpace(15);

      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text(`Owner ${index + 1}:`, margin, yPosition);
      yPosition += lineHeight;

      doc.setFont(undefined, 'normal');
      Object.entries(owner).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
          doc.text(`${formattedKey}: ${value}`, margin + 10, yPosition);
          yPosition += lineHeight;
        }
      });

      yPosition += 5;
    });
  }

  // Add footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(
      `Page ${i} of ${totalPages} - Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadFormAsPDF = (formData) => {
  try {
    const doc = generatePDFFromFormData(formData);
    const fileName = `${formData.submission_info.form_type}_Tax_Form_${formData.submission_info.id.slice(0, 8)}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};