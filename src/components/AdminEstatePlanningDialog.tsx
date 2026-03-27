import React, { useEffect, useState, useCallback } from 'react';
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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { apiService } from '../services/api';

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

const STEP_KEYS = [
  { key: 'step1_personal' as const, label: 'Step 1 — Personal' },
  { key: 'step2_heirs_legal' as const, label: 'Step 2 — Heirs & Legal' },
  { key: 'step3_distribution' as const, label: 'Step 3 — Trust Distribution' },
  { key: 'step4_financials' as const, label: 'Step 4 — Financial & Property' },
];

function stringifyJson(value: unknown): string {
  if (value == null || (typeof value === 'object' && Object.keys(value as object).length === 0)) {
    return '{}';
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '{}';
  }
}

function parseJsonField(raw: string, fieldLabel: string): Record<string, unknown> {
  const t = raw.trim();
  if (!t) return {};
  try {
    const parsed = JSON.parse(t);
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Root must be a JSON object');
    }
    return parsed as Record<string, unknown>;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    throw new Error(`${fieldLabel}: ${msg}`);
  }
}

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

  const [status, setStatus] = useState('draft');
  const [currentStep, setCurrentStep] = useState(1);
  const [staffNotes, setStaffNotes] = useState('');
  const [json1, setJson1] = useState('{}');
  const [json2, setJson2] = useState('{}');
  const [json3, setJson3] = useState('{}');
  const [json4, setJson4] = useState('{}');

  const resetFromRecord = useCallback((rec: EstatePlanningStaffRecord) => {
    setStatus(rec.status || 'draft');
    setCurrentStep(rec.current_step ?? 1);
    setStaffNotes(rec.staff_notes || '');
    setJson1(stringifyJson(rec.step1_personal));
    setJson2(stringifyJson(rec.step2_heirs_legal));
    setJson3(stringifyJson(rec.step3_distribution));
    setJson4(stringifyJson(rec.step4_financials));
  }, []);

  const loadDetail = useCallback(async () => {
    if (!submissionId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getEstatePlanningStaffDetail(submissionId, {
        useAdminToken: true,
      });
      setDetail(data as EstatePlanningStaffRecord);
      resetFromRecord(data as EstatePlanningStaffRecord);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load submission';
      setError(msg);
      setDetail(null);
    } finally {
      setLoading(false);
    }
  }, [submissionId, resetFromRecord]);

  useEffect(() => {
    if (open && submissionId) {
      setTab(0);
      void loadDetail();
    }
  }, [open, submissionId, loadDetail]);

  const handleSave = async () => {
    if (!submissionId) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        status,
        current_step: Math.min(5, Math.max(1, Number(currentStep) || 1)),
        staff_notes: staffNotes,
        step1_personal: parseJsonField(json1, STEP_KEYS[0].label),
        step2_heirs_legal: parseJsonField(json2, STEP_KEYS[1].label),
        step3_distribution: parseJsonField(json3, STEP_KEYS[2].label),
        step4_financials: parseJsonField(json4, STEP_KEYS[3].label),
      };
      const updated = await apiService.patchEstatePlanningStaffEdit(submissionId, payload, {
        useAdminToken: true,
      });
      setDetail(updated as EstatePlanningStaffRecord);
      resetFromRecord(updated as EstatePlanningStaffRecord);
      onSaved?.();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Save failed';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const jsonValues = [json1, json2, json3, json4];
  const setJsonAt = (index: number, value: string) => {
    if (index === 0) setJson1(value);
    else if (index === 1) setJson2(value);
    else if (index === 2) setJson3(value);
    else setJson4(value);
  };

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
        {!loading && detail && (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="submitted">Submitted</MenuItem>
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Current step"
                type="number"
                value={currentStep}
                onChange={(e) => setCurrentStep(Number(e.target.value))}
                inputProps={{ min: 1, max: 5 }}
                sx={{ width: 120 }}
              />
              <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                Updated: {detail.updated_at ? new Date(detail.updated_at).toLocaleString() : '—'}
              </Typography>
            </Box>
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
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
            >
              {STEP_KEYS.map((s, i) => (
                <Tab key={s.key} label={s.label} value={i} />
              ))}
            </Tabs>
            {STEP_KEYS.map((_, i) => (
              <Box key={STEP_KEYS[i].key} hidden={tab !== i}>
                {tab === i && (
                  <TextField
                    fullWidth
                    multiline
                    minRows={16}
                    value={jsonValues[i]}
                    onChange={(e) => setJsonAt(i, e.target.value)}
                    InputProps={{
                      sx: { fontFamily: 'ui-monospace, monospace', fontSize: 13 },
                    }}
                    placeholder="{}"
                  />
                )}
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Edit each step as JSON (same structure as saved in the API). Invalid JSON will block save.
            </Typography>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} sx={{ textTransform: 'none' }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={() => void handleSave()}
          disabled={saving || loading || !detail}
          sx={{ textTransform: 'none' }}
        >
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminEstatePlanningDialog;
