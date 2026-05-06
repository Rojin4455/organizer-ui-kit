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
    /** When true, step UIs are display-only (e.g. admin view mode). */
    readOnly: boolean;
    steps: {
        id: number;
        title: string;
        description: string;
        icon: React.ElementType;
    }[];
}

export const defaultFormData: EstateFormData = {
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

/** Build flat form state from API step JSON blobs (admin staff endpoint). */
export function staffRecordToFormData(record: {
    step1_personal?: Record<string, unknown> | null;
    step2_heirs_legal?: Record<string, unknown> | null;
    step3_distribution?: Record<string, unknown> | null;
    step4_financials?: Record<string, unknown> | null;
}): EstateFormData {
    const s1 = (record.step1_personal || {}) as Partial<EstateFormData>;
    const s2 = (record.step2_heirs_legal || {}) as Partial<EstateFormData>;
    const s3 = (record.step3_distribution || {}) as Partial<EstateFormData>;
    const s4 = (record.step4_financials || {}) as Partial<EstateFormData>;
    const merged: EstateFormData = {
        ...defaultFormData,
        ...s1,
        ...s2,
        ...s3,
        ...s4,
    };

    const pairStrings = (arr: unknown): string[] => {
        const a = Array.isArray(arr) ? arr.map((x) => (x == null ? '' : String(x))) : [];
        const out = [...a];
        while (out.length < 2) out.push('');
        return out;
    };

    merged.disabilityPOAs = pairStrings(merged.disabilityPOAs);
    merged.medicalPOAs = pairStrings(merged.medicalPOAs);
    merged.successorTrustees = pairStrings(merged.successorTrustees);

    if (!Array.isArray(merged.children)) merged.children = [];
    merged.children = (merged.children as ChildData[]).map((c, i) => ({
        id: c?.id || `child-${i}`,
        sonDaughter: c?.sonDaughter ?? '',
        fullName: c?.fullName ?? '',
        birthdate: c?.birthdate ?? '',
        parents: c?.parents ?? '',
    }));

    if (!Array.isArray(merged.heirs)) merged.heirs = [];
    merged.heirs = (merged.heirs as HeirData[]).map((h, i) => ({
        id: h?.id || `heir-${i}`,
        name: h?.name ?? '',
        relationship: h?.relationship ?? '',
    }));

    if (!Array.isArray(merged.cashAccounts)) merged.cashAccounts = [];
    merged.cashAccounts = (merged.cashAccounts as CashAccount[]).map((c, i) => ({
        id: c?.id || `cash-${i}`,
        bankName: c?.bankName ?? '',
        nameOnAccount: c?.nameOnAccount ?? '',
        accountType: c?.accountType ?? '',
    }));

    if (!Array.isArray(merged.investmentAccounts)) merged.investmentAccounts = [];
    merged.investmentAccounts = (merged.investmentAccounts as InvestmentAccount[]).map((c, i) => ({
        id: c?.id || `inv-${i}`,
        brokerageName: c?.brokerageName ?? '',
        accountType: c?.accountType ?? '',
        owner: c?.owner ?? '',
    }));

    if (!Array.isArray(merged.businessEntities)) merged.businessEntities = [];
    merged.businessEntities = (merged.businessEntities as BusinessEntity[]).map((c, i) => ({
        id: c?.id || `entity-${i}`,
        companyName: c?.companyName ?? '',
        entityType: c?.entityType ?? '',
        percentOwned: c?.percentOwned ?? '',
        specificOwnershipName: c?.specificOwnershipName ?? '',
    }));

    if (!Array.isArray(merged.realProperties)) merged.realProperties = [];
    merged.realProperties = (merged.realProperties as RealProperty[]).map((c, i) => ({
        id: c?.id || `prop-${i}`,
        address: c?.address ?? '',
        propertyType: c?.propertyType ?? '',
        percentOwned: c?.percentOwned ?? '',
        nameOnDeed: c?.nameOnDeed ?? '',
        value: c?.value ?? '',
    }));

    merged.numChildren =
        typeof merged.numChildren === 'number' && !Number.isNaN(merged.numChildren)
            ? merged.numChildren
            : 0;

    return merged;
}

/** Payload for PATCH staff-estate-planning (step buckets only). */
export function packAllStepsForStaffPatch(formData: EstateFormData) {
    return {
        step1_personal: {
            fullName: formData.fullName,
            aliases: formData.aliases,
            rentOrOwn: formData.rentOrOwn,
            streetAddress: formData.streetAddress,
            city: formData.city,
            state: formData.state,
            country: formData.country,
            postalCode: formData.postalCode,
            dateOfBirth: formData.dateOfBirth,
            email: formData.email,
            phone: formData.phone,
            occupation: formData.occupation,
            status: formData.status,
        },
        step2_heirs_legal: {
            spouseFullName: formData.spouseFullName,
            spouseOccupation: formData.spouseOccupation,
            spouseDob: formData.spouseDob,
            spouseAliases: formData.spouseAliases,
            spouseEmail: formData.spouseEmail,
            spousePhone: formData.spousePhone,
            hasChildren: formData.hasChildren,
            numChildren: formData.numChildren,
            children: formData.children,
            guardian1: formData.guardian1,
            guardian2: formData.guardian2,
            guardian3: formData.guardian3,
            heirs: formData.heirs,
            maritalSettlement: formData.maritalSettlement,
            prePostMarriageContract: formData.prePostMarriageContract,
            widowedFiledEstateTax: formData.widowedFiledEstateTax,
            filedGiftTaxReturns: formData.filedGiftTaxReturns,
            completedPreviousTrust: formData.completedPreviousTrust,
            disabilityPOAs: formData.disabilityPOAs,
            medicalPOAs: formData.medicalPOAs,
            successorTrustees: formData.successorTrustees,
        },
        step3_distribution: {
            estateDistributionMethod: formData.estateDistributionMethod,
            customDistributionDescription: formData.customDistributionDescription,
            predeceasedBeneficiaryPlan: formData.predeceasedBeneficiaryPlan,
            additionalInformation: formData.additionalInformation,
        },
        step4_financials: {
            cashAccounts: formData.cashAccounts,
            investmentAccounts: formData.investmentAccounts,
            hasLifeInsurance: formData.hasLifeInsurance,
            lifeInsuranceDetails: formData.lifeInsuranceDetails,
            entityCountRange: formData.entityCountRange,
            businessEntities: formData.businessEntities,
            propertiesCountRange: formData.propertiesCountRange,
            realProperties: formData.realProperties,
        },
    };
}

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
    /** Initialize state (e.g. admin editing an existing submission). */
    initialFormData?: EstateFormData;
    /** Display-only controls (admin review). Defaults to false. */
    readOnly?: boolean;
}> = ({ children, steps, initialFormData, readOnly = false }) => {
    const [formData, setFormData] = useState<EstateFormData>(() =>
        initialFormData ? { ...initialFormData } : { ...defaultFormData }
    );
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
        <EstateFormContext.Provider value={{ formData, updateFormData, currentStep, setCurrentStep, progress, updateProgress, errors, setErrors, clearError, readOnly, steps }}>
            {children}
        </EstateFormContext.Provider>
    );
};
