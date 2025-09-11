import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X, Search, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { businessLogo } from '../assets';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
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

interface IncomeRow {
  id: string;
  label: string;
  values: number[];
}

interface ExpenseRow {
  id: string;
  label: string;
  values: number[];
  removable: boolean;
}

const IncomeExpenseTracker = () => {
  const navigate = useNavigate();
  
  const [incomeRows, setIncomeRows] = useState<IncomeRow[]>([
    { id: '1099', label: '1099', values: new Array(12).fill(0) },
    { id: 'other-income', label: 'Other Income', values: new Array(12).fill(0) }
  ]);

  const [expenseRows, setExpenseRows] = useState<ExpenseRow[]>([
    { id: 'accounting', label: 'Accounting Fees', values: new Array(12).fill(0), removable: true },
    { id: 'bank-fees', label: 'Bank and Credit Card Fees', values: new Array(12).fill(0), removable: true },
    { id: 'misc', label: 'Miscellaneous - Other PLEASE DESCRIBE', values: new Array(12).fill(0), removable: true }
  ]);

  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const updateIncomeValue = useCallback((rowId: string, monthIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setIncomeRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, values: row.values.map((v, i) => i === monthIndex ? numValue : v) }
          : row
      )
    );
  }, []);

  const updateExpenseValue = useCallback((rowId: string, monthIndex: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setExpenseRows(prev => 
      prev.map(row => 
        row.id === rowId 
          ? { ...row, values: row.values.map((v, i) => i === monthIndex ? numValue : v) }
          : row
      )
    );
  }, []);

  const addExpenseCategory = useCallback((category: { id: string; label: string }) => {
    const newId = `expense-${Date.now()}`;
    setExpenseRows(prev => [...prev, {
      id: newId,
      label: category.label,
      values: new Array(12).fill(0),
      removable: true
    }]);
    setShowExpenseDropdown(false);
    setSearchTerm('');
  }, []);

  const removeExpenseCategory = useCallback((rowId: string) => {
    setExpenseRows(prev => prev.filter(row => row.id !== rowId));
  }, []);

  const calculateTotals = useCallback((rows: { values: number[] }[]) => {
    return MONTHS.map((_, monthIndex) => 
      rows.reduce((sum, row) => sum + (row.values[monthIndex] || 0), 0)
    );
  }, []);

  const totalIncome = calculateTotals(incomeRows);
  const totalExpenses = calculateTotals(expenseRows);
  const netIncome = totalIncome.map((income, index) => income - totalExpenses[index]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const usedCategoryLabels = expenseRows.map(row => row.label);
  const filteredCategories = EXPENSE_CATEGORIES.filter(cat => 
    cat.label.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !usedCategoryLabels.includes(cat.label)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <div className="bg-blue-900 text-white p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-white hover:bg-blue-800"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Forms
          </Button>
          
          <div className="text-center flex-1">
            <div className="flex items-center justify-center gap-4">
              <div className="bg-white text-blue-900 px-4 py-2 rounded-lg font-bold">
                ATG
              </div>
              <div>
                <h1 className="text-xl font-bold">Advanced Tax Group</h1>
                <p className="text-sm opacity-90">Professional Tax Services</p>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold">2025</div>
            <div className="text-sm opacity-90">Tax Year</div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto mt-6">
          <h2 className="text-2xl font-bold text-center">SELF-EMPLOYED INCOME & EXPENSE LOG</h2>
        </div>
      </div> */}



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

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Income Section */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Income</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <div className="grid grid-cols-14 gap-1 p-4 border-b bg-muted/30">
                <div className="text-sm font-medium"></div>
                {MONTHS.map(month => (
                  <div key={month} className="text-center text-sm font-medium bg-muted rounded px-2 py-1">
                    {month}
                  </div>
                ))}
                <div className="text-center text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1">
                  TOTAL
                </div>
              </div>
              
              {/* Income Rows */}
              {incomeRows.map((row, rowIndex) => (
                <div key={row.id} className={`grid grid-cols-14 gap-1 p-4 border-b ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}>
                  <div className="text-sm font-medium flex items-center">{row.label}</div>
                  {row.values.map((value, monthIndex) => (
                    <Input
                      key={monthIndex}
                      type="number"
                      step="0.01"
                      value={value || ''}
                      onChange={(e) => updateIncomeValue(row.id, monthIndex, e.target.value)}
                      className="text-center text-sm h-8"
                      placeholder="0.00"
                    />
                  ))}
                  <div className="text-center text-sm font-semibold bg-muted rounded px-2 py-1 flex items-center justify-center">
                    {formatCurrency(row.values.reduce((sum, val) => sum + val, 0))}
                  </div>
                </div>
              ))}
              
              {/* Total Income Row */}
              <div className="grid grid-cols-14 gap-1 p-4 bg-muted/20 font-semibold">
                <div className="text-sm flex items-center">Total Income</div>
                {totalIncome.map((total, index) => (
                  <div key={index} className="text-center text-sm bg-muted rounded px-2 py-1 flex items-center justify-center">
                    {formatCurrency(total)}
                  </div>
                ))}
                <div className="text-center text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1 flex items-center justify-center">
                  {formatCurrency(totalIncome.reduce((sum, val) => sum + val, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Expenses</h3>
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExpenseDropdown(!showExpenseDropdown)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add expense category...
              </Button>
              
              {showExpenseDropdown && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-white border rounded-md shadow-lg z-50">
                  <div className="p-3 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search expense categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCategories.map(category => (
                      <button
                        key={category.id}
                        onClick={() => addExpenseCategory(category)}
                        className="w-full text-left p-3 hover:bg-muted text-sm border-b last:border-b-0"
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <div className="grid grid-cols-14 gap-1 p-4 border-b bg-muted/30">
                <div className="text-sm font-medium"></div>
                {MONTHS.map(month => (
                  <div key={month} className="text-center text-sm font-medium bg-muted rounded px-2 py-1">
                    {month}
                  </div>
                ))}
                <div className="text-center text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1">
                  TOTAL
                </div>
              </div>
              
              {/* Expense Rows */}
              {expenseRows.map((row, rowIndex) => (
                <div key={row.id} className={`grid grid-cols-14 gap-1 p-4 border-b ${rowIndex % 2 === 0 ? 'bg-white' : 'bg-muted/10'}`}>
                  <div className="text-sm font-medium flex items-center justify-between">
                    <span className="flex-1 mr-2">{row.label}</span>
                    {row.removable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeExpenseCategory(row.id)}
                        className="h-5 w-5 p-0 hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {row.values.map((value, monthIndex) => (
                    <Input
                      key={monthIndex}
                      type="number"
                      step="0.01"
                      value={value || ''}
                      onChange={(e) => updateExpenseValue(row.id, monthIndex, e.target.value)}
                      className="text-center text-sm h-8"
                      placeholder="0.00"
                    />
                  ))}
                  <div className="text-center text-sm font-semibold bg-muted rounded px-2 py-1 flex items-center justify-center">
                    {formatCurrency(row.values.reduce((sum, val) => sum + val, 0))}
                  </div>
                </div>
              ))}
              
              {/* Total Expenses Row */}
              <div className="grid grid-cols-14 gap-1 p-4 bg-muted/20 font-semibold">
                <div className="text-sm flex items-center">Total Expenses</div>
                {totalExpenses.map((total, index) => (
                  <div key={index} className="text-center text-sm bg-muted rounded px-2 py-1 flex items-center justify-center">
                    {formatCurrency(total)}
                  </div>
                ))}
                <div className="text-center text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1 flex items-center justify-center">
                  {formatCurrency(totalExpenses.reduce((sum, val) => sum + val, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Net Income Section */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-foreground">Net Income (Income - Expenses)</h3>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Header Row */}
              <div className="grid grid-cols-14 gap-1 p-4 border-b bg-muted/30">
                <div className="text-sm font-medium"></div>
                {MONTHS.map(month => (
                  <div key={month} className="text-center text-sm font-medium bg-muted rounded px-2 py-1">
                    {month}
                  </div>
                ))}
                <div className="text-center text-sm font-bold bg-primary text-primary-foreground rounded px-2 py-1">
                  TOTAL
                </div>
              </div>
              
              {/* Net Income Row */}
              <div className="grid grid-cols-14 gap-1 p-4">
                <div className="text-sm font-medium flex items-center">Net Income (Income - Expenses)</div>
                {netIncome.map((net, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "text-center text-sm font-bold rounded px-2 py-1 flex items-center justify-center",
                      net >= 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    )}
                  >
                    {formatCurrency(net)}
                  </div>
                ))}
                <div className={cn(
                  "text-center text-sm font-bold rounded px-2 py-1 flex items-center justify-center",
                  netIncome.reduce((sum, val) => sum + val, 0) >= 0 
                    ? "bg-green-500 text-white" 
                    : "bg-red-500 text-white"
                )}>
                  {formatCurrency(netIncome.reduce((sum, val) => sum + val, 0))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeExpenseTracker;