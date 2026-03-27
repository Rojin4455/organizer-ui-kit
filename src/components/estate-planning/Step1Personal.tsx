import React from 'react';
import { useEstateForm } from '../../contexts/EstateFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const Step1Personal: React.FC = () => {
    const { formData, updateFormData, errors, clearError } = useEstateForm();

    const handleChange = (field: keyof typeof formData, value: string) => {
        updateFormData({ [field]: value });
        clearError(field);
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Personal Information</h2>
                <p className="text-sm text-muted-foreground mt-1">Gather primary user demographics and contact details.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name <span className="text-destructive">*</span></Label>
                    <Input id="fullName" value={formData.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
                    {errors.fullName && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.fullName}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="aliases">Other complete names/aliases</Label>
                    <Input id="aliases" value={formData.aliases} onChange={(e) => handleChange('aliases', e.target.value)} />
                </div>

                <div className="space-y-3 md:col-span-2">
                    <Label>Rent or Own Residence <span className="text-destructive">*</span></Label>
                    <RadioGroup 
                        value={formData.rentOrOwn} 
                        onValueChange={(val) => handleChange('rentOrOwn', val)}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Own" id="own" />
                            <Label htmlFor="own" className="font-normal">Own</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Rent" id="rent" />
                            <Label htmlFor="rent" className="font-normal">Rent</Label>
                        </div>
                    </RadioGroup>
                    {errors.rentOrOwn && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.rentOrOwn}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="streetAddress">Street Address <span className="text-destructive">*</span></Label>
                    <Input id="streetAddress" value={formData.streetAddress} onChange={(e) => handleChange('streetAddress', e.target.value)} required />
                    {errors.streetAddress && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.streetAddress}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="city">City <span className="text-destructive">*</span></Label>
                    <Input id="city" value={formData.city} onChange={(e) => handleChange('city', e.target.value)} required />
                    {errors.city && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.city}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="state">State <span className="text-destructive">*</span></Label>
                    <Input id="state" value={formData.state} onChange={(e) => handleChange('state', e.target.value)} required />
                    {errors.state && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.state}</p>}
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="postalCode">Postal Code <span className="text-destructive">*</span></Label>
                    <Input id="postalCode" value={formData.postalCode} onChange={(e) => handleChange('postalCode', e.target.value)} required />
                    {errors.postalCode && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.postalCode}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                    <Select value={formData.country} onValueChange={(val) => handleChange('country', val)}>
                        <SelectTrigger id="country">
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="US">United States</SelectItem>
                            <SelectItem value="CA">Canada</SelectItem>
                            <SelectItem value="UK">United Kingdom</SelectItem>
                            <SelectItem value="AU">Australia</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.country && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.country}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth <span className="text-destructive">*</span></Label>
                    <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)} required />
                    {errors.dateOfBirth && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.dateOfBirth}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email <span className="text-destructive">*</span></Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                    {errors.email && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Phone <span className="text-destructive">*</span></Label>
                    <Input id="phone" type="tel" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} required />
                    {errors.phone && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.phone}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation and Employer</Label>
                    <Input id="occupation" value={formData.occupation} onChange={(e) => handleChange('occupation', e.target.value)} />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="status">Select Status <span className="text-destructive">*</span></Label>
                    <Select value={formData.status} onValueChange={(val) => handleChange('status', val)}>
                        <SelectTrigger id="status" className="max-w-xs">
                            <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Partner">Partner</SelectItem>
                        </SelectContent>
                    </Select>
                    {errors.status && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.status}</p>}
                    <p className="text-xs text-muted-foreground mt-1">If Married or Partner, spouse details will be requested in the next step.</p>
                </div>
            </div>
        </div>
    );
};

export default Step1Personal;
