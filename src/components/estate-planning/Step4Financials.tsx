import React, { useRef } from 'react';
import { useEstateForm, CashAccount, InvestmentAccount, BusinessEntity, RealProperty } from '../../contexts/EstateFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Reusable UI Wrapper for dynamic block items
const DynamicFormCard: React.FC<{ title: string; onRemove?: () => void; readOnly?: boolean; children: React.ReactNode }> = ({ title, onRemove, readOnly, children }) => (
    <div className="relative space-y-4 p-5 border rounded-lg bg-muted/30 group">
        <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm border-b-2 border-primary/20 pb-1 pr-4 inline-block">{title}</h4>
            {onRemove && !readOnly && (
                <Button type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 text-muted-foreground hover:text-destructive transition-opacity" 
                    onClick={onRemove}
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const Step4Financials: React.FC = () => {
    const { formData, updateFormData, errors, clearError, readOnly } = useEstateForm();

    const sectionRefs = {
        cash: useRef<HTMLDivElement>(null),
        investments: useRef<HTMLDivElement>(null),
        insurance: useRef<HTMLDivElement>(null),
        business: useRef<HTMLDivElement>(null),
        properties: useRef<HTMLDivElement>(null),
    };

    const scrollToSection = (section: keyof typeof sectionRefs) => {
        sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- CASH ACCOUNTS (Max 5) ---
    const addCashAccount = () => {
        if (formData.cashAccounts.length < 5) {
            updateFormData({ 
                cashAccounts: [...formData.cashAccounts, { id: `cash-${Date.now()}`, bankName: '', nameOnAccount: '', accountType: '' }] 
            });
        }
    };
    const updateCashAccount = (index: number, field: keyof CashAccount, value: string) => {
        const arr = [...formData.cashAccounts];
        arr[index] = { ...arr[index], [field]: value };
        updateFormData({ cashAccounts: arr });
    };
    const removeCashAccount = (index: number) => {
        updateFormData({ cashAccounts: formData.cashAccounts.filter((_, i) => i !== index) });
    };

    // --- INVESTMENT ACCOUNTS (Max 3) ---
    const addInvestmentAccount = () => {
        if (formData.investmentAccounts.length < 3) {
            updateFormData({ 
                investmentAccounts: [...formData.investmentAccounts, { id: `inv-${Date.now()}`, brokerageName: '', accountType: '', owner: '' }] 
            });
        }
    };
    const updateInvestmentAccount = (index: number, field: keyof InvestmentAccount, value: string) => {
        const arr = [...formData.investmentAccounts];
        arr[index] = { ...arr[index], [field]: value };
        updateFormData({ investmentAccounts: arr });
    };
    const removeInvestmentAccount = (index: number) => {
        updateFormData({ investmentAccounts: formData.investmentAccounts.filter((_, i) => i !== index) });
    };

    // --- BUSINESS ENTITIES ---
    const handleEntityRangeChange = (val: string) => {
        updateFormData({ entityCountRange: val });
        
        let targetLength = 0;
        if (val === '0') targetLength = 0;
        else if (val === '1-4') targetLength = 1;
        else if (val === '5-8') targetLength = 5;
        else if (val === '8-10') targetLength = 8;
        else if (val === '11+') targetLength = 11;

        const currentEntities = [...formData.businessEntities];
        if (targetLength > currentEntities.length) {
            for (let i = currentEntities.length; i < targetLength; i++) {
                currentEntities.push({
                    id: `entity-${Date.now()}-${i}`,
                    companyName: '',
                    entityType: '',
                    percentOwned: '',
                    specificOwnershipName: ''
                });
            }
        } else if (targetLength === 0) {
            currentEntities.length = 0; // Clear all
        }
        updateFormData({ businessEntities: currentEntities });
    };

    const addEntity = () => {
        updateFormData({
            businessEntities: [...formData.businessEntities, {
                id: `entity-${Date.now()}`, companyName: '', entityType: '', percentOwned: '', specificOwnershipName: ''
            }]
        });
    };

    const updateEntity = (index: number, field: keyof BusinessEntity, value: string) => {
        const arr = [...formData.businessEntities];
        arr[index] = { ...arr[index], [field]: value };
        updateFormData({ businessEntities: arr });
        clearError(`entity-${index}-${field}`);
    };

    const removeEntity = (index: number) => {
        updateFormData({ businessEntities: formData.businessEntities.filter((_, i) => i !== index) });
    };

    // --- REAL PROPERTIES ---
    const handlePropertyRangeChange = (val: string) => {
        updateFormData({ propertiesCountRange: val });
        
        let targetLength = 0;
        if (val === '0') targetLength = 0;
        else if (val === '1' || val === '2' || val === '3' || val === '4') targetLength = parseInt(val, 10);
        else if (val === '5-8') targetLength = 5;
        else if (val === '8-10') targetLength = 8;

        const currentProps = [...formData.realProperties];
        if (targetLength > currentProps.length) {
            for (let i = currentProps.length; i < targetLength; i++) {
                currentProps.push({
                    id: `prop-${Date.now()}-${i}`,
                    address: '',
                    propertyType: '',
                    percentOwned: '',
                    nameOnDeed: '',
                    value: ''
                });
            }
        } else if (targetLength < currentProps.length && targetLength >= 0) {
            // If they change to a smaller exact number like '1' we truncate.
            // But if they are in '5-8' and click '5-8', it shouldn't truncate manually added 6th props
            // unless we strictly enforce it. We'll strict enforce for simplicity.
            currentProps.length = targetLength;
        }
        updateFormData({ realProperties: currentProps });
    };

    const addProperty = () => {
        updateFormData({
            realProperties: [...formData.realProperties, {
                id: `prop-${Date.now()}`, address: '', propertyType: '', percentOwned: '', nameOnDeed: '', value: ''
            }]
        });
    };

    const updateProperty = (index: number, field: keyof RealProperty, value: string) => {
        const arr = [...formData.realProperties];
        arr[index] = { ...arr[index], [field]: value };
        updateFormData({ realProperties: arr });
        clearError(`prop-${index}-${field}`);
    };

    const removeProperty = (index: number) => {
        updateFormData({ realProperties: formData.realProperties.filter((_, i) => i !== index) });
    };

    const formatCurrency = (val: string) => {
        if (!val) return '';
        const numeric = val.replace(/\D/g, '');
        if (!numeric) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(numeric));
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Financial, Business & Real Property Assets</h2>
                <p className="text-sm text-muted-foreground mt-1">Capture liquid assets (cash/investments), life insurance status, and illiquid business entity ownership.</p>
            </div>

            {/* STICKY SUB-NAVIGATION */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b border-muted -mx-4 px-4 md:-mx-8 md:px-8 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('cash')}>Cash Accounts</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('investments')}>Investments</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('insurance')}>Life Insurance</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('business')}>Business Entities</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('properties')}>Real Property</Button>
            </div>

            <div className="space-y-12 pb-8 pt-4">

                {/* SECTION A: CASH ACCOUNTS */}
                <div ref={sectionRefs.cash} className="space-y-6 scroll-mt-24">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section A: Cash Accounts</h3>
                            <p className="text-sm text-muted-foreground pl-4 mt-1">Only list personal accounts. Do not list any business accounts.</p>
                        </div>
                        {!readOnly && formData.cashAccounts.length < 5 && (
                            <Button type="button" onClick={addCashAccount} size="sm" variant="outline" className="gap-2 shrink-0">
                                <Plus className="w-4 h-4" /> Add Cash Account
                            </Button>
                        )}
                    </div>

                    {formData.cashAccounts.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-lg text-center border-dashed border-2">
                            No personal cash accounts added.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.cashAccounts.map((account, index) => (
                                <DynamicFormCard key={account.id} title={`Cash Account ${index + 1}`} onRemove={() => removeCashAccount(index)} readOnly={readOnly}>
                                    <div className="space-y-2">
                                        <Label>Bank Name</Label>
                                        <Input value={account.bankName} onChange={(e) => updateCashAccount(index, 'bankName', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name on Account</Label>
                                        <Input value={account.nameOnAccount} onChange={(e) => updateCashAccount(index, 'nameOnAccount', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Account Type (e.g. Checking, Savings)</Label>
                                        <Input value={account.accountType} onChange={(e) => updateCashAccount(index, 'accountType', e.target.value)} disabled={readOnly} />
                                    </div>
                                </DynamicFormCard>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* SECTION B: INVESTMENT ACCOUNTS */}
                <div ref={sectionRefs.investments} className="space-y-6 scroll-mt-24">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section B: Investment Accounts</h3>
                        {!readOnly && formData.investmentAccounts.length < 3 && (
                            <Button type="button" onClick={addInvestmentAccount} size="sm" variant="outline" className="gap-2 shrink-0">
                                <Plus className="w-4 h-4" /> Add Investment
                            </Button>
                        )}
                    </div>

                    {formData.investmentAccounts.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-lg text-center border-dashed border-2">
                            No investment accounts added.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {formData.investmentAccounts.map((inv, index) => (
                                <DynamicFormCard key={inv.id} title={`Investment Account ${index + 1}`} onRemove={() => removeInvestmentAccount(index)} readOnly={readOnly}>
                                    <div className="space-y-2">
                                        <Label>Brokerage Name</Label>
                                        <Input value={inv.brokerageName} onChange={(e) => updateInvestmentAccount(index, 'brokerageName', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Account Type</Label>
                                        <Input value={inv.accountType} onChange={(e) => updateInvestmentAccount(index, 'accountType', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Owner of Account</Label>
                                        <Input value={inv.owner} onChange={(e) => updateInvestmentAccount(index, 'owner', e.target.value)} disabled={readOnly} />
                                    </div>
                                </DynamicFormCard>
                            ))}
                        </div>
                    )}
                </div>

                <Separator />

                {/* SECTION C: LIFE INSURANCE */}
                <div ref={sectionRefs.insurance} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section C: Life Insurance</h3>
                    </div>
                    
                    <div className="bg-muted/30 p-6 rounded-lg border space-y-4">
                        <div className="space-y-3">
                            <Label>Do you have any life insurance policies?</Label>
                            <RadioGroup 
                                value={formData.hasLifeInsurance} 
                                onValueChange={(val) => {
                                    updateFormData({ hasLifeInsurance: val });
                                    clearError('hasLifeInsurance');
                                    if (val === 'No') updateFormData({ lifeInsuranceDetails: '' });
                                }}
                                className="flex gap-4"
                                disabled={readOnly}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Yes" id="li-yes" />
                                    <Label htmlFor="li-yes" className="font-normal">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="li-no" />
                                    <Label htmlFor="li-no" className="font-normal">No</Label>
                                </div>
                            </RadioGroup>
                            {errors.hasLifeInsurance && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.hasLifeInsurance}</p>}
                        </div>

                        {formData.hasLifeInsurance === 'Yes' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                <Label htmlFor="li-details">Please provide details (Provider, Type, Benefit Amount, etc.)</Label>
                                <Textarea 
                                    id="li-details" 
                                    className="min-h-[100px] bg-background" 
                                    value={formData.lifeInsuranceDetails}
                                    onChange={(e) => { updateFormData({ lifeInsuranceDetails: e.target.value }); clearError('lifeInsuranceDetails'); }}
                                    disabled={readOnly}
                                />
                                {errors.lifeInsuranceDetails && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.lifeInsuranceDetails}</p>}
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* SECTION D: BUSINESS INTERESTS */}
                <div ref={sectionRefs.business} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section D: Business Interests / LLCs</h3>
                    </div>

                    <div className="space-y-4">
                        <Label>How many entities do you own entirely or partially?</Label>
                        <Select value={formData.entityCountRange} onValueChange={(val) => { handleEntityRangeChange(val); clearError('entityCountRange'); }} disabled={readOnly}>
                            <SelectTrigger className="max-w-[200px]">
                                <SelectValue placeholder="Select Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">None (0)</SelectItem>
                                <SelectItem value="1-4">1-4 Entities</SelectItem>
                                <SelectItem value="5-8">5-8 Entities</SelectItem>
                                <SelectItem value="8-10">8-10 Entities</SelectItem>
                                <SelectItem value="11+">11+ Entities</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.entityCountRange && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.entityCountRange}</p>}
                        <p className="text-xs text-muted-foreground w-full max-w-xl">
                            If you have selected a range, we have seeded a starting amount of entities for you below. You can click "Add Another Entity" at the bottom of the list to match your exact count without overwhelming your screen.
                        </p>
                    </div>

                    {formData.businessEntities.length > 0 && (
                        <div className="space-y-4 mt-6">
                            {formData.businessEntities.map((entity, index) => (
                                <DynamicFormCard key={entity.id} title={`Business Entity ${index + 1}`} onRemove={() => removeEntity(index)} readOnly={readOnly}>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Name of the Company <span className="text-destructive">*</span></Label>
                                        <Input value={entity.companyName} onChange={(e) => updateEntity(index, 'companyName', e.target.value)} required disabled={readOnly} />
                                        {errors[`entity-${index}-companyName`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`entity-${index}-companyName`]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type of Entity <span className="text-destructive">*</span></Label>
                                        <Select value={entity.entityType} onValueChange={(val) => updateEntity(index, 'entityType', val)} disabled={readOnly}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LLC">LLC</SelectItem>
                                                <SelectItem value="Corporation">Corporation</SelectItem>
                                                <SelectItem value="Partnership">Partnership</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors[`entity-${index}-entityType`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`entity-${index}-entityType`]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>% Owned <span className="text-destructive">*</span></Label>
                                        <Input 
                                            type="number" 
                                            min="0" max="100" 
                                            placeholder="e.g. 50"
                                            value={entity.percentOwned} 
                                            onChange={(e) => updateEntity(index, 'percentOwned', e.target.value)} 
                                            required 
                                            disabled={readOnly}
                                        />
                                        {errors[`entity-${index}-percentOwned`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`entity-${index}-percentOwned`]}</p>}
                                    </div>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Specific Ownership Name <span className="text-destructive">*</span></Label>
                                        <Input 
                                            value={entity.specificOwnershipName} 
                                            onChange={(e) => updateEntity(index, 'specificOwnershipName', e.target.value)} 
                                            placeholder="List specific name (e.g. your name, spouse, holding company, Roth IRA)"
                                            required 
                                            disabled={readOnly}
                                        />
                                        {errors[`entity-${index}-specificOwnershipName`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`entity-${index}-specificOwnershipName`]}</p>}
                                    </div>
                                </DynamicFormCard>
                            ))}
                            
                            {!readOnly && (
                            <Button type="button" onClick={addEntity} variant="outline" className="w-full border-dashed gap-2">
                                <Plus className="w-4 h-4" /> Add Another Entity
                            </Button>
                            )}
                        </div>
                    )}
                </div>

                <Separator />

                {/* SECTION E: REAL PROPERTY INTERESTS */}
                <div ref={sectionRefs.properties} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section E: Real Property Interests</h3>
                    </div>

                    <div className="space-y-4">
                        <Label>How many properties do you own?</Label>
                        <RadioGroup 
                            value={formData.propertiesCountRange} 
                            onValueChange={(val) => { handlePropertyRangeChange(val); clearError('propertiesCountRange'); }}
                            className="flex flex-wrap gap-4"
                            disabled={readOnly}
                        >
                            {['0', '1', '2', '3', '4', '5-8', '8-10'].map((opt) => (
                                <div key={opt} className="flex items-center space-x-2">
                                    <RadioGroupItem value={opt} id={`prop-${opt}`} />
                                    <Label htmlFor={`prop-${opt}`} className="font-normal">{opt}</Label>
                                </div>
                            ))}
                        </RadioGroup>
                        {errors.propertiesCountRange && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.propertiesCountRange}</p>}
                    </div>

                    {formData.realProperties.length > 0 && (
                        <div className="space-y-4 mt-6">
                            {formData.realProperties.map((prop, index) => (
                                <DynamicFormCard key={prop.id} title={`Property ${index + 1}`} onRemove={() => removeProperty(index)} readOnly={readOnly}>
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Property Address</Label>
                                        <Input value={prop.address} onChange={(e) => updateProperty(index, 'address', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Type of Property <span className="text-destructive">*</span></Label>
                                        <Select value={prop.propertyType} onValueChange={(val) => updateProperty(index, 'propertyType', val)} disabled={readOnly}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Primary Residence">Primary Residence</SelectItem>
                                                <SelectItem value="Secondary Home">Secondary Home</SelectItem>
                                                <SelectItem value="Vacation">Vacation</SelectItem>
                                                <SelectItem value="Income Property">Income Property</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors[`prop-${index}-propertyType`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`prop-${index}-propertyType`]}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label>% Owned</Label>
                                        <Input 
                                            type="number" min="0" max="100" placeholder="e.g. 100"
                                            value={prop.percentOwned} 
                                            onChange={(e) => updateProperty(index, 'percentOwned', e.target.value)} 
                                            disabled={readOnly}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Name on Deed</Label>
                                        <Input value={prop.nameOnDeed} onChange={(e) => updateProperty(index, 'nameOnDeed', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Value</Label>
                                        <Input 
                                            value={prop.value} 
                                            onChange={(e) => updateProperty(index, 'value', formatCurrency(e.target.value))} 
                                            placeholder="$1,250,000"
                                            disabled={readOnly}
                                        />
                                    </div>
                                </DynamicFormCard>
                            ))}
                            
                            {!readOnly && (
                            <Button type="button" onClick={addProperty} variant="outline" className="w-full border-dashed gap-2">
                                <Plus className="w-4 h-4" /> Add Another Property
                            </Button>
                            )}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Step4Financials;
