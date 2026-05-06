import React, { useRef } from 'react';
import { useEstateForm, ChildData, HeirData } from '../../contexts/EstateFormContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const Step2Heirs: React.FC = () => {
    const { formData, updateFormData, errors, clearError, readOnly } = useEstateForm();

    const isMarriedOrPartner = formData.status === 'Married' || formData.status === 'Partner';

    const sectionRefs = {
        spouse: useRef<HTMLDivElement>(null),
        children: useRef<HTMLDivElement>(null),
        heirs: useRef<HTMLDivElement>(null),
        legal: useRef<HTMLDivElement>(null),
        fiduciaries: useRef<HTMLDivElement>(null),
    };

    const scrollToSection = (section: keyof typeof sectionRefs) => {
        sectionRefs[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // --- CHILDREN LOGIC ---
    const handleNumChildrenChange = (val: string) => {
        const num = parseInt(val, 10);
        updateFormData({ numChildren: num });

        const currentChildren = [...formData.children];
        if (num > currentChildren.length) {
            for (let i = currentChildren.length; i < num; i++) {
                currentChildren.push({
                    id: `child-${Date.now()}-${i}`,
                    sonDaughter: '',
                    fullName: '',
                    birthdate: '',
                    parents: ''
                });
            }
        } else if (num < currentChildren.length) {
            currentChildren.splice(num);
        }
        updateFormData({ children: currentChildren });
    };

    const updateChild = (index: number, field: keyof ChildData, value: string) => {
        const newChildren = [...formData.children];
        newChildren[index] = { ...newChildren[index], [field]: value };
        updateFormData({ children: newChildren });
        clearError(`child-${index}-${field}`);
    };

    // --- HEIRS LOGIC ---
    const addHeir = () => {
        if (formData.heirs.length < 4) {
            updateFormData({ heirs: [...formData.heirs, { id: `heir-${Date.now()}`, name: '', relationship: '' }] });
        }
    };

    const removeHeir = (index: number) => {
        const newHeirs = formData.heirs.filter((_, i) => i !== index);
        updateFormData({ heirs: newHeirs });
    };

    const updateHeir = (index: number, field: keyof HeirData, value: string) => {
        const newHeirs = [...formData.heirs];
        newHeirs[index] = { ...newHeirs[index], [field]: value };
        updateFormData({ heirs: newHeirs });
    };

    // --- FIDUCIARY LOGIC ---
    const addFiduciary = (field: 'disabilityPOAs' | 'medicalPOAs' | 'successorTrustees') => {
        if (formData[field].length < 3) {
            updateFormData({ [field]: [...formData[field], ''] });
        }
    };

    const removeFiduciary = (field: 'disabilityPOAs' | 'medicalPOAs' | 'successorTrustees', index: number) => {
        if (formData[field].length > 2) {
            const newArr = formData[field].filter((_, i) => i !== index);
            updateFormData({ [field]: newArr });
        }
    };

    const updateFiduciary = (field: 'disabilityPOAs' | 'medicalPOAs' | 'successorTrustees', index: number, value: string) => {
        const newArr = [...formData[field]];
        newArr[index] = value;
        updateFormData({ [field]: newArr });
        // e.g. disabilityPOAs -> disabilityPOA-0
        clearError(`${field.slice(0, -1)}-${index}`);
    };

    return (
        <div className="space-y-6 relative">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight">Heirs, Legal & Fiduciaries</h2>
                <p className="text-sm text-muted-foreground mt-1">Complete your family, heir, and legal details below.</p>
            </div>

            {/* STICKY SUB-NAVIGATION */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur py-3 border-b border-muted -mx-4 px-4 md:-mx-8 md:px-8 mb-8 flex flex-wrap gap-2">
                {isMarriedOrPartner && (
                    <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('spouse')}>Spouse</Button>
                )}
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('children')}>Children</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('heirs')}>Other Heirs</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('legal')}>Legal Questions</Button>
                <Button type="button" variant="secondary" size="sm" onClick={() => scrollToSection('fiduciaries')}>Fiduciaries</Button>
            </div>

            <div className="space-y-12 pb-8">
                {/* SPOUSE / PARTNER */}
                {isMarriedOrPartner && (
                    <div ref={sectionRefs.spouse} className="space-y-6 scroll-mt-24">
                        <div>
                            <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Spouse / Partner Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-lg border">
                            <div className="space-y-2">
                                <Label htmlFor="spouseFullName">Spouse Full Name</Label>
                                <Input id="spouseFullName" value={formData.spouseFullName} onChange={(e) => updateFormData({ spouseFullName: e.target.value })} disabled={readOnly} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseAliases">Other Aliases of Spouse/Partner</Label>
                                <Input id="spouseAliases" value={formData.spouseAliases} onChange={(e) => updateFormData({ spouseAliases: e.target.value })} disabled={readOnly} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spouseDob">Spouse Date Of Birth <span className="text-destructive">*</span></Label>
                                <Input id="spouseDob" type="date" value={formData.spouseDob} onChange={(e) => { updateFormData({ spouseDob: e.target.value }); clearError('spouseDob'); }} required disabled={readOnly} />
                                {errors.spouseDob && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.spouseDob}</p>}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spouseOccupation">Spouse Occupation & Employer</Label>
                                <Input id="spouseOccupation" value={formData.spouseOccupation} onChange={(e) => updateFormData({ spouseOccupation: e.target.value })} disabled={readOnly} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="spouseEmail">Spouse Email</Label>
                                <Input id="spouseEmail" type="email" value={formData.spouseEmail} onChange={(e) => updateFormData({ spouseEmail: e.target.value })} disabled={readOnly} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spousePhone">Spouse Phone Number</Label>
                                <Input id="spousePhone" type="tel" value={formData.spousePhone} onChange={(e) => updateFormData({ spousePhone: e.target.value })} disabled={readOnly} />
                            </div>
                        </div>
                    </div>
                )}

                {/* SECTION A: Children & Descendants */}
                <div ref={sectionRefs.children} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section A: Children & Descendants</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="space-y-3">
                            <Label>Do you or your partner have any children? <span className="text-destructive">*</span></Label>
                            <RadioGroup 
                                value={formData.hasChildren} 
                                onValueChange={(val) => {
                                    updateFormData({ hasChildren: val });
                                    clearError('hasChildren');
                                    if (val === 'No') {
                                        updateFormData({ numChildren: 0, children: [] });
                                    }
                                }}
                                className="flex gap-4"
                                disabled={readOnly}
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Yes" id="has-children-yes" />
                                    <Label htmlFor="has-children-yes" className="font-normal">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="has-children-no" />
                                    <Label htmlFor="has-children-no" className="font-normal">No</Label>
                                </div>
                            </RadioGroup>
                            {errors.hasChildren && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.hasChildren}</p>}
                        </div>

                        {formData.hasChildren === 'Yes' && (
                            <div className="space-y-2">
                                <Label htmlFor="numChildren">How many children?</Label>
                                <Select 
                                    value={formData.numChildren ? formData.numChildren.toString() : ''} 
                                    onValueChange={handleNumChildrenChange}
                                    disabled={readOnly}
                                >
                                    <SelectTrigger id="numChildren" className="max-w-[200px]">
                                        <SelectValue placeholder="Select Number" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">Up to 5 dynamically supported.</p>
                            </div>
                        )}
                    </div>

                    {formData.children.length > 0 && (
                        <div className="space-y-6 mt-4">
                            {formData.children.map((child, index) => (
                                <Card key={child.id} className="bg-muted/30">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-lg">Child {index + 1}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4 py-3">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Son/Daughter</Label>
                                                <Select 
                                                    value={child.sonDaughter} 
                                                    onValueChange={(val) => updateChild(index, 'sonDaughter', val)}
                                                    disabled={readOnly}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="Son">Son</SelectItem>
                                                        <SelectItem value="Daughter">Daughter</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {errors[`child-${index}-sonDaughter`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`child-${index}-sonDaughter`]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Child Full Name <span className="text-destructive">*</span></Label>
                                                <Input 
                                                    value={child.fullName} 
                                                    onChange={(e) => updateChild(index, 'fullName', e.target.value)} 
                                                    required 
                                                    disabled={readOnly}
                                                />
                                                {errors[`child-${index}-fullName`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`child-${index}-fullName`]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Child Birthdate <span className="text-destructive">*</span></Label>
                                                <Input 
                                                    type="date" 
                                                    value={child.birthdate} 
                                                    onChange={(e) => updateChild(index, 'birthdate', e.target.value)} 
                                                    required 
                                                    disabled={readOnly}
                                                />
                                                {errors[`child-${index}-birthdate`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`child-${index}-birthdate`]}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Parent/s of Child <span className="text-destructive">*</span></Label>
                                                <Input 
                                                    value={child.parents} 
                                                    onChange={(e) => updateChild(index, 'parents', e.target.value)}
                                                    placeholder={index >= 2 ? "Parents if different" : ""}
                                                    required={index < 2} 
                                                    disabled={readOnly}
                                                />
                                                {errors[`child-${index}-parents`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`child-${index}-parents`]}</p>}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            <div className="space-y-4 mt-6 bg-muted/30 p-6 rounded-lg border">
                                <Label className="text-base font-semibold">Guardianship</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="guardian1">Guardian Choice #1 <span className="text-destructive">*</span></Label>
                                        <Input id="guardian1" value={formData.guardian1} onChange={(e) => { updateFormData({ guardian1: e.target.value }); clearError('guardian1'); }} required disabled={readOnly} />
                                        {errors.guardian1 && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.guardian1}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guardian2">Guardian Choice #2</Label>
                                        <Input id="guardian2" value={formData.guardian2} onChange={(e) => updateFormData({ guardian2: e.target.value })} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="guardian3">Guardian Choice #3</Label>
                                        <Input id="guardian3" value={formData.guardian3} onChange={(e) => updateFormData({ guardian3: e.target.value })} disabled={readOnly} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* SECTION B: Other Heirs */}
                <div ref={sectionRefs.heirs} className="space-y-6 scroll-mt-24">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section B: Other Heirs</h3>
                        {!readOnly && formData.heirs.length < 4 && (
                            <Button type="button" onClick={addHeir} size="sm" variant="outline" className="gap-2">
                                <Plus className="w-4 h-4" /> Add Heir
                            </Button>
                        )}
                    </div>
                    
                    {formData.heirs.length === 0 ? (
                        <div className="text-sm text-muted-foreground p-6 bg-muted/20 rounded-lg text-center border-dashed border-2">
                            No additional heirs added. Completely optional.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            {formData.heirs.map((heir, index) => (
                                <div key={heir.id} className="relative space-y-4 p-5 border rounded-lg bg-muted/30 group">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-semibold text-sm">Heir {index + 1}</h4>
                                        {!readOnly && (
                                        <Button type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-opacity" 
                                            onClick={() => removeHeir(index)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`heirName-${index}`}>Name</Label>
                                        <Input id={`heirName-${index}`} value={heir.name} onChange={(e) => updateHeir(index, 'name', e.target.value)} disabled={readOnly} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`heirRel-${index}`}>Relationship</Label>
                                        <Input id={`heirRel-${index}`} value={heir.relationship} onChange={(e) => updateHeir(index, 'relationship', e.target.value)} disabled={readOnly} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* SECTION C: General Legal Questions */}
                <div ref={sectionRefs.legal} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section C: General Legal Questions</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-muted/30 p-6 rounded-lg border">
                        {[
                            { label: 'Payments for marital settlement?', field: 'maritalSettlement' },
                            { label: 'Pre/post-marriage contract?', field: 'prePostMarriageContract' },
                            { label: 'Widowed? (Filed estate tax return)', field: 'widowedFiledEstateTax' },
                            { label: 'Filed gift tax returns?', field: 'filedGiftTaxReturns' },
                            { label: 'Completed previous trust?', field: 'completedPreviousTrust' },
                        ].map((q) => (
                            <div key={q.field} className="space-y-3">
                                <Label className="text-sm font-medium">{q.label}</Label>
                                <RadioGroup 
                                    value={formData[q.field as keyof typeof formData] as string} 
                                    onValueChange={(val) => { updateFormData({ [q.field]: val }); clearError(q.field); }}
                                    className="flex gap-4"
                                    disabled={readOnly}
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="Yes" id={`${q.field}-yes`} />
                                        <Label htmlFor={`${q.field}-yes`} className="font-normal">Yes</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="No" id={`${q.field}-no`} />
                                        <Label htmlFor={`${q.field}-no`} className="font-normal">No</Label>
                                    </div>
                                </RadioGroup>
                                {errors[q.field] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[q.field]}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SECTION D: Fiduciaries */}
                <div ref={sectionRefs.fiduciaries} className="space-y-6 scroll-mt-24">
                    <div>
                        <h3 className="text-lg font-medium tracking-tight border-l-4 border-primary pl-3">Section D: Fiduciaries</h3>
                        <p className="text-sm text-muted-foreground mt-2">At least 2 choices are required for each role. You may add a 3rd optional choice.</p>
                    </div>

                    <div className="space-y-8">
                        {/* Disability POAs */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-muted/50 p-2 px-3 rounded-md">
                                <Label className="text-base font-semibold">Financial Power of Attorney (Disability POA)</Label>
                                {!readOnly && formData.disabilityPOAs.length < 3 && (
                                    <Button type="button" onClick={() => addFiduciary('disabilityPOAs')} size="sm" variant="ghost" className="h-8 gap-1">
                                        <Plus className="w-4 h-4" /> Add 3rd Choice
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                                {formData.disabilityPOAs.map((poa, index) => (
                                    <div key={index} className="space-y-2 relative">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor={`disabilityPOA-${index}`}>Choice #{index + 1} {index < 2 && <span className="text-destructive">*</span>}</Label>
                                            {index === 2 && !readOnly && (
                                                <Button type="button" size="icon" variant="ghost" className="h-5 w-5 hover:text-destructive" onClick={() => removeFiduciary('disabilityPOAs', index)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input id={`disabilityPOA-${index}`} value={poa} onChange={(e) => updateFiduciary('disabilityPOAs', index, e.target.value)} required={index < 2} disabled={readOnly} />
                                        {errors[`disabilityPOA-${index}`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`disabilityPOA-${index}`]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Medical POAs */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-muted/50 p-2 px-3 rounded-md">
                                <Label className="text-base font-semibold">Medical Decision Maker (Medical POA)</Label>
                                {!readOnly && formData.medicalPOAs.length < 3 && (
                                    <Button type="button" onClick={() => addFiduciary('medicalPOAs')} size="sm" variant="ghost" className="h-8 gap-1">
                                        <Plus className="w-4 h-4" /> Add 3rd Choice
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                                {formData.medicalPOAs.map((poa, index) => (
                                    <div key={index} className="space-y-2 relative">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor={`medicalPOAs-${index}`}>Choice #{index + 1} {index < 2 && <span className="text-destructive">*</span>}</Label>
                                            {index === 2 && !readOnly && (
                                                <Button type="button" size="icon" variant="ghost" className="h-5 w-5 hover:text-destructive" onClick={() => removeFiduciary('medicalPOAs', index)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input id={`medicalPOAs-${index}`} value={poa} onChange={(e) => updateFiduciary('medicalPOAs', index, e.target.value)} required={index < 2} disabled={readOnly} />
                                        {errors[`medicalPOA-${index}`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`medicalPOA-${index}`]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Successor Trustees */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center bg-muted/50 p-2 px-3 rounded-md">
                                <Label className="text-base font-semibold">Executors of Will/Trust (Successor Trustee)</Label>
                                {!readOnly && formData.successorTrustees.length < 3 && (
                                    <Button type="button" onClick={() => addFiduciary('successorTrustees')} size="sm" variant="ghost" className="h-8 gap-1">
                                        <Plus className="w-4 h-4" /> Add 3rd Choice
                                    </Button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
                                {formData.successorTrustees.map((poa, index) => (
                                    <div key={index} className="space-y-2 relative">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor={`successorTrustees-${index}`}>Choice #{index + 1} {index < 2 && <span className="text-destructive">*</span>}</Label>
                                            {index === 2 && !readOnly && (
                                                <Button type="button" size="icon" variant="ghost" className="h-5 w-5 hover:text-destructive" onClick={() => removeFiduciary('successorTrustees', index)}>
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            )}
                                        </div>
                                        <Input id={`successorTrustees-${index}`} value={poa} onChange={(e) => updateFiduciary('successorTrustees', index, e.target.value)} required={index < 2} disabled={readOnly} />
                                        {errors[`successorTrustee-${index}`] && <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors[`successorTrustee-${index}`]}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step2Heirs;
