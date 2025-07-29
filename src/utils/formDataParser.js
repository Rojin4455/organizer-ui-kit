// Utility to parse backend response and convert to form data structure

export const parseFormDataFromResponse = (responseData, formType) => {
  if (!responseData?.sections) {
    return {};
  }

  const formData = {};

  responseData.sections.forEach(section => {
    const sectionData = {};
    
    section.questions.forEach(question => {
      const fieldName = getFieldNameFromQuestion(question.question, section.section_key);
      let value = question.answer;

      // Handle different field types
      switch (question.field_type) {
        case 'json':
          try {
            value = typeof value === 'string' ? JSON.parse(value) : value;
          } catch (e) {
            console.warn('Failed to parse JSON field:', question.question, value);
          }
          break;
        case 'boolean':
          value = Boolean(value);
          break;
        case 'number':
          value = value !== null ? Number(value) : '';
          break;
        case 'date':
          value = value || '';
          break;
        case 'encrypted':
          // Keep encrypted values as-is, they should be handled by backend
          break;
        default:
          value = value || '';
      }

      sectionData[fieldName] = value;
    });

    // Map section keys to form data structure
    const sectionKey = mapSectionKey(section.section_key, formType);
    if (sectionKey) {
      formData[sectionKey] = sectionData;
    }
  });

  return formData;
};

// Map section keys from backend to frontend structure
const mapSectionKey = (backendKey, formType) => {
  const sectionMappings = {
    business: {
      'contactInfo': 'contactInfo',
      'basicInfo': 'basicInfo',
      'ownerInfo': 'ownerInfo',
      'incomeExpenses': 'incomeExpenses',
      'homeOffice': 'homeOffice'
    },
    personal: {
      'basicInfo': 'basicInfo',
      'dependentInfo': 'dependentInfo',
      'incomeInfo': 'incomeInfo',
      'deductionsInfo': 'deductionsInfo',
      'taxPaymentsInfo': 'taxPaymentsInfo',
      'generalQuestions': 'generalQuestions'
    }
  };

  return sectionMappings[formType]?.[backendKey] || backendKey;
};

// Map question text to field names
const getFieldNameFromQuestion = (questionText, sectionKey) => {
  // Business form field mappings
  const businessFieldMappings = {
    contactInfo: {
      'Full Name': 'fullName',
      'Email Address': 'email',
      'Phone Number': 'phone'
    },
    basicInfo: {
      'Business Name': 'businessName',
      'First year in business': 'firstYearInBusiness',
      'Start Date of Business': 'startDate',
      'Business Description': 'businessDescription',
      'Other Business Description (if selected)': 'otherBusinessDescription',
      'Business Address': 'address',
      'City': 'city',
      'State': 'state',
      'Zip Code': 'zipCode',
      'Country': 'country',
      'Employer Identification Number (EIN)': 'ein',
      'State Business Registered In': 'stateRegistered',
      'Type of Entity': 'entityType'
    },
    ownerInfo: {
      'Business Owners Details': 'owners'
    },
    incomeExpenses: {
      'Gross receipts or sales': 'grossReceipts',
      'Returns and allowances': 'returnsAllowances',
      'Interest income/Trust deed income': 'interestIncome',
      'Other income From Business': 'otherIncome',
      'Inventory at beginning of year': 'inventoryBeginning',
      'Inventory at end of year': 'inventoryEnd',
      'Purchases': 'purchases',
      'Cost of items for personal use': 'personalUseCost',
      'Contracted Labor': 'contractedLabor',
      'Materials and supplies': 'materialsSupplies',
      'Other costs': 'otherCosts',
      'Advertising': 'advertising',
      'Office Expenses': 'officeExpenses',
      'Bank Fees': 'bankFees',
      'Other Interest': 'otherInterest',
      'Commissions': 'commissions',
      'Parking & Tolls': 'parkingTolls',
      'Computer Purchase': 'computerPurchase',
      'Rent - other business property': 'rentOtherProperty',
      'Consulting/Training': 'consultingTraining',
      'Rent - vehicles machinery & equipment': 'rentVehiclesMachinery',
      'Dues and Subscriptions': 'duesSubscriptions',
      'Repairs': 'repairs',
      'Entity Creation': 'entityCreation',
      'Shipping/Postage': 'shippingPostage',
      'Food/Eat Out': 'foodEatOut',
      'Taxes - real estate': 'taxesRealEstate',
      'Health Insurance Premiums': 'healthInsurance',
      'Taxes - other': 'taxesOther',
      'Insurance other than health': 'insuranceOther',
      'Telephone': 'telephone',
      'Interest (mortgage, etc.)': 'interestMortgage',
      'Total meals': 'totalMeals',
      'Internet': 'internet',
      'Travel': 'travel',
      'Legal & Professional': 'legalProfessional',
      'Utilities': 'utilities',
      'Licenses': 'licenses',
      'Wages': 'wages',
      'Merchant fees': 'merchantFees',
      'Web Fees': 'webFees',
      'Wholesale/Drop Shipper fees': 'wholesaleDropShipperFees',
      'Vehicle Information': 'vehicles',
      'Other Expenses': 'otherExpenses'
    },
    homeOffice: {
      'Check if you had a home office during the year': 'hasHomeOffice',
      'Rent': 'rent',
      'Utilities': 'utilities',
      'Insurance': 'insurance',
      'Janitorial': 'janitorial',
      'Miscellaneous': 'miscellaneous',
      '% of Exclusive Business use': 'businessUsePercentage',
      'Size of Home': 'homeSize',
      'Size of Home Office': 'homeOfficeSize',
      'Repairs & Maintenance': 'repairsMaintenance',
      'Other Expenses': 'otherExpenses',
      'Taxpayer and Partner Signatures': 'signatures',
      'Additional Notes': 'additionalNotes'
    }
  };

  // Personal form field mappings (add as needed)
  const personalFieldMappings = {
    basicInfo: {
      'Full Name': 'fullName',
      'Social Security Number': 'ssn',
      'Date of Birth': 'dateOfBirth',
      'Filing Status': 'filingStatus',
      'Email Address': 'email',
      'Phone Number': 'phone',
      'Address': 'address',
      'City': 'city',
      'State': 'state',
      'Zip Code': 'zipCode'
    }
    // Add other personal sections as needed
  };

  const mappings = sectionKey === 'contactInfo' || sectionKey === 'basicInfo' || 
                   sectionKey === 'ownerInfo' || sectionKey === 'incomeExpenses' || 
                   sectionKey === 'homeOffice' ? businessFieldMappings : personalFieldMappings;

  return mappings[sectionKey]?.[questionText] || camelCase(questionText);
};

// Convert string to camelCase as fallback
const camelCase = (str) => {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
};
