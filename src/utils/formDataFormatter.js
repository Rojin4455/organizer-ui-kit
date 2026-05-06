// Utility to format form data with questions and answers for backend processing
// This ensures all questions are included even if unanswered, making it easier
// to generate formatted PDFs and store structured data in the backend

// Personal Tax Form Questions Structure
const personalTaxQuestions = {
  basicInfo: {
    sectionTitle: "Basic Taxpayer Information",
    questions: {
      returningClient: "Returning Client, No Changes to Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      ssn: "Social Security Number",
      dateOfBirth: "Date of Birth",
      occupation: "Occupation",
      cellPhone: "Cell Phone",
      hasSpouse: "Married/Have spouse",
      spouseFirstName: "Spouse First Name",
      spouseLastName: "Spouse Last Name",
      spouseSSN: "Spouse SSN",
      spouseDateOfBirth: "Spouse Date of Birth",
      spouseOccupation: "Spouse Occupation",
      spouseCellPhone: "Spouse Cell Phone",
      filingStatus: "Filing Status",
      streetAddress: "Street Address",
      city: "City",
      county: "County",
      state: "State",
      zipCode: "ZIP Code",
      email: "Email Address",
      homePhone: "Home Phone",
      taxpayerBlind: "Taxpayer - Blind",
      taxpayerDisabled: "Taxpayer - Disabled",
      spouseBlind: "Spouse - Blind",
      spouseDisabled: "Spouse - Disabled",
      taxpayerDependentEligible: "Taxpayer eligible to be claimed as dependent",
      spouseDependentEligible: "Spouse eligible to be claimed as dependent",
      spouseDeathDate: "Date of Spouse's Death",
      maritalStatusChanged: "Did your Marital Status change during the current tax year?",
      maritalStatusExplanation: "Marital status change explanation"
    }
  },
  dependents: {
    sectionTitle: "Dependents Information",
    questions: {
      dependents: "List of Dependents"
    }
  },
  income: {
    sectionTitle: "Income Information",
    questions: {
      hasW2: "W-2 (Year End Wages statement from Employer)",
      w2Count: "W-2 forms - How many?",
      has1099R: "1099 R (Distribution from Pension, Annuities, Retirement, or Profit sharing)",
      form1099RCount: "1099-R forms - How many?",
      rolloverExplanation: "Rollover explanation",
      partialRolloverExplanation: "Partial rollover explanation",
      has1098: "1098- (Home Mortgage Interest)",
      form1098Count: "1098 forms - How many?",
      mortgageRentalList: "List of 1098 or rentals",
      has1098T: "1098 T (Education and Tuition Fees)",
      form1098TCount: "1098-T forms - How many?",
      educationInstitution: "Educational institution name",
      has1098StudentLoan: "1098 (Student loan interest)",
      form1098StudentLoanCount: "1098 Student Loan forms - How many?",
      has1099Misc: "1099 Misc (Income from contracted work)",
      form1099MiscCount: "1099-MISC forms - How many?",
      hasW2G: "W-2 G (Winnings from Gambling)",
      w2GCount: "W-2G forms - How many?",
      hasSSA: "SSA Forms or RRB Forms (Social Security Benefit forms and Railroad benefits forms)",
      ssaCount: "SSA/RRB forms - How many?",
      has1099G: "1099 G Forms (Government payments or Unemployment)",
      form1099GCount: "1099-G forms - How many?",
      has1099Int: "1099 INT- (Interest Income)",
      form1099IntCount: "1099-INT forms - How many?",
      has1099Div: "1099 DIV (Dividend Income)",
      form1099DivCount: "1099-DIV forms - How many?",
      has1099B: "1099-B (Stock Sales, Currency Trading, or Other Trading Activities)",
      form1099BCount: "1099-B forms - How many?",
      hasCrypto: "Did you exchange, send, receive, or acquire any virtual or crypto currency?",
      alimonyReceivedTaxpayer: "Alimony received - Taxpayer",
      alimonyReceivedSpouse: "Alimony received - Spouse",
      juryDutyPayTaxpayer: "Jury duty pay - Taxpayer",
      juryDutyPaySpouse: "Jury duty pay - Spouse",
      prizesAndAwardsTaxpayer: "Prizes, Bonuses, Awards - Taxpayer",
      prizesAndAwardsSpouse: "Prizes, Bonuses, Awards - Spouse",
      investmentInterestTaxpayer: "Investment Interest - Taxpayer",
      investmentInterestSpouse: "Investment Interest - Spouse",
      otherIncome1Taxpayer: "Other Income 1 - Taxpayer",
      otherIncome1Spouse: "Other Income 1 - Spouse",
      otherIncome2Taxpayer: "Other Income 2 - Taxpayer",
      otherIncome2Spouse: "Other Income 2 - Spouse"
    }
  },
  deductions: {
    sectionTitle: "Deductions Information",
    questions: {
      hasCharitableContributions: "Did you make charitable contributions during the tax year?",
      attachContributionStatements: "Attach all copies of your Contribution Statements",
      charitableOrganizations: "Charitable Organizations and Amounts",
      nonCashContributions: "Non-Cash Charitable Contributions",
      medicalExpensesOverThreshold: "Do your total medical expenses exceed 10.5% of your adjusted gross income (AGI)?",
      medicalExpense1: "Prescription medications",
      medicalExpense2: "Health insurance premiums (enter Medicare B on QRG6)",
      medicalExpense3: "Qualified long-term care premiums",
      medicalExpense4: "Taxpayer's gross long-term care premiums",
      medicalExpense5: "Spouse's gross long-term care premiums",
      medicalExpense6: "Dependent's gross long-term care premiums",
      medicalExpense7: "Enter self-employed health insurance premiums",
      medicalExpense8: "Insurance reimbursement",
      medicalExpense9: "Medical savings account (MSA) distributions",
      medicalExpense10: "Doctors, dentists, etc",
      medicalExpense11: "Hospitals, clinics, etc",
      medicalExpense12: "Lab and X-ray fees",
      medicalExpense13: "Expenses for qualified long-term care",
      medicalExpense14: "Eyeglasses and contact lenses",
      medicalExpense15: "Medical equipment and supplies",
      medicalExpense16: "Miles driven for medical purposes",
      medicalExpense17: "Ambulance fees and other medical transportation costs",
      medicalExpense18: "Lodging",
      medicalExpense19: "Other medical and dental expenses a.",
      medicalExpense20: "Other medical and dental expenses b.",
      medicalExpense21: "Other medical and dental expenses c."
    }
  },
  taxPayments: {
    sectionTitle: "Tax Payments Information",
    questions: {
      hasEstimatedTaxPayments: "Did you make estimated IRS/state/local tax payments during the year?",
      taxPayment1: "Real estate taxes paid on principal residence",
      taxPayment2: "Real estate taxes paid on additional homes or land (Not Rentals)",
      taxPayment3: "Auto registration fees based on the value of the vehicle",
      taxPayment4: "Other personal property taxes",
      taxPayment5: "Other taxes",
      estimatedTaxPayments: "Estimated Tax Payments",
      federalWithholding: "Federal Tax Withholding",
      stateWithholding: "State Tax Withholding",
      priorYearRefundApplied: "Prior Year Refund Applied to Current Year",
      taxpayerSignature: "Taxpayer Signature",
      spouseSignature: "Spouse Signature (if filing jointly)",
      signatureDate: "Signature Date"
    }
  },
  generalQuestions: {
    sectionTitle: "General Questions",
    questions: {
      soldPrimaryResidence: "Did you sell your primary residence in the current year?",
      dependentsMustFile: "Do you have dependents who must file?",
      childrenUnder14WithInvestment: "Do you have children under age 14 with investment income greater than $1,600?",
      providedOverHalfSupport: "Did you provide over half the support for any other person during the current year?",
      adoptionExpenses: "Did you pay adoption expenses?",
      disabilityPayments: "Did you receive any disability payments in the current year?",
      irsNotification: "Were you notified by the Internal Revenue Service or state taxing authority of changes to a prior year's return?",
      irsNotificationDetails: "IRS notification details",
      priorYearChanges: "Were there changes to a prior year's income, deductions, credits, etc which would require filing an amended return?",
      priorYearChangesDetails: "Prior year changes details",
      foreignIncome: "Did you have foreign income or pay any foreign taxes in the current year?",
      foreignBankAccount: "At any time during the tax year, did you have an interest in or a signature or other authority over a bank account, or other financial account in a foreign country?",
      foreignTrust: "Were you the grantor of or transferor to a foreign trust which existed during the tax year?",
      giftsOverLimit: "Did you or your spouse make gifts of over $14,000 to an individual or contribute to a prepaid tuition plan?",
      giftRecipient: "Gift recipient",
      giftAmount: "Gift amount",
      electronicFiling: "If your tax return is eligible for Electronic Filing, would you like to file electronically?",
      directDeposit: "If you receive a refund, would you like direct deposit?",
      bankName: "Name of your financial institution",
      routingNumber: "Routing transit number",
      accountNumber: "Account number",
      accountType: "Account type",
      voidedCheckAttached: "Voided check attached"
    }
  }
};

// Business Tax Form Questions Structure
const businessTaxQuestions = {
  contactInfo: {
    sectionTitle: "Contact Information",
    questions: {
      fullName: "Full Name",
      email: "Email Address",
      phone: "Phone Number"
    }
  },
  basicInfo: {
    sectionTitle: "Business Information",
    questions: {
      businessName: "Business Name",
      firstYear: "First year in business",
      startDate: "Start Date of Business",
      businessDescriptionText: "Business Description",
      businessDescriptions: "Business Description",
      otherBusinessDescription: "Other Business Description (if selected)",
      businessAddress: "Business Address",
      city: "City",
      state: "State",
      zip: "Zip Code",
      country: "Country",
      ein: "Employer Identification Number (EIN)",
      stateRegistered: "State Business Registered In",
      entityTypes: "Type of Entity"
    }
  },
  ownerInfo: {
    sectionTitle: "Owner Information",
    questions: {
      owners: "Business Owners Details"
    }
  },
  incomeExpenses: {
    sectionTitle: "Income & Expenses",
    questions: {
      usesQuickbooks: "Do you use QuickBooks?",
      grossReceipts: "Gross receipts or sales",
      returnsAllowances: "Returns and allowances",
      interestIncome: "Interest income/Trust deed income",
      otherIncome: "Other income From Business",
      inventoryBeginning: "Inventory at beginning of year",
      inventoryEnd: "Inventory at end of year",
      purchases: "Purchases",
      costPersonalUse: "Cost of items for personal use",
      contractedLabor: "Contracted Labor",
      materialsSupplies: "Materials and supplies",
      otherCosts: "Other costs",
      advertising: "Advertising",
      officeExpenses: "Office Expenses",
      bankFees: "Bank Fees",
      otherInterest: "Other Interest",
      commissions: "Commissions",
      parkingTolls: "Parking & Tolls",
      computerPurchase: "Computer Purchase",
      rentOtherBusiness: "Rent - other business property",
      consultingTraining: "Consulting/Training",
      rentVehiclesMachinery: "Rent - vehicles machinery & equipment",
      duesSubscriptions: "Dues and Subscriptions",
      repairs: "Repairs",
      entityCreation: "Entity Creation",
      shippingPostage: "Shipping/Postage",
      foodEatOut: "Food/Eat Out",
      taxesRealEstate: "Taxes - real estate",
      healthInsurancePremiums: "Health Insurance Premiums",
      taxesOther: "Taxes - other",
      insuranceOtherHealth: "Insurance other than health",
      telephone: "Telephone",
      interestMortgage: "Interest (mortgage, etc.)",
      totalMeals: "Total meals",
      internet: "Internet",
      travel: "Travel",
      legalProfessional: "Legal & Professional",
      utilities: "Utilities",
      licenses: "Licenses",
      wages: "Wages",
      merchantFees: "Merchant fees",
      webFees: "Web Fees",
      wholesaleDropShipper: "Wholesale/Drop Shipper fees",
      vehicles: "Vehicle Information",
      otherExpenses: "Other Expenses"
    }
  },
  homeOffice: {
    sectionTitle: "Business Use of Home",
    questions: {
      hasHomeOffice: "Check if you had a home office during the year",
      rent: "Rent",
      utilities: "Utilities", 
      insurance: "Insurance",
      janitorial: "Janitorial",
      miscellaneous: "Miscellaneous",
      exclusiveBusinessUse: "% of Exclusive Business use",
      sizeOfHome: "Size of Home",
      sizeOfHomeOffice: "Size of Home Office",
      repairsMaintenance: "Repairs & Maintenance",
      otherExpenses: "Other Expenses",
      signatures: "Taxpayer and Partner Signatures",
      notes: "Additional Notes"
    }
  }
};

// Format data for a specific section
function formatSectionData(sectionData, sectionQuestions) {
  const formattedSection = {
    sectionTitle: sectionQuestions.sectionTitle,
    questionsAndAnswers: {}
  };

  // Go through each question in the section
  Object.keys(sectionQuestions.questions).forEach(fieldKey => {
    const question = sectionQuestions.questions[fieldKey];
    let answer = sectionData[fieldKey];

    // Handle different data types
    if (answer === undefined || answer === null) {
      answer = "";
    } else if (typeof answer === 'boolean') {
      answer = answer ? "Yes" : "No";
    } else if (typeof answer === 'object') {
      // Handle complex objects like arrays, nested objects
      if (Array.isArray(answer)) {
        answer = answer.length > 0 ? JSON.stringify(answer, null, 2) : "";
      } else {
        answer = Object.keys(answer).length > 0 ? JSON.stringify(answer, null, 2) : "";
      }
    } else if (typeof answer === 'string' && answer.trim() === '') {
      answer = "";
    }

    formattedSection.questionsAndAnswers[fieldKey] = {
      question: question,
      answer: answer
    };
  });

  return formattedSection;
}

// Format Personal Tax Form data
export function formatPersonalTaxData(formData) {
  const formattedData = {
    formType: "personal",
    submissionDate: new Date().toISOString(),
    sections: {}
  };

  // Format each section
  Object.keys(personalTaxQuestions).forEach(sectionKey => {
    const sectionData = formData[sectionKey] || {};
    const sectionQuestions = personalTaxQuestions[sectionKey];
    
    formattedData.sections[sectionKey] = formatSectionData(sectionData, sectionQuestions);
  });

  return formattedData;
}

// Format Business Tax Form data
export function formatBusinessTaxData(formData) {
  const formattedData = {
    formType: "business",
    submissionDate: new Date().toISOString(),
    sections: {}
  };

  // Format each section
  Object.keys(businessTaxQuestions).forEach(sectionKey => {
    const sectionData = formData[sectionKey] || {};
    const sectionQuestions = businessTaxQuestions[sectionKey];
    
    formattedData.sections[sectionKey] = formatSectionData(sectionData, sectionQuestions);
  });

  return formattedData;
}

// Export question structures for reference
export { personalTaxQuestions, businessTaxQuestions };