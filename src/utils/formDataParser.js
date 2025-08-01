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
      'dependents': 'dependents',
      'income': 'income',
      'deductions': 'deductions',
      'taxPayments': 'taxPayments',
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
      'First year in business': 'firstYear',
      'Start Date of Business': 'startDate',
      'Business Description': 'businessDescriptions',
      'Other Business Description (if selected)': 'otherBusinessDescription',
      'Business Address': 'businessAddress',
      'City': 'city',
      'State': 'state',
      'Zip Code': 'zip',
      'Country': 'country',
      'Employer Identification Number (EIN)': 'ein',
      'State Business Registered In': 'stateRegistered',
      'Type of Entity': 'entityTypes'
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

  // Personal form field mappings
  const personalFieldMappings = {
    basicInfo: {
      'Returning Client, No Changes to Personal Information': 'returningClient',
      'First Name': 'firstName',
      'Last Name': 'lastName',
      'Social Security Number': 'ssn',
      'Date of Birth': 'dateOfBirth',
      'Occupation': 'occupation',
      'Cell Phone': 'cellPhone',
      'Married/Have spouse': 'hasSpouse',
      'Spouse First Name': 'spouseFirstName',
      'Spouse Last Name': 'spouseLastName',
      'Spouse SSN': 'spouseSsn',
      'Spouse Date of Birth': 'spouseDateOfBirth',
      'Spouse Occupation': 'spouseOccupation',
      'Spouse Cell Phone': 'spouseCellPhone',
      'Filing Status': 'filingStatus',
      'Street Address': 'streetAddress',
      'City': 'city',
      'County': 'county',
      'State': 'state',
      'ZIP Code': 'zipCode',
      'Email Address': 'email',
      'Home Phone': 'homePhone',
      'Taxpayer - Blind': 'taxpayerBlind',
      'Taxpayer - Disabled': 'taxpayerDisabled',
      'Spouse - Blind': 'spouseBlind',
      'Spouse - Disabled': 'spouseDisabled',
      'Taxpayer eligible to be claimed as dependent': 'taxpayerEligibleDependent',
      'Spouse eligible to be claimed as dependent': 'spouseEligibleDependent',
      'Date of Spouse\'s Death': 'spouseDeathDate',
      'Did your Marital Status change during the current tax year?': 'maritalStatusChange',
      'Marital status change explanation': 'maritalStatusChangeExplanation'
    },
    dependents: {
      'List of Dependents': 'dependents'
    },
    income: {
      'W-2 (Year End Wages statement from Employer)': 'hasW2',
      'W-2 forms - How many?': 'w2Count',
      '1099 R (Distribution from Pension, Annuities, Retirement, or Profit sharing)': 'has1099R',
      '1099-R forms - How many?': 'r1099Count',
      'Rollover explanation': 'rolloverExplanation',
      'Partial rollover explanation': 'partialRolloverExplanation',
      '1098- (Home Mortgage Interest)': 'has1098',
      '1098 forms - How many?': 'mortgage1098Count',
      'List of 1098 or rentals': 'mortgage1098List',
      '1098 T (Education and Tuition Fees)': 'has1098T',
      '1098-T forms - How many?': 'education1098Count',
      'Educational institution name': 'educationalInstitution',
      '1098 (Student loan interest)': 'has1098StudentLoan',
      '1098 Student Loan forms - How many?': 'studentLoan1098Count',
      '1099 Misc (Income from contracted work)': 'has1099Misc',
      '1099-MISC forms - How many?': 'misc1099Count',
      'W-2 G (Winnings from Gambling)': 'hasW2G',
      'W-2G forms - How many?': 'w2gCount',
      'SSA Forms or RRB Forms (Social Security Benefit forms and Railroad benefits forms)': 'hasSSARRB',
      'SSA/RRB forms - How many?': 'ssaRrbCount',
      '1099 G Forms (Government payments or Unemployment)': 'has1099G',
      '1099-G forms - How many?': 'government1099Count',
      '1099 INT- (Interest Income)': 'has1099Int',
      '1099-INT forms - How many?': 'interest1099Count',
      '1099 DIV (Dividend Income)': 'has1099Div',
      '1099-DIV forms - How many?': 'dividend1099Count',
      '1099-B (Stock Sales, Currency Trading, or Other Trading Activities)': 'has1099B',
      '1099-B forms - How many?': 'stock1099Count',
      'Did you exchange, send, receive, or acquire any virtual or crypto currency?': 'hasCryptoCurrency',
      'Alimony received - Taxpayer': 'alimonyReceivedTaxpayer',
      'Alimony received - Spouse': 'alimonyReceivedSpouse',
      'Jury duty pay - Taxpayer': 'juryDutyTaxpayer',
      'Jury duty pay - Spouse': 'juryDutySpouse',
      'Prizes, Bonuses, Awards - Taxpayer': 'prizesTaxpayer',
      'Prizes, Bonuses, Awards - Spouse': 'prizesSpouse',
      'Investment Interest - Taxpayer': 'investmentInterestTaxpayer',
      'Investment Interest - Spouse': 'investmentInterestSpouse',
      'Other Income 1 - Taxpayer': 'otherIncome1Taxpayer',
      'Other Income 1 - Spouse': 'otherIncome1Spouse',
      'Other Income 2 - Taxpayer': 'otherIncome2Taxpayer',
      'Other Income 2 - Spouse': 'otherIncome2Spouse'
    },
    deductions: {
      'Attach all copies of your Contribution Statements': 'attachContributionStatements',
      'Charitable Organizations and Amounts': 'charitableOrganizations',
      'Non-Cash Charitable Contributions': 'nonCashCharitable',
      'Prescription medications': 'prescriptionMedications',
      'Health insurance premiums (enter Medicare B on QRG6)': 'healthInsurancePremiums',
      'Qualified long-term care premiums': 'qualifiedLongTermCarePremiums',
      'Taxpayer\'s gross long-term care premiums': 'taxpayerLongTermCarePremiums',
      'Spouse\'s gross long-term care premiums': 'spouseLongTermCarePremiums',
      'Dependent\'s gross long-term care premiums': 'dependentLongTermCarePremiums',
      'Enter self-employed health insurance premiums': 'selfEmployedHealthInsurance',
      'Insurance reimbursement': 'insuranceReimbursement',
      'Medical savings account (MSA) distributions': 'msaDistributions',
      'Doctors, dentists, etc': 'doctorsDentists',
      'Hospitals, clinics, etc': 'hospitalsClinics',
      'Lab and X-ray fees': 'labXrayFees',
      'Expenses for qualified long-term care': 'longTermCareExpenses',
      'Eyeglasses and contact lenses': 'eyeglassesContacts',
      'Medical equipment and supplies': 'medicalEquipmentSupplies',
      'Miles driven for medical purposes': 'medicalMilesDriven',
      'Ambulance fees and other medical transportation costs': 'ambulanceFees',
      'Lodging': 'lodging',
      'Other medical and dental expenses a.': 'otherMedicalA',
      'Other medical and dental expenses b.': 'otherMedicalB',
      'Other medical and dental expenses c.': 'otherMedicalC'
    },
    taxPayments: {
      'Real estate taxes paid on principal residence': 'realEstateTaxesPrincipal',
      'Real estate taxes paid on additional homes or land (Not Rentals)': 'realEstateTaxesAdditional',
      'Auto registration fees based on the value of the vehicle': 'autoRegistrationFees',
      'Other personal property taxes': 'otherPersonalPropertyTaxes',
      'Other taxes': 'otherTaxes',
      'Estimated Tax Payments': 'estimatedTaxPayments',
      'Federal Tax Withholding': 'federalTaxWithholding',
      'State Tax Withholding': 'stateTaxWithholding',
      'Prior Year Refund Applied to Current Year': 'priorYearRefundApplied',
      'Taxpayer Signature': 'taxpayerSignature',
      'Spouse Signature (if filing jointly)': 'spouseSignature',
      'Signature Date': 'signatureDate'
    },
    generalQuestions: {
      'Did you move your residence more than 50 miles due to a change of employment?': 'movedDueToEmployment',
      'Did you sell your primary residence in the current year?': 'soldPrimaryResidence',
      'Do you have dependents who must file?': 'dependentsMustFile',
      'Do you have children under age 14 with investment income greater than $1,600?': 'childrenWithInvestmentIncome',
      'Are any of your dependents not U.S. citizens or residents?': 'dependentsNotUSCitizens',
      'Do you owe foreign taxes?': 'oweForeignTaxes',
      'Do you have investment interest expenses?': 'investmentInterestExpenses',
      'Did you receive distributions from a partnership, S corporation, estate, or trust?': 'receivedDistributions',
      'Do you own foreign assets totaling more than $50,000?': 'ownForeignAssets',
      'Do you have a foreign bank account?': 'foreignBankAccount',
      'Did you organize an LLC in the current year?': 'organizedLLC',
      'Did you receive unemployment compensation?': 'receivedUnemploymentCompensation',
      'Did you make contributions to a pension plan?': 'pensionPlanContributions',
      'Are you an owner of an S Corporation?': 'ownSCorporation',
      'Did you make IRA contributions?': 'iraContributions',
      'Did you receive Economic Impact Payment or Recovery Rebate Credit?': 'receivedEconomicImpactPayment',
      'Are you an owner of rental properties?': 'ownRentalProperties',
      'Do you want to elect the Presidential Election Campaign Fund?': 'electPresidentialCampaignFund',
      'Does your spouse want to elect the Presidential Election Campaign Fund?': 'spouseElectPresidentialCampaignFund',
      'Did you receive Advanced Child Tax Credit payments?': 'receivedAdvancedChildTaxCredit',
      'Did you have a business loss?': 'businessLoss',
      'Did you have a real estate loss?': 'realEstateLoss',
      'Do you want to claim the Earned Income Tax Credit?': 'claimEarnedIncomeCredit',
      'Do you have a Health Savings Account (HSA)?': 'healthSavingsAccount',
      'Did you pay education expenses?': 'paidEducationExpenses',
      'Do you own a Coverdell Education Savings Account?': 'ownCoverdellAccount',
      'Do you own a 529 Education Savings Plan?': 'own529Plan',
      'Did you pay adoption expenses?': 'paidAdoptionExpenses',
      'Did you pay child or dependent care expenses?': 'paidChildCareExpenses',
      'Did you make energy-efficient home improvements?': 'energyEfficientImprovements',
      'Did you purchase a qualified electric vehicle?': 'purchasedElectricVehicle',
      'Are you a first-time home buyer?': 'firstTimeHomeBuyer',
      'Did you make retirement plan contributions?': 'retirementPlanContributions',
      'Did you pay student loan interest?': 'paidStudentLoanInterest',
      'Are you an eligible educator with classroom expenses?': 'eligibleEducatorExpenses',
      'Did you pay tuition and fees for higher education?': 'paidTuitionFees',
      'Did you have health insurance coverage all year?': 'healthInsuranceCoverageAllYear',
      'Did you receive Premium Tax Credit advance payments?': 'receivedPremiumTaxCredit'
    }
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
