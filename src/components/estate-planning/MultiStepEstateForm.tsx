import React from 'react';
import { useEstateForm } from '../../contexts/EstateFormContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

import SidebarSteps from './SidebarSteps';
import Step1Personal from './Step1Personal';
import Step2Heirs from './Step2Heirs';
import Step3TrustDistribution from './Step3TrustDistribution';
import Step4Financials from './Step4Financials';

const MultiStepEstateForm: React.FC = () => {
    const { formData, currentStep, setCurrentStep, steps, setErrors } = useEstateForm();
    const { toast } = useToast();

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return <Step1Personal />;
            case 2:
                return <Step2Heirs />;
            case 3:
                return <Step3TrustDistribution />;
            case 4:
                return <Step4Financials />;
            case 5:
                return (
                    <div className="space-y-6 flex flex-col items-center justify-center min-h-[400px] text-center max-w-2xl mx-auto px-4">
                        <h2 className="text-2xl font-semibold tracking-tight text-primary">FINAL CONSIDERATIONS PRIOR TO CONSULTATION</h2>
                        <div className="space-y-4 text-muted-foreground text-base leading-relaxed">
                            <p>
                                Thank you for completing this Wealth Protection and Estate Planning Questionnaire. 
                                Once we receive the completed questionnaire back into our office, we will begin reviewing the information and beginning the process of designing and drafting your estate plan.
                            </p>
                            <p>
                                A member of our team will be in contact if we have any follow-up questions.
                            </p>
                        </div>
                    </div>
                );
            default:
                return <Step1Personal />;
        }
    };

    const validateCurrentStep = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (currentStep === 1) {
            if (!formData.fullName) newErrors.fullName = "Full Name is required";
            if (!formData.streetAddress) newErrors.streetAddress = "Street Address is required";
            if (!formData.city) newErrors.city = "City is required";
            if (!formData.state) newErrors.state = "State is required";
            if (!formData.postalCode) newErrors.postalCode = "Postal Code is required";
            if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required";
            if (!formData.email) newErrors.email = "Email is required";
            if (!formData.phone) newErrors.phone = "Phone is required";
            if (!formData.status) newErrors.status = "Status is required";
            if (!formData.rentOrOwn) newErrors.rentOrOwn = "Please select an option";
            if (!formData.country) newErrors.country = "Country is required";
        } else if (currentStep === 2) {
            if (formData.status === 'Married' || formData.status === 'Partner') {
                if (!formData.spouseDob) newErrors.spouseDob = "Spouse Date of Birth is required";
            }
            if (!formData.hasChildren) newErrors.hasChildren = "Please indicate if you have children";
            
            if (formData.hasChildren === 'Yes' && formData.children.length > 0) {
                formData.children.forEach((c, idx) => {
                    if (!c.sonDaughter) newErrors[`child-${idx}-sonDaughter`] = "Required";
                    if (!c.fullName) newErrors[`child-${idx}-fullName`] = "Required";
                    if (!c.birthdate) newErrors[`child-${idx}-birthdate`] = "Required";
                    if (idx < 2 && !c.parents) newErrors[`child-${idx}-parents`] = "Required";
                });
                if (!formData.guardian1) newErrors.guardian1 = "Guardian Choice #1 is required";
            }

            if (!formData.maritalSettlement) newErrors.maritalSettlement = "Required";
            if (!formData.prePostMarriageContract) newErrors.prePostMarriageContract = "Required";
            if (!formData.widowedFiledEstateTax) newErrors.widowedFiledEstateTax = "Required";
            if (!formData.filedGiftTaxReturns) newErrors.filedGiftTaxReturns = "Required";
            if (!formData.completedPreviousTrust) newErrors.completedPreviousTrust = "Required";

            formData.disabilityPOAs.forEach((poa, idx) => {
                if (idx < 2 && !poa) newErrors[`disabilityPOA-${idx}`] = "Choice required";
            });
            formData.medicalPOAs.forEach((poa, idx) => {
                if (idx < 2 && !poa) newErrors[`medicalPOA-${idx}`] = "Choice required";
            });
            formData.successorTrustees.forEach((poa, idx) => {
                if (idx < 2 && !poa) newErrors[`successorTrustee-${idx}`] = "Choice required";
            });
        } else if (currentStep === 3) {
            if (!formData.estateDistributionMethod) newErrors.estateDistributionMethod = "Please select a distribution method";
            if (formData.estateDistributionMethod === 'CUSTOM_OTHER' && !formData.customDistributionDescription) {
                newErrors.customDistributionDescription = "Custom description is required";
            }
        } else if (currentStep === 4) {
            if (!formData.hasLifeInsurance) newErrors.hasLifeInsurance = "Required";
            if (formData.hasLifeInsurance === 'Yes' && !formData.lifeInsuranceDetails) {
                newErrors.lifeInsuranceDetails = "Please provide details";
            }

            if (!formData.entityCountRange) newErrors.entityCountRange = "Required";
            formData.businessEntities.forEach((e, idx) => {
                if (!e.companyName) newErrors[`entity-${idx}-companyName`] = "Required";
                if (!e.entityType) newErrors[`entity-${idx}-entityType`] = "Required";
                if (!e.percentOwned) newErrors[`entity-${idx}-percentOwned`] = "Required";
                if (!e.specificOwnershipName) newErrors[`entity-${idx}-specificOwnershipName`] = "Required";
            });

            if (!formData.propertiesCountRange) newErrors.propertiesCountRange = "Required";
            formData.realProperties.forEach((p, idx) => {
                if (!p.propertyType) newErrors[`prop-${idx}-propertyType`] = "Required";
            });
        }

        const hasErrors = Object.keys(newErrors).length > 0;
        setErrors(newErrors);

        if (hasErrors) {
            toast({
                title: 'Missing Required Fields',
                description: 'Please complete all required fields highlighted in red before proceeding.',
                variant: 'destructive',
            });
            return false;
        }

        return true;
    };

    const handleNext = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (!validateCurrentStep()) return;

        if (currentStep < steps.length) {
            setCurrentStep(currentStep + 1);
        } else {
            console.log('Estate Form submitted!');
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Card className="w-full max-w-6xl mx-auto">
            <CardContent className="p-0 flex flex-col md:flex-row min-h-[600px]">
                <div className="p-6 md:p-8 shrink-0 bg-background md:bg-transparent">
                    <SidebarSteps />
                </div>
                
                <Separator orientation="vertical" className="hidden md:block h-auto" />
                <Separator orientation="horizontal" className="block md:hidden" />

                <form className="flex-1 p-6 md:p-8 flex flex-col justify-between bg-background relative" noValidate onSubmit={handleNext}>
                    <div className="mb-8">
                        {renderStepContent()}
                    </div>

                    <div className="flex items-center justify-between pt-6 mt-auto border-t">
                        {currentStep > 1 ? (
                            <Button
                                variant="outline"
                                onClick={handlePrevious}
                                type="button"
                            >
                                ← Previous
                            </Button>
                        ) : (
                            <div></div>
                        )}

                        <Button
                            type="submit"
                            className="px-8"
                        >
                            {currentStep === steps.length ? 'Submit' : 'Next →'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default MultiStepEstateForm;
