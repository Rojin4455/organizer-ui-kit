import React from 'react';
import { useEstateForm } from '../../contexts/EstateFormContext';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';

// Enums for backend mapping
const DISTRIBUTION_METHODS = [
    {
        id: 'EQUAL_DIVISION',
        title: 'Equal Division',
        description: 'Trust Estate is to be equally divided between all children and heirs (and a share going to the issue of a deceased child).'
    },
    {
        id: 'STAGE_OF_LIFE',
        title: '"Stage of Life" Distribution',
        description: '(100% at age 18, 25% at age 21 and 25% at age 25, etc.)'
    },
    {
        id: 'HEMS',
        title: '"HEMS"',
        description: '(assets are distributed as needed for Health, Education, Maintenance & Support)'
    },
    {
        id: 'CUSTOM_OTHER',
        title: 'Custom / Other',
        description: 'I have a highly specific or different plan for my estate distribution.'
    }
];

const PREDECEASED_PLANS = [
    {
        id: 'SHARED_SURVIVORS',
        title: 'Share Among Survivors',
        description: 'The deceased beneficiary\'s share is split evenly among the surviving listed beneficiaries.'
    },
    {
        id: 'PASS_DESCENDANTS',
        title: 'Pass to Descendants',
        description: 'The deceased beneficiary\'s share passes down to their own children/descendants.'
    }
];

const Step3TrustDistribution: React.FC = () => {
    const { formData, updateFormData, errors, clearError, readOnly } = useEstateForm();

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Trust Distribution Plan</h2>
                <p className="text-sm text-muted-foreground mt-1">Design how your estate should be divided and handle contingencies.</p>
            </div>

            {/* Estate Distribution Method */}
            <div className="space-y-4">
                <Label className="text-lg font-semibold border-l-4 border-primary pl-3">
                    How do you want your estate distributed? <span className="text-destructive">*</span>
                </Label>
                
                <RadioGroup 
                    value={formData.estateDistributionMethod} 
                    onValueChange={(val) => { updateFormData({ estateDistributionMethod: val }); clearError('estateDistributionMethod'); }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    disabled={readOnly}
                >
                    {DISTRIBUTION_METHODS.map((method) => (
                        <div key={method.id} className="relative">
                            <RadioGroupItem 
                                value={method.id} 
                                id={`method-${method.id}`} 
                                className="peer sr-only" 
                            />
                            <Label 
                                htmlFor={`method-${method.id}`}
                                className="flex flex-col h-full space-y-2 rounded-lg border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <span className="font-semibold text-base">{method.title}</span>
                                <span className="font-normal text-sm text-muted-foreground">{method.description}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
                {errors.estateDistributionMethod && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.estateDistributionMethod}</p>}

                {/* Smooth Reveal Custom Description Area */}
                <div 
                    className={cn(
                        "grid transition-all duration-300 ease-in-out",
                        formData.estateDistributionMethod === 'CUSTOM_OTHER' ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                    )}
                >
                    <div className="overflow-hidden">
                        <Card className="p-4 bg-muted/30 border-dashed">
                            <Label htmlFor="customDescription" className="mb-2 block font-medium">Please describe your custom plan <span className="text-destructive">*</span></Label>
                            <Textarea 
                                id="customDescription"
                                placeholder="Describe your specific percentages, conditions, or alternative heirs here..."
                                value={formData.customDistributionDescription}
                                onChange={(e) => { updateFormData({ customDistributionDescription: e.target.value }); clearError('customDistributionDescription'); }}
                                className="min-h-[120px] bg-background"
                                required={formData.estateDistributionMethod === 'CUSTOM_OTHER'}
                                disabled={readOnly}
                            />
                            {errors.customDistributionDescription && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.customDistributionDescription}</p>}
                        </Card>
                    </div>
                </div>
            </div>

            {/* Predeceased Beneficiary Plan */}
            <div className="space-y-4 pt-4 border-t">
                <Label className="text-lg font-semibold border-l-4 border-primary pl-3">
                    If a beneficiary passes away before you, what happens to their share?
                </Label>
                
                <RadioGroup 
                    value={formData.predeceasedBeneficiaryPlan} 
                    onValueChange={(val) => updateFormData({ predeceasedBeneficiaryPlan: val })}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
                    disabled={readOnly}
                >
                    {PREDECEASED_PLANS.map((plan) => (
                        <div key={plan.id} className="relative">
                            <RadioGroupItem 
                                value={plan.id} 
                                id={`plan-${plan.id}`} 
                                className="peer sr-only" 
                            />
                            <Label 
                                htmlFor={`plan-${plan.id}`}
                                className="flex flex-col h-full space-y-1 rounded-lg border-2 border-muted bg-background p-4 hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                            >
                                <span className="font-semibold text-base">{plan.title}</span>
                                <span className="font-normal text-sm text-muted-foreground">{plan.description}</span>
                            </Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Additional Information */}
            <div className="space-y-4 pt-4 border-t">
                <Label htmlFor="additionalInformation" className="text-lg font-semibold border-l-4 border-primary pl-3">
                    Additional Estate Planning Goals
                </Label>
                <p className="text-sm text-muted-foreground">Are there any specific concerns, charitable inclinations, or specific gifts (e.g., leaving a specific car or house to a specific person) you wish to note?</p>
                <Textarea 
                    id="additionalInformation"
                    placeholder="Enter any open-ended requests or goals here..."
                    value={formData.additionalInformation}
                    onChange={(e) => updateFormData({ additionalInformation: e.target.value })}
                    className="min-h-[120px]"
                    disabled={readOnly}
                />
            </div>

        </div>
    );
};

export default Step3TrustDistribution;
