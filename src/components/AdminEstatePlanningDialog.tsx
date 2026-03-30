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
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import { User, Users, ScrollText, Landmark } from 'lucide-react';
import { apiService } from '../services/api';
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
  setStaffNotes,
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
    onSaved?.();
  }, [onSaved]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { maxHeight: '92vh' } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        Estate Planning Questionnaire
        {detail?.id && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
            ID: {detail.id}
          </Typography>
        )}
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
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={loading || !detail || saving}
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
