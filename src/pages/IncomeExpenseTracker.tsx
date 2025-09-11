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
  'Advertising & Marketing',
  'Business Credit Card Interest',
  'Business Licenses & Permits',
  'Cell Phone',
  'Computer Supplies/Service',
  'Consulting',
  'Cost of Goods Sold (ONLY ENTER AMOUNTS HERE IF YOU SELL PRODUCTS)',
  'Dues & Membership Fees',
  'Equipment Rental',
  'Insurance',
  'Legal & Professional Services',
  'Meals & Entertainment',
  'Office Supplies',
  'Rent or Lease',
  'Repairs & Maintenance',
  'Travel',
  'Utilities',
  'Vehicle Expenses',
  'Other Business Expenses'
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

  const addExpenseCategory = useCallback((category: string) => {
    const newId = `expense-${Date.now()}`;
    setExpenseRows(prev => [...prev, {
      id: newId,
      label: category,
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

  const filteredCategories = EXPENSE_CATEGORIES.filter(cat => 
    cat.toLowerCase().includes(searchTerm.toLowerCase())
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



      <Card className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground overflow-hidden">
          <CardHeader className="pb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                
                <div className="bg-white rounded-lg p-3 shadow-lg">
                  <img src={businessLogo} alt="ATG Advanced Tax Group" className="h-10 w-auto" loading="eager" />
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">Advanced Tax Group</h1>
                  <p className="text-primary-foreground/80 text-sm">Professional Tax Services</p>

                </div>
                
              </div>
              
              <div className="text-right">
                <div className="text-4xl font-bold">2025</div>
                <div className="text-primary-foreground/80 text-sm">Tax Year</div>
              </div>
            </div>
            <div className="mt-6 text-center">
              <CardTitle className="text-3xl font-bold tracking-wide">
                SELF-EMPLOYED INCOME & EXPENSE LOG
              </CardTitle>
            </div>
            
          </CardHeader>
        </Card>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Income Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 min-w-[200px]"></th>
                    {MONTHS.map(month => (
                      <th key={month} className="text-center p-3 min-w-[100px] text-sm font-medium bg-muted rounded-sm">
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-3 min-w-[120px] bg-blue-900 text-white rounded-sm font-bold">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeRows.map(row => (
                    <tr key={row.id} className="border-b">
                      <td className="p-3 font-medium">{row.label}</td>
                      {row.values.map((value, monthIndex) => (
                        <td key={monthIndex} className="p-2">
                          <Input
                            type="number"
                            value={value || ''}
                            onChange={(e) => updateIncomeValue(row.id, monthIndex, e.target.value)}
                            className="w-full text-center"
                            placeholder="0.00"
                          />
                        </td>
                      ))}
                      <td className="p-3 text-center font-semibold">
                        {formatCurrency(row.values.reduce((sum, val) => sum + val, 0))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td className="p-3">Total Income</td>
                    {totalIncome.map((total, index) => (
                      <td key={index} className="p-3 text-center">
                        {formatCurrency(total)}
                      </td>
                    ))}
                    <td className="p-3 text-center bg-blue-900 text-white rounded-sm">
                      {formatCurrency(totalIncome.reduce((sum, val) => sum + val, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold flex items-center justify-between">
              Expenses
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
                          key={category}
                          onClick={() => addExpenseCategory(category)}
                          className="w-full text-left p-3 hover:bg-muted text-sm border-b last:border-b-0"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 min-w-[200px]"></th>
                    {MONTHS.map(month => (
                      <th key={month} className="text-center p-3 min-w-[100px] text-sm font-medium bg-muted rounded-sm">
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-3 min-w-[120px] bg-blue-900 text-white rounded-sm font-bold">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {expenseRows.map(row => (
                    <tr key={row.id} className="border-b">
                      <td className="p-3 font-medium">
                        <div className="flex items-center justify-between">
                          <span>{row.label}</span>
                          {row.removable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExpenseCategory(row.id)}
                              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                      {row.values.map((value, monthIndex) => (
                        <td key={monthIndex} className="p-2">
                          <Input
                            type="number"
                            value={value || ''}
                            onChange={(e) => updateExpenseValue(row.id, monthIndex, e.target.value)}
                            className="w-full text-center"
                            placeholder="0.00"
                          />
                        </td>
                      ))}
                      <td className="p-3 text-center font-semibold">
                        {formatCurrency(row.values.reduce((sum, val) => sum + val, 0))}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted font-bold">
                    <td className="p-3">Total Expenses</td>
                    {totalExpenses.map((total, index) => (
                      <td key={index} className="p-3 text-center">
                        {formatCurrency(total)}
                      </td>
                    ))}
                    <td className="p-3 text-center bg-blue-900 text-white rounded-sm">
                      {formatCurrency(totalExpenses.reduce((sum, val) => sum + val, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Net Income Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Net Income (Income - Expenses)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 min-w-[200px]"></th>
                    {MONTHS.map(month => (
                      <th key={month} className="text-center p-3 min-w-[100px] text-sm font-medium bg-muted rounded-sm">
                        {month}
                      </th>
                    ))}
                    <th className="text-center p-3 min-w-[120px] bg-blue-900 text-white rounded-sm font-bold">
                      TOTAL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-medium">Net Income (Income - Expenses)</td>
                    {netIncome.map((net, index) => (
                      <td key={index} className={cn(
                        "p-3 text-center font-bold rounded-sm",
                        net >= 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                      )}>
                        {formatCurrency(net)}
                      </td>
                    ))}
                    <td className={cn(
                      "p-3 text-center font-bold rounded-sm",
                      netIncome.reduce((sum, val) => sum + val, 0) >= 0 
                        ? "bg-green-500 text-white" 
                        : "bg-red-500 text-white"
                    )}>
                      {formatCurrency(netIncome.reduce((sum, val) => sum + val, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IncomeExpenseTracker;