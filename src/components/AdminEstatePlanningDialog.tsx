import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import { User, Users, ScrollText, Landmark } from 'lucide-react';
import { apiService } from '../services/api';
import businessLogo from '../assets/New-log.png';
import {
  EstateFormProvider,
  useEstateForm,
  staffRecordToFormData,
  packAllStepsForStaffPatch,
} from '../contexts/EstateFormContext';
import Step1Personal from './estate-planning/Step1Personal';
import Step2Heirs from './estate-planning/Step2Heirs';
import Step3TrustDistribution from './estate-planning/Step3TrustDistribution';
import Step4Financials from './estate-planning/Step4Financials';

export interface EstatePlanningStaffRecord {
  id: string;
  user?: string;
  status: string;
  current_step: number;
  step1_personal?: Record<string, unknown>;
  step2_heirs_legal?: Record<string, unknown>;
  step3_distribution?: Record<string, unknown>;
  step4_financials?: Record<string, unknown>;
  staff_notes?: string;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface AdminEstatePlanningDialogProps {
  open: boolean;
  submissionId: string | null;
  onClose: () => void;
  onSaved?: () => void;
}

const ADMIN_ESTATE_STEPS = [
  { id: 1, title: 'Personal Information', description: 'Demographics & contact', icon: User },
  { id: 2, title: 'Heirs & Legal', description: 'Dependents & fiduciaries', icon: Users },
  { id: 3, title: 'Trust Distribution', description: 'Allocation & contingencies', icon: ScrollText },
  { id: 4, title: 'Financial & Property', description: 'Assets & real estate', icon: Landmark },
];

const STEP_PANELS = [
  <Step1Personal key="s1" />,
  <Step2Heirs key="s2" />,
  <Step3TrustDistribution key="s3" />,
  <Step4Financials key="s4" />,
];

const AdminEstateEditorInner: React.FC<{
  tab: number;
  setTab: (v: number) => void;
  staffNotes: string;
  setStaffNotes: (v: string) => void;
  submissionId: string;
  detailUpdatedAt?: string;
  saveHandlerRef: React.MutableRefObject<(() => Promise<void>) | null>;
  onSaveSuccess: (rec: EstatePlanningStaffRecord) => void;
  onSaveError: (msg: string | null) => void;
  setSaving: (v: boolean) => void;
}> = ({
  tab,
  setTab,
  staffNotes,
  setStaffNotes: _setStaffNotes,
  submissionId,
  detailUpdatedAt,
  saveHandlerRef,
  onSaveSuccess,
  onSaveError,
  setSaving,
}) => {
  const { formData } = useEstateForm();

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        staff_notes: staffNotes,
        ...packAllStepsForStaffPatch(formData),
      };
      const updated = await apiService.patchEstatePlanningStaffEdit(submissionId, payload, {
        useAdminToken: true,
      });
      onSaveSuccess(updated as EstatePlanningStaffRecord);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      onSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [staffNotes, formData, submissionId, onSaveSuccess, onSaveError, setSaving]);

  saveHandlerRef.current = handleSave;

  return (
    <>
      {/* Staff notes — re-enable when needed (restore TextField in @mui/material imports).
      <TextField
        fullWidth
        size="small"
        label="Staff notes"
        multiline
        minRows={2}
        value={staffNotes}
        onChange={(e) => setStaffNotes(e.target.value)}
        sx={{ mb: 2 }}
      />
      */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        {ADMIN_ESTATE_STEPS.map((s, i) => (
          <Tab key={s.id} label={s.title} value={i} sx={{ textTransform: 'none' }} />
        ))}
      </Tabs>
      <div className="max-h-[58vh] overflow-y-auto overflow-x-hidden pr-2 -mr-2">
        {STEP_PANELS.map((panel, i) => (
          <Box key={i} hidden={tab !== i} sx={{ display: tab === i ? 'block' : 'none' }}>
            {panel}
          </Box>
        ))}
      </div>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Last updated: {detailUpdatedAt ? new Date(detailUpdatedAt).toLocaleString() : '—'}
      </Typography>
    </>
  );
};

const AdminEstatePlanningDialog: React.FC<AdminEstatePlanningDialogProps> = ({
  open,
  submissionId,
  onClose,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<EstatePlanningStaffRecord | null>(null);
  const [tab, setTab] = useState(0);
  const [staffNotes, setStaffNotes] = useState('');
  /** When true, questionnaire fields are read-only. Default on when opening the dialog. */
  const [viewOnly, setViewOnly] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const saveHandlerRef = useRef<(() => Promise<void>) | null>(null);

  const loadDetail = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEstatePlanningStaffDetail(submissionId, {
        useAdminToken: true,
      });
      setDetail(data as EstatePlanningStaffRecord);
      setStaffNotes(((data as EstatePlanningStaffRecord).staff_notes as string) || '');
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load submission';
      setError(msg);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId]);

  useEffect(() => {
    if (open && submissionId) {
      setTab(0);
      setViewOnly(true);
      void loadDetail();
    }
  }, [open, submissionId, loadDetail]);

  useEffect(() => {
    if (detail?.staff_notes !== undefined) {
      setStaffNotes(detail.staff_notes || '');
    }
  }, [detail?.id, detail?.staff_notes]);

  const handleSaveSuccess = useCallback((rec: EstatePlanningStaffRecord) => {
    setDetail(rec);
    setStaffNotes(rec.staff_notes || '');
    setError(null);
    setViewOnly(true);
    onSaved?.();
  }, [onSaved]);

  const canSave = Boolean(detail) && !loading && !saving && !viewOnly;
  const toTitleCase = (text: string) =>
    text
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  const prettyKeyLabel = (key: string) =>
    toTitleCase(
      key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    );

  const stringifyValue = (value: unknown, depth = 0): string => {
    const indent = '  '.repeat(depth);
    const nextIndent = '  '.repeat(depth + 1);

    if (value === null || value === undefined || value === '') return '___';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'number') return String(value);
    if (typeof value === 'string') return value.trim() ? value : '___';

    if (Array.isArray(value)) {
      if (value.length === 0) return '___';
      return value
        .map((item, index) => {
          if (item && typeof item === 'object') {
            const objEntries = Object.entries(item as Record<string, unknown>);
            if (objEntries.length === 0) return `${indent}${index + 1}. ___`;
            const lines = objEntries.map(([k, v]) => {
              const prettyK = prettyKeyLabel(k);
              return `${nextIndent}${prettyK}: ${stringifyValue(v, depth + 1)}`;
            });
            return `${indent}${index + 1}.\n${lines.join('\n')}`;
          }
          return `${indent}${index + 1}. ${stringifyValue(item, depth + 1)}`;
        })
        .join('\n');
    }

    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '___';
      return entries
        .map(([k, v]) => {
          const prettyK = prettyKeyLabel(k);
          return `${prettyK}: ${stringifyValue(v, depth + 1)}`;
        })
        .join('\n');
    }

    return String(value);
  };

  const addSectionRows = (
    doc: {
      addPage: () => void;
      setFontSize: (size: number) => void;
      setFont: (fontName: string, fontStyle: string) => void;
      setFillColor: (r: number, g: number, b: number) => void;
      setTextColor: (r: number, g: number, b: number) => void;
      setDrawColor: (r: number, g: number, b: number) => void;
      setLineWidth: (width: number) => void;
      rect: (x: number, y: number, w: number, h: number, style?: string) => void;
      line: (x1: number, y1: number, x2: number, y2: number) => void;
      text: (text: string, x: number, y: number) => void;
      splitTextToSize: (text: string, maxWidth: number) => string[];
      getTextWidth: (text: string) => number;
      setPage: (pageNumber: number) => void;
    },
    startY: number,
    title: string,
    payload?: Record<string, unknown>
  ) => {
    let y = startY;
    const margin = 14;
    const pageHeight = 297;
    const lineHeight = 5.6;
    const maxWidth = 176;

    const ensureSpace = (required = 10) => {
      if (y + required > pageHeight - 14) {
        doc.addPage();
        y = 16;
      }
    };

    ensureSpace(16);
    doc.setFillColor(247, 250, 252);
    doc.rect(margin - 2, y - 5, maxWidth + 8, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(title, margin, y);
    y += 9;

    const entries = Object.entries(payload || {});
    const personalInfoOrder = [
      'fullName',
      'aliases',
      'dateOfBirth',
      'status',
      'rentOrOwn',
      'occupation',
      'email',
      'phone',
      'streetAddress',
      'city',
      'state',
      'postalCode',
      'country',
    ];
    const orderedEntries =
      title === 'Personal Information'
        ? [
            ...personalInfoOrder
              .filter((key) => Object.prototype.hasOwnProperty.call(payload || {}, key))
              .map((key) => [key, (payload as Record<string, unknown>)[key]] as [string, unknown]),
            ...entries.filter(([key]) => !personalInfoOrder.includes(key)),
          ]
        : entries;

    if (orderedEntries.length === 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('No data', margin, y);
      return y + 8;
    }

    doc.setFontSize(10);
    orderedEntries.forEach(([key, val]) => {
      const prettyKey = prettyKeyLabel(key);
      const valueText = stringifyValue(val);
      const keyText = `${prettyKey}:`;
      const isStructuredValue =
        (Array.isArray(val) && val.length > 0) ||
        (val !== null && typeof val === 'object' && !Array.isArray(val) && Object.keys(val as Record<string, unknown>).length > 0);

      if (!isStructuredValue) {
        const labelColumnWidth = 68;
        const valueColumnStartX = margin + labelColumnWidth;
        const valueColumnWidth = maxWidth - labelColumnWidth;
        const inlineLines = doc.splitTextToSize(String(valueText), Math.max(valueColumnWidth, 40));
        ensureSpace(lineHeight + 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(keyText, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(inlineLines[0] || '___', valueColumnStartX, y);
        y += lineHeight;
        inlineLines.slice(1).forEach((line: string) => {
          ensureSpace(lineHeight + 2);
          doc.text(line, valueColumnStartX, y);
          y += lineHeight;
        });
      } else {
        ensureSpace(lineHeight + 2);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(keyText, margin, y);
        y += lineHeight;

        const valueLines = valueText.split('\n');
        valueLines.forEach((line) => {
          const wrapped = doc.splitTextToSize(line, maxWidth - 3);
          wrapped.forEach((part: string) => {
            ensureSpace(lineHeight + 2);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(15, 23, 42);
            doc.text(part, margin + 3, y);
            y += lineHeight;
          });
        });
      }
      y += 1.6;
    });
    return y + 5;
  };

  const handleDownloadPdf = async () => {
    if (!detail || downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const PAGE_WIDTH = 210;
      const PAGE_HEIGHT = 297;
      const MARGIN = 14;
      let y = 30;

      // Header band
      doc.setFillColor(240, 244, 248);
      doc.rect(0, 0, PAGE_WIDTH, 24, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(0, 24, PAGE_WIDTH, 24);
      try {
        doc.addImage(businessLogo, 'PNG', MARGIN, 4.5, 24, 14);
      } catch {
        // Logo embedding is optional; continue without blocking PDF generation.
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      doc.setTextColor(15, 23, 42);
      doc.text('Estate Planning Questionnaire', MARGIN + 28, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(71, 85, 105);
      doc.text(`Submission ID: ${detail.id}`, MARGIN, y);
      y += 6;
      doc.text(`Status: ${detail.status}`, MARGIN, y);
      y += 6;
      doc.text(
        `Submitted: ${detail.submitted_at ? new Date(detail.submitted_at).toLocaleString() : 'N/A'}`,
        MARGIN,
        y
      );
      y += 6;
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        MARGIN,
        y
      );
   

      doc.setDrawColor(226, 232, 240);

      y += 8;

      y = addSectionRows(doc, y, 'Personal Information', detail.step1_personal);
      y = addSectionRows(doc, y, 'Heirs & Legal', detail.step2_heirs_legal);
      y = addSectionRows(doc, y, 'Trust Distribution', detail.step3_distribution);
      y = addSectionRows(doc, y, 'Financial & Property', detail.step4_financials);

      // Footer on each page
      const totalPages = ((doc as unknown as { internal?: { pages?: unknown[] } }).internal?.pages?.length || 1) - 1 || 1;
      for (let i = 1; i <= totalPages; i += 1) {
        doc.setPage(i);
        doc.setFillColor(248, 250, 252);
        doc.rect(0, PAGE_HEIGHT - 12, PAGE_WIDTH, 12, 'F');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('Estate Planning Questionnaire', MARGIN, PAGE_HEIGHT - 5);
        doc.text(`Page ${i} of ${totalPages}`, PAGE_WIDTH - MARGIN - 18, PAGE_HEIGHT - 5);
      }

      doc.save(`estate-planning-${detail.id}.pdf`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to generate PDF';
      setError(msg);
    } finally {
      setDownloadingPdf(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxHeight: '92vh' } }}
    >
      <DialogTitle sx={{ fontWeight: 600, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          Estate Planning Questionnaire
          {detail?.id && (
            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
              ID: {detail.id}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          disabled={!detail || loading || downloadingPdf}
          onClick={() => void handleDownloadPdf()}
          sx={{
            textTransform: 'none',
            backgroundColor: '#2563eb',
            color: '#fff',
            '&:hover': { backgroundColor: '#1d4ed8' },
            whiteSpace: 'nowrap',
          }}
        >
          {downloadingPdf ? 'Generating PDF…' : 'Download PDF'}
        </Button>
      </DialogTitle>
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        )}
        {!loading && error && !detail && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {!loading && detail && submissionId && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <EstateFormProvider
              key={`${detail.id}-${detail.updated_at ?? ''}`}
              steps={ADMIN_ESTATE_STEPS}
              initialFormData={staffRecordToFormData(detail)}
              readOnly={viewOnly}
            >
              <AdminEstateEditorInner
                tab={tab}
                setTab={setTab}
                staffNotes={staffNotes}
                setStaffNotes={setStaffNotes}
                submissionId={submissionId}
                detailUpdatedAt={detail.updated_at}
                saveHandlerRef={saveHandlerRef}
                onSaveSuccess={handleSaveSuccess}
                onSaveError={(msg) => setError(msg)}
                setSaving={setSaving}
              />
            </EstateFormProvider>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ mr: 'auto' }}>
          <FormControlLabel
            control={
              <Switch
                checked={viewOnly}
                onChange={(_, checked) => setViewOnly(checked)}
                color="primary"
              />
            }
            label={<Typography variant="body2">View only</Typography>}
            sx={{ mr: 0, display: 'flex', alignItems: 'center' }}
          />
        </Box>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={!canSave}
          onClick={() => void saveHandlerRef.current?.()}
          sx={{ textTransform: 'none' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminEstatePlanningDialog;
