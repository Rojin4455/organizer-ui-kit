import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ChildData {
    id: string;
    sonDaughter: string;
    fullName: string;
    birthdate: string;
    parents: string;
}

export interface HeirData {
    id: string;
    name: string;
    relationship: string;
}

export interface CashAccount {
    id: string;
    bankName: string;
    nameOnAccount: string;
    accountType: string;
}

export interface InvestmentAccount {
    id: string;
    brokerageName: string;
    accountType: string;
    owner: string;
}

export interface BusinessEntity {
    id: string;
    companyName: string;
    entityType: string;
    percentOwned: string;
    specificOwnershipName: string;
}

export interface RealProperty {
    id: string;
    address: string;
    propertyType: string;
    percentOwned: string;
    nameOnDeed: string;
    value: string;
}

export interface EstateFormData {
    // Step 1: Personal
    fullName: string;
    aliases: string;
    rentOrOwn: string;
    streetAddress: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    dateOfBirth: string;
    email: string;
    phone: string;
    occupation: string;
    status: string;

    // Step 2: Spouse (Conditional)
    spouseFullName: string;
    spouseOccupation: string;
    spouseDob: string;
    spouseAliases: string;
    spouseEmail: string;
    spousePhone: string;

    // Step 2A: Children & Guardians
    hasChildren: string;
    numChildren: number;
    children: ChildData[];
    guardian1: string;
    guardian2: string;
    guardian3: string;

    // Step 2B: Other Heirs
    heirs: HeirData[];

    // Step 2C: General Legal Questions
    maritalSettlement: string; // 'Yes' | 'No' | ''
    prePostMarriageContract: string; 
    widowedFiledEstateTax: string;
    filedGiftTaxReturns: string;
    completedPreviousTrust: string;

    // Step 2D: Fiduciaries (POAs and Trustees)
    disabilityPOAs: string[];
    medicalPOAs: string[];
    successorTrustees: string[];

    // Step 3: Trust Distribution
    estateDistributionMethod: string;
    customDistributionDescription: string;
    predeceasedBeneficiaryPlan: string;
    additionalInformation: string;

    // Step 4: Financial, Business & Real Property
    cashAccounts: CashAccount[];
    investmentAccounts: InvestmentAccount[];
    hasLifeInsurance: string;
    lifeInsuranceDetails: string;
    entityCountRange: string;
    businessEntities: BusinessEntity[];
    propertiesCountRange: string;
    realProperties: RealProperty[];
}

interface EstateFormContextType {
    formData: EstateFormData;
    updateFormData: (data: Partial<EstateFormData>) => void;
    currentStep: number;
    setCurrentStep: (step: number) => void;
    progress: number;
    updateProgress: (progress: number) => void;
    errors: Record<string, string>;
    setErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    clearError: (field: string) => void;
    steps: {
        id: number;
        title: string;
        description: string;
        icon: React.ElementType;
    }[];
}

const defaultFormData: EstateFormData = {
    fullName: '',
    aliases: '',
    rentOrOwn: '',
    streetAddress: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    occupation: '',
    status: '',
    
    spouseFullName: '',
    spouseOccupation: '',
    spouseDob: '',
    spouseAliases: '',
    spouseEmail: '',
    spousePhone: '',
    
    hasChildren: '',
    numChildren: 0,
    children: [],
    guardian1: '',
    guardian2: '',
    guardian3: '',

    heirs: [],

    maritalSettlement: '',
    prePostMarriageContract: '',
    widowedFiledEstateTax: '',
    filedGiftTaxReturns: '',
    completedPreviousTrust: '',

    disabilityPOAs: ['', ''],
    medicalPOAs: ['', ''],
    successorTrustees: ['', ''],

    estateDistributionMethod: '',
    customDistributionDescription: '',
    predeceasedBeneficiaryPlan: '',
    additionalInformation: '',

    cashAccounts: [],
    investmentAccounts: [],
    hasLifeInsurance: '',
    lifeInsuranceDetails: '',
    entityCountRange: '',
    businessEntities: [],
    propertiesCountRange: '',
    realProperties: [],
};

const EstateFormContext = createContext<EstateFormContextType | undefined>(undefined);

export const useEstateForm = () => {
    const context = useContext(EstateFormContext);
    if (!context) {
        throw new Error('useEstateForm must be used within a EstateFormProvider');
    }
    return context;
};

export const EstateFormProvider: React.FC<{
    children: ReactNode;
    steps: { id: number; title: string; description: string; icon: React.ElementType }[];
}> = ({ children, steps }) => {
    const [formData, setFormData] = useState<EstateFormData>(defaultFormData);
    const [currentStep, setCurrentStep] = useState(1);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const updateFormData = (data: Partial<EstateFormData>) => {
        setFormData((prev) => ({ ...prev, ...data }));
    };

    const updateProgress = (newProgress: number) => {
        setProgress(newProgress);
    };

    const clearError = (field: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[field];
            return newErrors;
        });
    };

    return (
        <EstateFormContext.Provider value={{ formData, updateFormData, currentStep, setCurrentStep, progress, updateProgress, errors, setErrors, clearError, steps }}>
            {children}
        </EstateFormContext.Provider>
    );
};
