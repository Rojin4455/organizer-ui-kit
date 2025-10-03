import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, X, Search, ArrowLeft, Save, Download, Trash2, Edit2, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import { cn } from '@/lib/utils';
import { businessLogo } from '../assets';
import { apiService } from '../services/api';
import { toast } from '@/hooks/use-toast';

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

interface BusinessTab {
  id: string;
  name: string;
  incomeRows: IncomeRow[];
  expenseRows: ExpenseRow[];
}

const IncomeExpenseTracker = () => {
  const navigate = useNavigate();
  
  const createDefaultBusinessTab = (id: string, name: string): BusinessTab => ({
    id,
    name,
    incomeRows: [
      { id: '1099', label: '1099', values: new Array(12).fill(0) },
      { id: 'other-income', label: 'Other Income', values: new Array(12).fill(0) }
    ],
    expenseRows: [
      { id: 'accounting', label: 'Accounting Fees', values: new Array(12).fill(0), removable: true },
      { id: 'bank-fees', label: 'Bank and Credit Card Fees', values: new Array(12).fill(0), removable: true },
      { id: 'misc', label: 'Miscellaneous - Other PLEASE DESCRIBE', values: new Array(12).fill(0), removable: true }
    ]
  });

  const [businessTabs, setBusinessTabs] = useState<BusinessTab[]>([
    createDefaultBusinessTab('business-1', 'Business 1')
  ]);
  const [activeTabId, setActiveTabId] = useState('business-1');
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editingTabName, setEditingTabName] = useState('');

  const [showExpenseDropdown, setShowExpenseDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [customExpenseLabel, setCustomExpenseLabel] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Get current active business tab
  const activeTab = businessTabs.find(tab => tab.id === activeTabId) || businessTabs[0];
  const incomeRows = activeTab.incomeRows;
  const expenseRows = activeTab.expenseRows;

  // Load data on component mount
  useEffect(() => {
    loadTrackerData();
  }, []);

  const loadTrackerData = async () => {
    setLoading(true);
    try {
      const response = await apiService.getAllTrackers();
      
      // Response is an array of trackers
      if (response && Array.isArray(response) && response.length > 0) {
        const loadedTabs = response.map(tracker => ({
          id: tracker.id.toString(),
          name: tracker.tab_name,
          incomeRows: tracker.income || [],
          expenseRows: tracker.expenses || []
        }));
        
        setBusinessTabs(loadedTabs);
        setActiveTabId(loadedTabs[0].id);
        toast({
          title: "Data loaded",
          description: `${loadedTabs.length} business tracker(s) loaded successfully.`,
        });
      }
    } catch (error) {
      console.error('Error loading tracker data:', error);
      if (error.message && !error.message.includes('404')) {
        toast({
          title: "Error",
          description: "Failed to load tracker data. Using default empty state.",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const saveTrackerData = async () => {
    setSaving(true);
    try {
      // Get existing trackers to check which ones already exist
      const existingTrackers = await apiService.getAllTrackers();
      const existingIds = new Set(existingTrackers.map(t => t.id.toString()));
      
      // Separate new and existing tabs
      const newTabs = businessTabs.filter(tab => !existingIds.has(tab.id));
      const existingTabs = businessTabs.filter(tab => existingIds.has(tab.id));
      
      // Create new trackers
      if (newTabs.length > 0) {
        const newTrackersData = newTabs.map(tab => ({
          tab_name: tab.name,
          income: tab.incomeRows,
          expenses: tab.expenseRows
        }));
        
        const createResponse = await apiService.createTrackers(newTrackersData);
        
        // Update local state with server-assigned IDs
        if (createResponse.created && createResponse.created.length > 0) {
          const updatedTabs = businessTabs.map(tab => {
            const serverTab = createResponse.created.find(st => st.tab_name === tab.name);
            return serverTab ? { ...tab, id: serverTab.id.toString() } : tab;
          });
          setBusinessTabs(updatedTabs);
        }
      }
      
      // Update existing trackers
      for (const tab of existingTabs) {
        await apiService.updateTracker({
          id: parseInt(tab.id),
          tab_name: tab.name,
          income: tab.incomeRows,
          expenses: tab.expenseRows
        });
      }
      
      toast({
        title: "Saved",
        description: "All business data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving tracker data:', error);
      toast({
        title: "Error",
        description: "Failed to save tracker data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const resetCurrentTabData = async () => {
    setDeleting(true);
    try {
      // Reset only the current tab
      setBusinessTabs(prev => prev.map(tab => 
        tab.id === activeTabId 
          ? createDefaultBusinessTab(tab.id, tab.name)
          : tab
      ));
      
      toast({
        title: "Reset Complete",
        description: `Data for "${activeTab.name}" has been reset.`,
      });
    } catch (error) {
      console.error('Error resetting tracker data:', error);
      toast({
        title: "Error",
        description: "Failed to reset tracker data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // Tab management functions
  const addBusinessTab = () => {
    if (businessTabs.length >= 10) {
      toast({
        title: "Maximum Tabs Reached",
        description: "You can only have up to 10 business tabs.",
        variant: "destructive",
      });
      return;
    }

    const newTabNumber = businessTabs.length + 1;
    const newTab = createDefaultBusinessTab(
      `business-${Date.now()}`,
      `Business ${newTabNumber}`
    );
    setBusinessTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    toast({
      title: "Business Added",
      description: `"Business ${newTabNumber}" has been added.`,
    });
  };

  const startEditingTab = (tabId: string, currentName: string) => {
    setEditingTabId(tabId);
    setEditingTabName(currentName);
  };

  const saveTabName = () => {
    if (!editingTabName.trim()) {
      toast({
        title: "Invalid Name",
        description: "Business name cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    setBusinessTabs(prev => prev.map(tab =>
      tab.id === editingTabId
        ? { ...tab, name: editingTabName.trim() }
        : tab
    ));
    setEditingTabId(null);
    setEditingTabName('');
    toast({
      title: "Name Updated",
      description: "Business name has been updated.",
    });
  };

  const cancelEditingTab = () => {
    setEditingTabId(null);
    setEditingTabName('');
  };

  const downloadCurrentPDF = () => {
    downloadBusinessPDF(activeTab);
  };

  const downloadAllPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a3');
    let isFirstBusiness = true;

    businessTabs.forEach((tab, tabIndex) => {
      if (!isFirstBusiness) {
        doc.addPage();
      }
      isFirstBusiness = false;
      
      addBusinessToPDF(doc, tab, tabIndex + 1, businessTabs.length);
    });

    // Add summary page
    addAllBusinessSummaryPage(doc);
    
    doc.save('all-businesses-income-expense-tracker-2025.pdf');
  };

  const addAllBusinessSummaryPage = (doc: jsPDF) => {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Title
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('ALL BUSINESSES SUMMARY', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Calculate totals for all businesses
    const allBusinessesTotals = businessTabs.map(tab => {
      const income = tab.incomeRows.reduce((sum, row) => 
        sum + row.values.reduce((s, v) => s + v, 0), 0);
      const expenses = tab.expenseRows.reduce((sum, row) => 
        sum + row.values.reduce((s, v) => s + v, 0), 0);
      return {
        name: tab.name,
        income,
        expenses,
        net: income - expenses
      };
    });

    // Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Business', margin, yPos);
    doc.text('Total Income', margin + 100, yPos);
    doc.text('Total Expenses', margin + 180, yPos);
    doc.text('Net Income', margin + 260, yPos);
    yPos += 8;

    doc.setFont('helvetica', 'normal');
    allBusinessesTotals.forEach(business => {
      doc.text(business.name, margin, yPos);
      doc.text(formatCurrency(business.income), margin + 100, yPos);
      doc.text(formatCurrency(business.expenses), margin + 180, yPos);
      const color = business.net >= 0 ? [0, 120, 0] : [180, 0, 0];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(formatCurrency(business.net), margin + 260, yPos);
      doc.setTextColor(40, 40, 40);
      yPos += 8;
    });

    // Grand totals
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const grandIncome = allBusinessesTotals.reduce((sum, b) => sum + b.income, 0);
    const grandExpenses = allBusinessesTotals.reduce((sum, b) => sum + b.expenses, 0);
    const grandNet = grandIncome - grandExpenses;

    doc.text('GRAND TOTALS', margin, yPos);
    doc.text(formatCurrency(grandIncome), margin + 100, yPos);
    doc.text(formatCurrency(grandExpenses), margin + 180, yPos);
    const finalColor = grandNet >= 0 ? [0, 120, 0] : [180, 0, 0];
    doc.setTextColor(finalColor[0], finalColor[1], finalColor[2]);
    doc.text(formatCurrency(grandNet), margin + 260, yPos);
  };

  const addBusinessToPDF = (doc: jsPDF, tab: BusinessTab, businessNumber: number, totalBusinesses: number) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const bottomMargin = 20;
    let currentPage = 1;
    const incomeRows = tab.incomeRows;
    const expenseRows = tab.expenseRows;
    const totalIncome = calculateTotals(incomeRows);
    const totalExpenses = calculateTotals(expenseRows);
    const netIncome = totalIncome.map((income, index) => income - totalExpenses[index]);

    const formatCurrencyCompact = (amount: number): string => {
      if (amount === 0) return '$0';
      const absAmount = Math.abs(amount);
      const sign = amount < 0 ? '-' : '';
      const formatted = absAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
      const cleanFormatted = formatted.replace(/\.00$/, '');
      return `${sign}$${cleanFormatted}`;
    };

    const addPageHeader = () => {
      if (currentPage === 1) {
        try {
          const logoWidth = 25;
          const logoHeight = 18;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(businessLogo, 'PNG', logoX, 8, logoWidth, logoHeight);
        } catch (error) {
          console.warn('Could not add logo to PDF:', error);
        }
        
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('SELF-EMPLOYED INCOME & EXPENSE LOG', pageWidth / 2, 35, { align: 'center' });
        
        doc.setFontSize(16);
        doc.setTextColor(60, 60, 60);
        doc.text(`${tab.name} (${businessNumber} of ${totalBusinesses})`, pageWidth / 2, 45, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Advanced Tax Group - 2025 Tax Year', pageWidth / 2, 53, { align: 'center' });
        
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 58, pageWidth - 20, 58);
      }
      
      if (currentPage > 1) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`${tab.name} - Page ${currentPage}`, pageWidth - 30, pageHeight - 10);
      }
    };

    const checkNewPage = (requiredHeight: number): number => {
      if (yPos + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        currentPage++;
        addPageHeader();
        return currentPage === 1 ? 68 : 20;
      }
      return yPos;
    };

    const availableWidth = pageWidth - (2 * margin);
    const labelWidth = Math.min(80, availableWidth * 0.25);
    const totalColWidth = Math.min(25, availableWidth * 0.08);
    const monthlyColsWidth = availableWidth - labelWidth - totalColWidth;
    const colWidth = monthlyColsWidth / 12;
    const startX = margin;
    
    addPageHeader();
    let yPos = 68;

    // Income Section
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('INCOME', startX, yPos);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 60, yPos + 2);
    yPos += 12;

    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const incomeTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', incomeTotalHeaderX, yPos, { align: 'center' });
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;

    incomeRows.forEach((row) => {
      yPos = checkNewPage(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      doc.text(row.label, startX, yPos);
      
      doc.setFontSize(8);
      row.values.forEach((value, index) => {
        const formattedValue = formatCurrencyCompact(value);
        const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
        doc.text(formattedValue, cellX, yPos, { align: 'right' });
      });
      
      const rowTotal = row.values.reduce((sum, val) => sum + val, 0);
      const totalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrencyCompact(rowTotal), totalX, yPos, { align: 'right' });
      yPos += 8;
    });

    yPos = checkNewPage(10);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Total Income', startX, yPos);
    
    totalIncome.forEach((total, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      doc.text(formatCurrencyCompact(total), cellX, yPos, { align: 'right' });
    });
    const grandTotalIncome = totalIncome.reduce((sum, val) => sum + val, 0);
    const incomeTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    doc.text(formatCurrencyCompact(grandTotalIncome), incomeTotalX, yPos, { align: 'right' });
    yPos += 20;

    // Expenses Section
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('EXPENSES', startX, yPos);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 70, yPos + 2);
    yPos += 12;

    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const expenseTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', expenseTotalHeaderX, yPos, { align: 'center' });
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;

    expenseRows.forEach((row) => {
      yPos = checkNewPage(12);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      doc.text(row.label, startX, yPos);
      
      doc.setFontSize(8);
      row.values.forEach((value, index) => {
        const formattedValue = formatCurrencyCompact(value);
        const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
        doc.text(formattedValue, cellX, yPos, { align: 'right' });
      });
      
      const rowTotal = row.values.reduce((sum, val) => sum + val, 0);
      const totalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrencyCompact(rowTotal), totalX, yPos, { align: 'right' });
      yPos += 8;
    });

    yPos = checkNewPage(10);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Total Expenses', startX, yPos);
    
    totalExpenses.forEach((total, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      doc.text(formatCurrencyCompact(total), cellX, yPos, { align: 'right' });
    });
    const grandTotalExpenses = totalExpenses.reduce((sum, val) => sum + val, 0);
    const expenseTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    doc.text(formatCurrencyCompact(grandTotalExpenses), expenseTotalX, yPos, { align: 'right' });
    yPos += 20;

    // Net Income Section
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('NET INCOME (Income - Expenses)', startX, yPos);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 100, yPos + 2);
    yPos += 12;

    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const netTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', netTotalHeaderX, yPos, { align: 'center' });
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;

    yPos = checkNewPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Net Income', startX, yPos);
    
    netIncome.forEach((net, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      const color = net >= 0 ? [0, 120, 0] : [180, 0, 0];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(formatCurrencyCompact(net), cellX, yPos, { align: 'right' });
    });
    
    const grandNetIncome = netIncome.reduce((sum, val) => sum + val, 0);
    const netTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    const finalColor = grandNetIncome >= 0 ? [0, 120, 0] : [180, 0, 0];
    doc.setTextColor(finalColor[0], finalColor[1], finalColor[2]);
    doc.setFontSize(11);
    doc.text(formatCurrencyCompact(grandNetIncome), netTotalX, yPos, { align: 'right' });
    
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(startX, yPos + 5, pageWidth - margin, yPos + 5);
  };

  const downloadBusinessPDF = (tab: BusinessTab) => {
    const doc = new jsPDF('l', 'mm', 'a3');
    addBusinessToPDF(doc, tab, 1, 1);
    doc.save(`${tab.name.toLowerCase().replace(/\s+/g, '-')}-income-expense-tracker-2025.pdf`);
  };

  const downloadPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a3'); // A3 Landscape orientation for more space
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const bottomMargin = 20;
    let currentPage = 1;
    
    // Full currency formatter - displays complete numbers without shorthand
    const formatCurrencyCompact = (amount: number): string => {
      if (amount === 0) return '$0';
      
      const absAmount = Math.abs(amount);
      const sign = amount < 0 ? '-' : '';
      
      // Format with full digits and thousand separators
      const formatted = absAmount.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
      // Remove .00 if present
      const cleanFormatted = formatted.replace(/\.00$/, '');
      return `${sign}$${cleanFormatted}`;
    };
    
    // Function to add header to first page only
    const addPageHeader = () => {
      if (currentPage === 1) {
        // Add centered logo only on first page
        try {
          const logoWidth = 25;
          const logoHeight = 18;
          const logoX = (pageWidth - logoWidth) / 2;
          doc.addImage(businessLogo, 'PNG', logoX, 8, logoWidth, logoHeight);
        } catch (error) {
          console.warn('Could not add logo to PDF:', error);
        }
        
        // Header with better spacing
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(40, 40, 40);
        doc.text('SELF-EMPLOYED INCOME & EXPENSE LOG', pageWidth / 2, 35, { align: 'center' });
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        doc.text('Advanced Tax Group - 2025 Tax Year', pageWidth / 2, 45, { align: 'center' });
        
        // Add decorative line
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.line(20, 50, pageWidth - 20, 50);
      }
      
      // Add page number if not first page
      if (currentPage > 1) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${currentPage}`, pageWidth - 30, pageHeight - 10);
      }
    };
    
    // Function to check if we need a new page
    const checkNewPage = (requiredHeight: number): number => {
      if (yPos + requiredHeight > pageHeight - bottomMargin) {
        doc.addPage();
        currentPage++;
        addPageHeader();
        return currentPage === 1 ? 60 : 20; // Different start position for first vs other pages
      }
      return yPos;
    };
    
    // Dynamic column width calculation
    const availableWidth = pageWidth - (2 * margin);
    const labelWidth = Math.min(80, availableWidth * 0.25); // 25% for labels, max 80mm
    const totalColWidth = Math.min(25, availableWidth * 0.08); // 8% for total column, max 25mm
    const monthlyColsWidth = availableWidth - labelWidth - totalColWidth;
    const colWidth = monthlyColsWidth / 12; // Distribute remaining width among 12 months
    const startX = margin;
    
    // Add initial header
    addPageHeader();
    let yPos = 60;
    
    // Income Section with pagination support
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('INCOME', startX, yPos);
    
    // Add section underline
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 60, yPos + 2);
    yPos += 12;
    
    // Income table headers with better formatting
    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const incomeTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', incomeTotalHeaderX, yPos, { align: 'center' });
    
    // Add header underline
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;
    
    // Income rows with better formatting and pagination
    incomeRows.forEach((row, rowIndex) => {
      yPos = checkNewPage(12);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      
      // Handle long labels by wrapping text
      const maxLabelWidth = labelWidth - 5;
      const words = row.label.split(' ');
      let line = '';
      let lineY = yPos;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > maxLabelWidth && line !== '') {
          doc.text(line.trim(), startX, lineY);
          line = words[i] + ' ';
          lineY += 4;
        } else {
          line = testLine;
        }
      }
      doc.text(line.trim(), startX, lineY);
      
      // Values with right alignment and compact formatting
      doc.setFontSize(8);
      row.values.forEach((value, index) => {
        const formattedValue = formatCurrencyCompact(value);
        const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
        doc.text(formattedValue, cellX, yPos, { align: 'right' });
      });
      
      // Row total with better positioning
      const rowTotal = row.values.reduce((sum, val) => sum + val, 0);
      const totalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrencyCompact(rowTotal), totalX, yPos, { align: 'right' });
      
      // Add subtle row separator
      if (rowIndex < incomeRows.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(startX, yPos + 3, pageWidth - margin, yPos + 3);
      }
      
      yPos += Math.max(8, lineY - yPos + 4);
    });
    
    // Income totals with highlighting
    yPos = checkNewPage(10);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Total Income', startX, yPos);
    
    totalIncome.forEach((total, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      doc.text(formatCurrencyCompact(total), cellX, yPos, { align: 'right' });
    });
    const grandTotalIncome = totalIncome.reduce((sum, val) => sum + val, 0);
    const incomeTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    doc.text(formatCurrencyCompact(grandTotalIncome), incomeTotalX, yPos, { align: 'right' });
    yPos += 20;
    
    // Expenses Section with pagination support  
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('EXPENSES', startX, yPos);
    
    // Add section underline
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 70, yPos + 2);
    yPos += 12;
    
    // Expense table headers with better formatting
    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const expenseTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', expenseTotalHeaderX, yPos, { align: 'center' });
    
    // Add header underline
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;
    
    // Expense rows with better formatting and pagination
    expenseRows.forEach((row, rowIndex) => {
      yPos = checkNewPage(12);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(40, 40, 40);
      doc.setFontSize(8);
      
      // Handle long labels by wrapping text
      const maxLabelWidth = labelWidth - 5;
      const words = row.label.split(' ');
      let line = '';
      let lineY = yPos;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const textWidth = doc.getTextWidth(testLine);
        
        if (textWidth > maxLabelWidth && line !== '') {
          doc.text(line.trim(), startX, lineY);
          line = words[i] + ' ';
          lineY += 4;
        } else {
          line = testLine;
        }
      }
      doc.text(line.trim(), startX, lineY);
      
      // Values with right alignment and compact formatting
      doc.setFontSize(8);
      row.values.forEach((value, index) => {
        const formattedValue = formatCurrencyCompact(value);
        const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
        doc.text(formattedValue, cellX, yPos, { align: 'right' });
      });
      
      // Row total with better positioning
      const rowTotal = row.values.reduce((sum, val) => sum + val, 0);
      const totalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrencyCompact(rowTotal), totalX, yPos, { align: 'right' });
      
      // Add subtle row separator
      if (rowIndex < expenseRows.length - 1) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.1);
        doc.line(startX, yPos + 3, pageWidth - margin, yPos + 3);
      }
      
      yPos += Math.max(8, lineY - yPos + 4);
    });
    
    // Expense totals with highlighting
    yPos = checkNewPage(10);
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos, pageWidth - margin, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Total Expenses', startX, yPos);
    
    totalExpenses.forEach((total, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      doc.text(formatCurrencyCompact(total), cellX, yPos, { align: 'right' });
    });
    const grandTotalExpenses = totalExpenses.reduce((sum, val) => sum + val, 0);
    const expenseTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    doc.text(formatCurrencyCompact(grandTotalExpenses), expenseTotalX, yPos, { align: 'right' });
    yPos += 20;
    
    // Net Income Section with pagination support
    yPos = checkNewPage(25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 40);
    doc.text('NET INCOME (Income - Expenses)', startX, yPos);
    
    // Add section underline
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.line(startX, yPos + 2, startX + 100, yPos + 2);
    yPos += 12;
    
    // Net income headers
    yPos = checkNewPage(15);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60, 60, 60);
    doc.text('Description', startX, yPos);
    MONTHS.forEach((month, index) => {
      const monthX = startX + labelWidth + (index * colWidth) + (colWidth / 2);
      doc.text(month.substring(0, 3), monthX, yPos, { align: 'center' });
    });
    const netTotalHeaderX = startX + labelWidth + (12 * colWidth) + (totalColWidth / 2);
    doc.text('TOTAL', netTotalHeaderX, yPos, { align: 'center' });
    
    // Add header underline
    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.2);
    doc.line(startX, yPos + 2, pageWidth - margin, yPos + 2);
    yPos += 8;
    
    // Net income row
    yPos = checkNewPage(10);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(40, 40, 40);
    doc.text('Net Income', startX, yPos);
    
    netIncome.forEach((net, index) => {
      const cellX = startX + labelWidth + (index * colWidth) + colWidth - 2;
      const color = net >= 0 ? [0, 120, 0] : [180, 0, 0]; // Green for positive, red for negative
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(formatCurrencyCompact(net), cellX, yPos, { align: 'right' });
    });
    
    const grandNetIncome = netIncome.reduce((sum, val) => sum + val, 0);
    const netTotalX = startX + labelWidth + (12 * colWidth) + totalColWidth - 2;
    const finalColor = grandNetIncome >= 0 ? [0, 120, 0] : [180, 0, 0];
    doc.setTextColor(finalColor[0], finalColor[1], finalColor[2]);
    doc.setFontSize(11);
    doc.text(formatCurrencyCompact(grandNetIncome), netTotalX, yPos, { align: 'right' });
    
    // Add final border
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(startX, yPos + 5, pageWidth - margin, yPos + 5);
    
    // Save the PDF
    doc.save('income-expense-tracker-2025.pdf');
  };

  const updateIncomeValue = useCallback((rowId: string, monthIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    setBusinessTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
            ...tab,
            incomeRows: tab.incomeRows.map(row =>
              row.id === rowId
                ? { ...row, values: row.values.map((v, i) => i === monthIndex ? numValue : v) }
                : row
            )
          }
        : tab
    ));
  }, [activeTabId]);

  const updateExpenseValue = useCallback((rowId: string, monthIndex: number, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value) || 0;
    setBusinessTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
            ...tab,
            expenseRows: tab.expenseRows.map(row =>
              row.id === rowId
                ? { ...row, values: row.values.map((v, i) => i === monthIndex ? numValue : v) }
                : row
            )
          }
        : tab
    ));
  }, [activeTabId]);

  const addExpenseCategory = useCallback((category: { id: string; label: string }) => {
    const newId = `expense-${Date.now()}`;
    setBusinessTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
            ...tab,
            expenseRows: [...tab.expenseRows, {
              id: newId,
              label: category.label,
              values: new Array(12).fill(0),
              removable: true
            }]
          }
        : tab
    ));
    setShowExpenseDropdown(false);
    setSearchTerm('');
  }, [activeTabId]);

  const addCustomExpenseCategory = useCallback(() => {
    if (customExpenseLabel.trim()) {
      const newId = `custom-expense-${Date.now()}`;
      setBusinessTabs(prev => prev.map(tab =>
        tab.id === activeTabId
          ? {
              ...tab,
              expenseRows: [...tab.expenseRows, {
                id: newId,
                label: customExpenseLabel.trim(),
                values: new Array(12).fill(0),
                removable: true
              }]
            }
          : tab
      ));
      setCustomExpenseLabel('');
      setShowCustomInput(false);
      setShowExpenseDropdown(false);
    }
  }, [customExpenseLabel, activeTabId]);

  const removeExpenseCategory = useCallback((rowId: string) => {
    setBusinessTabs(prev => prev.map(tab =>
      tab.id === activeTabId
        ? {
            ...tab,
            expenseRows: tab.expenseRows.filter(row => row.id !== rowId)
          }
        : tab
    ));
  }, [activeTabId]);

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
    



<div className="bg-white border-b shadow-sm">
  <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    {/* Responsive grid: stack on mobile, 3-cols on md+ */}
    <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
      
      {/* Left: Back Button */}
      <div className="flex justify-center md:justify-start">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="text-primary hover:bg-primary gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forms
        </Button>
      </div>

      {/* Center: Logo & Company Info */}
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary/5 rounded-lg p-2 flex-shrink-0">
            <img src={businessLogo} alt="ATG Advanced Tax Group" className="h-8 w-auto" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary">Advanced Tax Group</h1>
            <p className="text-sm text-muted-foreground">Professional Tax Services</p>
          </div>
        </div>
      </div>

      {/* Right: Tax Year */}
      <div className="flex justify-center md:justify-end text-center md:text-right">
        <div>
          <div className="text-2xl font-bold text-primary">2025</div>
          <div className="text-sm text-muted-foreground">Tax Year</div>
        </div>
      </div>
    </div>

    {/* Title */}
    <div className="mt-4 text-center">
  <h2 className="text-2xl font-bold text-foreground">
    SELF-EMPLOYED INCOME & EXPENSE LOG
  </h2>
  <p className="text-sm text-muted-foreground mt-1">
    Track your business income and expenses throughout the year
  </p>
</div>

{/* Business Tabs */}
<div className="mt-6">
  <Tabs value={activeTabId} onValueChange={setActiveTabId} className="w-full">
    <div className="flex items-center justify-between gap-4 mb-4">
      <TabsList className="bg-muted">
        {businessTabs.map(tab => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="relative group"
          >
            {editingTabId === tab.id ? (
              <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={editingTabName}
                  onChange={(e) => setEditingTabName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveTabName();
                    if (e.key === 'Escape') cancelEditingTab();
                  }}
                  className="h-6 w-32 text-sm"
                  autoFocus
                />
                <Button size="sm" variant="ghost" onClick={saveTabName} className="h-6 w-6 p-0">
                  <Save className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={cancelEditingTab} className="h-6 w-6 p-0">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {tab.name}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    startEditingTab(tab.id, tab.name);
                  }}
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
      
      <Button
        onClick={addBusinessTab}
        disabled={businessTabs.length >= 10}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Business {businessTabs.length >= 10 && '(Max 10)'}
      </Button>
    </div>
  </Tabs>
</div>

{/* Action Buttons */}
<div className="mt-6 flex flex-col sm:flex-row justify-center sm:justify-end gap-3 flex-wrap">
  <Button 
    onClick={downloadCurrentPDF}
    variant="outline"
    className="gap-2"
  >
    <Download className="h-4 w-4" />
    Download Current PDF
  </Button>

  <Button 
    onClick={downloadAllPDF}
    variant="outline"
    className="gap-2"
  >
    <FileDown className="h-4 w-4" />
    Download All PDF
  </Button>

  <AlertDialog>
    <AlertDialogTrigger asChild>
      <Button 
        variant="destructive"
        disabled={deleting}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {deleting ? 'Resetting...' : 'Reset Current Tab'}
      </Button>
    </AlertDialogTrigger>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>
          Reset "{activeTab.name}"?
        </AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete all income and expense data for "{activeTab.name}" and reset it to default values.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <AlertDialogAction 
          onClick={resetCurrentTabData} 
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          Yes, reset this tab
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <Button 
    onClick={saveTrackerData}
    disabled={saving}
    className="gap-2"
  >
    <Save className="h-4 w-4" />
    {saving ? 'Saving...' : 'Save All'}
  </Button>
</div>
  </div>
    
      <div className="max-w-8xl mx-auto p-6 space-y-8">
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
                            type="text"
                            inputMode="decimal"
                            value={value === 0 ? '' : value.toString()}
                            onChange={(e) => updateIncomeValue(row.id, monthIndex, e.target.value)}
                            onKeyDown={(e) => {
                              // Prevent 'e', 'E', '+', '-'
                              if (['e', 'E', '+', '-'].includes(e.key)) {
                                e.preventDefault();
                              }
                              // Prevent multiple dots
                              if (e.key === '.' && e.currentTarget.value.includes('.')) {
                                e.preventDefault();
                              }
                            }}
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
                          key={category.id}
                          onClick={() => addExpenseCategory(category)}
                          className="w-full text-left p-3 hover:bg-muted text-sm border-b last:border-b-0"
                        >
                          {category.label}
                        </button>
                      ))}
                      
                      {/* Custom expense input section */}
                      <div className="border-t bg-muted/50">
                        {!showCustomInput ? (
                          <button
                            onClick={() => setShowCustomInput(true)}
                            className="w-full text-left p-3 hover:bg-muted text-sm font-medium text-primary"
                          >
                            <Plus className="inline h-4 w-4 mr-2" />
                            Add Custom Expense Category
                          </button>
                        ) : (
                          <div className="p-3 space-y-2">
                            <Input
                              placeholder="Enter custom expense category..."
                              value={customExpenseLabel}
                              onChange={(e) => setCustomExpenseLabel(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  addCustomExpenseCategory();
                                } else if (e.key === 'Escape') {
                                  setShowCustomInput(false);
                                  setCustomExpenseLabel('');
                                }
                              }}
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={addCustomExpenseCategory}
                                disabled={!customExpenseLabel.trim()}
                                className="flex-1"
                              >
                                Add
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowCustomInput(false);
                                  setCustomExpenseLabel('');
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
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
                            type="text"
                            inputMode="decimal"
                            value={value === 0 ? '' : value.toString()}
                            onChange={(e) => updateExpenseValue(row.id, monthIndex, e.target.value)}
                            onKeyDown={(e) => {
                              // Prevent 'e', 'E', '+', '-'
                              if (['e', 'E', '+', '-'].includes(e.key)) {
                                e.preventDefault();
                              }
                              // Prevent multiple dots
                              if (e.key === '.' && e.currentTarget.value.includes('.')) {
                                e.preventDefault();
                              }
                            }}
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