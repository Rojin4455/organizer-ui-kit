import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, X, ArrowLeft, Check, ChevronsUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { businessLogo } from '../assets';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const INCOME_CATEGORIES = [
  { id: '1099', label: '1099' },
  { id: 'other-income', label: 'Other Income' }
];

const EXPENSE_CATEGORIES = [
  { id: 'accounting-fees', label: 'Accounting Fees' },
  { id: 'advertising-marketing', label: 'Advertising & Marketing' },
  { id: 'bank-credit-fees', label: 'Bank and Credit Card Fees' },
  { id: 'business-credit-interest', label: 'Business Credit Card Interest' },
  { id: 'business-licenses', label: 'Business Licenses & Permits' },
  { id: 'cell-phone', label: 'Cell Phone' },
  { id: 'computer-supplies', label: 'Computer Supplies/Service' },
  { id: 'consulting', label: 'Consulting' },
  { id: 'cost-goods-sold', label: 'Cost of Goods Sold (ONLY ENTER AMOUNTS HERE IF YOU SELL PRODUCTS)' },
  { id: 'dues-membership', label: 'Dues & Membership Fees' },
  { id: 'equipment-rental', label: 'Equipment Rental' },
  { id: 'office-supplies', label: 'Office Supplies' },
  { id: 'legal-fees', label: 'Legal Fees' },
  { id: 'meals', label: 'Meals' },
  { id: 'postage-delivery', label: 'Postage and Delivery' },
  { id: 'printing-reproduction', label: 'Printing and Reproduction' },
  { id: 'rent', label: 'Rent (ENTER AMOUNTS HERE IF YOU ARE RENTING AN OFFICE OR STORAGE UNIT OUTSIDE THE HOME)' },
  { id: 'software-apps', label: 'Software/Apps' },
  { id: 'sponsorships', label: 'Sponsorships' },
  { id: 'subcontractors', label: 'Subcontractors/Consultants/Outside Services' },
  { id: 'travel', label: 'Travel (Airfare, Hotel, etc. DO NOT ENTER MILEAGE)' },
  { id: 'uniforms', label: 'Uniforms - Purchase & Cleaning' },
  { id: 'misc-home-office', label: 'Miscellaneous- Home/Office Phone' },
  { id: 'misc-internet', label: 'Miscellaneous- Internet' },
  { id: 'misc-utilities', label: 'Miscellaneous- Utilities' },
  { id: 'misc-other1', label: 'Miscellaneous- Other PLEASE DESCRIBE' },
  { id: 'misc-other2', label: 'Miscellaneous- Other PLEASE DESCRIBE' }
];

const IncomeExpenseTracker = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  
  const [incomeData, setIncomeData] = useState<Record<string, Record<string, number>>>({});
  const [expenseData, setExpenseData] = useState<Record<string, Record<string, number>>>({});
  const [selectedExpenseCategories, setSelectedExpenseCategories] = useState<string[]>([]);

  const updateValue = useCallback((data: Record<string, Record<string, number>>, setData: React.Dispatch<React.SetStateAction<Record<string, Record<string, number>>>>, categoryId: string, month: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setData(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        [month]: numValue
      }
    }));
  }, []);

  const addExpenseCategory = useCallback((categoryId: string) => {
    if (!selectedExpenseCategories.includes(categoryId)) {
      setSelectedExpenseCategories(prev => [...prev, categoryId]);
    }
  }, [selectedExpenseCategories]);

  const removeExpenseCategory = useCallback((categoryId: string) => {
    setSelectedExpenseCategories(prev => prev.filter(id => id !== categoryId));
    setExpenseData(prev => {
      const newData = { ...prev };
      delete newData[categoryId];
      return newData;
    });
  }, []);

  const getCategoryTotal = useCallback((data: Record<string, Record<string, number>>, categoryId: string) => {
    const categoryData = data[categoryId] || {};
    return Object.values(categoryData).reduce((sum, value) => sum + (value || 0), 0);
  }, []);

  const getMonthTotal = useCallback((data: Record<string, Record<string, number>>, month: string) => {
    return Object.values(data).reduce((sum, categoryData) => {
      return sum + (categoryData[month] || 0);
    }, 0);
  }, []);

  const getMonthTotalForSelected = useCallback((month: string) => {
    return selectedExpenseCategories.reduce((sum, categoryId) => {
      return sum + (expenseData[categoryId]?.[month] || 0);
    }, 0);
  }, [selectedExpenseCategories, expenseData]);

  // Calculate totals
  const totalIncome = INCOME_CATEGORIES.reduce((sum, category) => sum + getCategoryTotal(incomeData, category.id), 0);
  const totalExpenses = selectedExpenseCategories.reduce((sum, categoryId) => sum + getCategoryTotal(expenseData, categoryId), 0);
  const netIncome = totalIncome - totalExpenses;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-primary hover:bg-primary/10 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Forms
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="bg-primary/5 rounded-lg p-2">
                <img src={businessLogo} alt="ATG Advanced Tax Group" className="h-8 w-auto" loading="eager" />
              </div>
              <div className="text-center">
                <h1 className="text-lg font-bold text-primary">Advanced Tax Group</h1>
                <p className="text-sm text-muted-foreground">Professional Tax Services</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-primary">2025</div>
              <div className="text-sm text-muted-foreground">Tax Year</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-foreground">SELF-EMPLOYED INCOME & EXPENSE LOG</h2>
            <p className="text-sm text-muted-foreground mt-1">Track your business income and expenses throughout the year</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Income Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-14 gap-2 min-w-[1200px]">
                {/* Headers */}
                <div className="font-semibold text-sm"></div>
                {MONTHS.map(month => (
                  <div key={month} className="font-semibold text-sm text-center p-2 bg-accent rounded">
                    {month}
                  </div>
                ))}
                <div className="font-semibold text-sm text-center p-2 bg-primary text-primary-foreground rounded">
                  TOTAL
                </div>

                {/* Income Categories */}
                {INCOME_CATEGORIES.map(category => (
                  <div key={category.id} className="contents">
                    <Label className="text-sm font-medium p-2 flex items-center">
                      {category.label}
                    </Label>
                    {MONTHS.map(month => (
                      <Input
                        key={`${category.id}-${month}`}
                        type="number"
                        step="0.01"
                        className="text-center"
                        placeholder="0.00"
                        value={incomeData[category.id]?.[month] || ''}
                        onChange={(e) => updateValue(incomeData, setIncomeData, category.id, month, e.target.value)}
                      />
                    ))}
                    <div className="p-2 bg-muted rounded text-center font-semibold">
                      {formatCurrency(getCategoryTotal(incomeData, category.id))}
                    </div>
                  </div>
                ))}

                {/* Total Income Row */}
                <div className="contents">
                  <Label className="text-sm font-bold p-2 flex items-center bg-secondary rounded">
                    Total Income
                  </Label>
                  {MONTHS.map(month => (
                    <div key={`total-income-${month}`} className="p-2 bg-secondary rounded text-center font-semibold">
                      {formatCurrency(getMonthTotal(incomeData, month))}
                    </div>
                  ))}
                  <div className="p-2 bg-primary text-primary-foreground rounded text-center font-bold">
                    {formatCurrency(totalIncome)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl text-primary">Expenses</CardTitle>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-[300px] justify-between"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add expense category...
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0">
                <Command>
                  <CommandInput placeholder="Search expense categories..." />
                  <CommandList>
                    <CommandEmpty>No expense category found.</CommandEmpty>
                    <CommandGroup>
                      {EXPENSE_CATEGORIES
                        .filter(category => !selectedExpenseCategories.includes(category.id))
                        .map((category) => (
                        <CommandItem
                          key={category.id}
                          value={category.label}
                          onSelect={() => {
                            addExpenseCategory(category.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              "opacity-0"
                            )}
                          />
                          {category.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {selectedExpenseCategories.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No expense categories selected. Use the "Add expense category" button above to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="grid grid-cols-14 gap-2 min-w-[1200px]">
                  {/* Headers */}
                  <div className="font-semibold text-sm"></div>
                  {MONTHS.map(month => (
                    <div key={month} className="font-semibold text-sm text-center p-2 bg-accent rounded">
                      {month}
                    </div>
                  ))}
                  <div className="font-semibold text-sm text-center p-2 bg-primary text-primary-foreground rounded">
                    TOTAL
                  </div>

                  {/* Selected Expense Categories */}
                  {selectedExpenseCategories.map(categoryId => {
                    const category = EXPENSE_CATEGORIES.find(cat => cat.id === categoryId);
                    if (!category) return null;
                    
                    return (
                      <div key={category.id} className="contents">
                        <div className="text-xs font-medium p-2 flex items-center justify-between bg-muted rounded">
                          <span className="flex-1">{category.label}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeExpenseCategory(category.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        {MONTHS.map(month => (
                          <Input
                            key={`${category.id}-${month}`}
                            type="number"
                            step="0.01"
                            className="text-center"
                            placeholder="0.00"
                            value={expenseData[category.id]?.[month] || ''}
                            onChange={(e) => updateValue(expenseData, setExpenseData, category.id, month, e.target.value)}
                          />
                        ))}
                        <div className="p-2 bg-muted rounded text-center font-semibold">
                          {formatCurrency(getCategoryTotal(expenseData, category.id))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total Expenses Row */}
                  <div className="contents">
                    <Label className="text-sm font-bold p-2 flex items-center bg-secondary rounded">
                      Total Expenses
                    </Label>
                    {MONTHS.map(month => (
                      <div key={`total-expenses-${month}`} className="p-2 bg-secondary rounded text-center font-semibold">
                        {formatCurrency(getMonthTotalForSelected(month))}
                      </div>
                    ))}
                    <div className="p-2 bg-primary text-primary-foreground rounded text-center font-bold">
                      {formatCurrency(totalExpenses)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Net Income Calculation Row */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl text-primary">Net Income (Income - Expenses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-14 gap-2 min-w-[1200px]">
                {/* Headers */}
                <div className="font-semibold text-sm"></div>
                {MONTHS.map(month => (
                  <div key={month} className="font-semibold text-sm text-center p-2 bg-accent rounded">
                    {month}
                  </div>
                ))}
                <div className="font-semibold text-sm text-center p-2 bg-primary text-primary-foreground rounded">
                  TOTAL
                </div>

                {/* Net Income Row */}
                <div className="contents">
                  <Label className="text-sm font-bold p-2 flex items-center bg-success/10 rounded">
                    Net Income (Income - Expenses)
                  </Label>
                  {MONTHS.map(month => {
                    const monthIncome = getMonthTotal(incomeData, month);
                    const monthExpenses = getMonthTotalForSelected(month);
                    const monthlyNet = monthIncome - monthExpenses;
                    return (
                      <div 
                        key={`net-income-${month}`} 
                        className={`p-2 rounded text-center font-bold ${
                          monthlyNet >= 0 
                            ? 'bg-success text-success-foreground' 
                            : 'bg-destructive text-destructive-foreground'
                        }`}
                      >
                        {formatCurrency(monthlyNet)}
                      </div>
                    );
                  })}
                  <div className={`p-2 rounded text-center font-bold ${
                    netIncome >= 0 
                      ? 'bg-success text-success-foreground' 
                      : 'bg-destructive text-destructive-foreground'
                  }`}>
                    {formatCurrency(netIncome)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeExpenseTracker;