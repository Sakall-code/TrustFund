'use client';

/**
 * CreateCampaignForm.tsx
 * The main form for creating a new crowdfunding campaign.
 * Runs the real 3-step submission flow:
 * 1. "Uploading image" via IPFS uploadImage(file)
 * 2. "Confirm in your wallet" via useCreateCampaign hook
 * 3. "Saving campaign details" via createCampaignMeta(...)
 *
 * Includes progress modal, tab-close protection, error recovery,
 * and renders SuccessScreen upon completion.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import TagSelector from './TagSelector';
import DeadlinePicker from './DeadlinePicker';
import ImageDropzone from './ImageDropzone';
import SubmitProgress, { type SubmitStep } from './SubmitProgress';
import SuccessScreen from './SuccessScreen';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { uploadImage, createCampaignMeta } from '@/lib/api';
import { useCreateCampaign } from '@/lib/hooks/useCreateCampaign';
import { useWallet } from '@/lib/hooks/useWallet';
import { maticToWei } from '@/lib/format';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormValues {
  title: string;
  description: string;
  tags: string[];
  image: File | null;
  goal: string;
  deadline: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

interface SuccessData {
  campaignId: number;
  txHash?: string;
  warning?: string | null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Returns an object mapping field names to error messages.
 * An empty object means the form is valid.
 */
function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  const today = new Date();

  // Title: required, 5-120 chars
  if (!values.title.trim()) {
    errors.title = 'Title is required.';
  } else if (values.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters.';
  } else if (values.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or fewer.';
  }

  // Description: required, 30-5000 chars
  if (!values.description.trim()) {
    errors.description = 'Description is required.';
  } else if (values.description.trim().length < 30) {
    errors.description = `Description must be at least 30 characters (${values.description.trim().length} so far).`;
  } else if (values.description.trim().length > 5000) {
    errors.description = 'Description must be 5 000 characters or fewer.';
  }

  // Tags: 1-3
  if (values.tags.length === 0) {
    errors.tags = 'Select at least 1 tag.';
  } else if (values.tags.length > 3) {
    errors.tags = 'Select at most 3 tags.';
  }

  // Goal: required, > 0, max 6 decimal places
  if (!values.goal) {
    errors.goal = 'Goal amount is required.';
  } else {
    const num = parseFloat(values.goal);
    if (isNaN(num) || num <= 0) {
      errors.goal = 'Goal must be a number greater than 0.';
    } else {
      const parts = values.goal.split('.');
      if (parts[1] && parts[1].length > 6) {
        errors.goal = 'Goal may have at most 6 decimal places.';
      }
    }
  }

  // Deadline: required, 1-90 days from today
  if (!values.deadline) {
    errors.deadline = 'Deadline is required.';
  } else {
    try {
      const days = differenceInCalendarDays(parseISO(values.deadline), today);
      if (days < 1) {
        errors.deadline = 'Deadline must be at least 1 day from today.';
      } else if (days > 90) {
        errors.deadline = 'Deadline must be at most 90 days from today.';
      }
    } catch {
      errors.deadline = 'Invalid date.';
    }
  }

  // Image: required
  if (!values.image) {
    errors.image = 'Campaign image is required.';
  }

  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_VALUES: FormValues = {
  title: '',
  description: '',
  tags: [],
  image: null,
  goal: '',
  deadline: '',
};

export default function CreateCampaignForm() {
  const { address } = useWallet();
  const { create } = useCreateCampaign();

  const [values, setValues] = useState<FormValues>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FormErrors>({});
  // Track which fields have been "touched" (blurred at least once)
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});

  // Submission state
  const [step, setStep] = useState<SubmitStep>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<SuccessData | null>(null);

  // Ref to prevent double-submit races
  const submittingRef = useRef(false);

  // Derived: current errors
  const currentErrors = validate(values);
  const errorCount = Object.keys(currentErrors).length;
  const isFormValid = errorCount === 0;
  // isSubmitting: a step is in progress and no error has halted us
  const isSubmitting = step > 0 && !submitError;

  // ── Warn before closing tab mid-submission ─────────────────────────────────
  useEffect(() => {
    if (!isSubmitting) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSubmitting]);

  // ── Field helpers ──────────────────────────────────────────────────────────

  const setField = useCallback(
    <K extends keyof FormValues>(field: K, value: FormValues[K]) => {
      setValues((prev) => {
        const next = { ...prev, [field]: value };
        // Re-run validation only for touched fields as the user types
        setErrors((prevErr) => {
          const freshErrors = validate(next);
          const updated: FormErrors = { ...prevErr };
          if (freshErrors[field]) {
            updated[field] = freshErrors[field];
          } else {
            delete updated[field];
          }
          return updated;
        });
        return next;
      });
    },
    []
  );

  const handleBlur = useCallback(
    (field: keyof FormValues) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const freshErrors = validate(values);
      setErrors((prev) => ({
        ...prev,
        [field]: freshErrors[field],
      }));
    },
    [values]
  );

  // ── Submit Flow (3 exact steps) ───────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Block double-submits
    if (submittingRef.current) return;

    // Guard: wallet must be connected with a valid address
    if (!address) {
      setSubmitError('Please connect your wallet before submitting.');
      return;
    }

    // Mark every field as touched and validate
    setTouched({ title: true, description: true, tags: true, image: true, goal: true, deadline: true });
    const freshErrors = validate(values);
    setErrors(freshErrors);

    if (Object.keys(freshErrors).length > 0 || !values.image) return;

    submittingRef.current = true;
    setSubmitError(null);

    // ── STEP 1: Uploading image ────────────────────────────────────────────
    setStep(1);
    let cid: string;
    try {
      const uploadRes = await uploadImage(values.image);
      cid = uploadRes.cid;
      if (!cid) throw new Error('No CID returned from upload.');
    } catch {
      setSubmitError('Image upload failed. Please try again.');
      setStep(1); // keep step=1 so the modal shows it as failed
      submittingRef.current = false;
      return;
    }

    // ── STEP 2: Confirm in your wallet ─────────────────────────────────────
    setStep(2);
    const goalWei = maticToWei(values.goal);
    const deadlineSeconds = Math.floor(parseISO(values.deadline).getTime() / 1000);

    let createResult: { hash: `0x${string}`; campaignId: number | null } | null = null;
    try {
      createResult = await create(goalWei, deadlineSeconds, cid);
    } catch {
      setSubmitError('You cancelled the transaction.');
      setStep(2); // keep step=2 so the modal shows it as failed
      submittingRef.current = false;
      return;
    }

    if (!createResult || !createResult.campaignId) {
      setSubmitError('Transaction failed or was cancelled.');
      setStep(2); // keep step=2 so the modal shows it as failed
      submittingRef.current = false;
      return;
    }

    const { hash: confirmedTxHash, campaignId } = createResult;

    // ── STEP 3: Saving campaign details ───────────────────────────────────
    setStep(3);
    let metadataWarning: string | null = null;

    try {
      await createCampaignMeta({
        campaignId,
        title: values.title.trim(),
        description: values.description.trim(),
        tags: values.tags,
        imageCid: cid,
        creatorAddress: address,
      });
    } catch {
      // Campaign is already live on-chain — show warning but proceed to success
      metadataWarning = `Your campaign is live on-chain, but we could not save the description. Note down campaign ID ${campaignId} and tell your team.`;
    }

    // Done — clear the in-flight flag and show the success screen
    submittingRef.current = false;
    setStep(0);
    setSuccessData({
      campaignId,
      txHash: confirmedTxHash,
      warning: metadataWarning,
    });
  };

  const handleReset = () => {
    setValues(INITIAL_VALUES);
    setErrors({});
    setTouched({});
    setStep(0);
    setSubmitError(null);
    setSuccessData(null);
    submittingRef.current = false;
  };

  const handleProgressClose = () => {
    // Only allow close when a step failed (error state)
    if (submitError) {
      setStep(0);
      setSubmitError(null);
      submittingRef.current = false;
    }
  };

  const fieldError = (field: keyof FormValues) =>
    touched[field] ? errors[field] : undefined;

  // ── Render Success Screen if submission completed ──────────────────────────
  if (successData) {
    return (
      <SuccessScreen
        campaignId={successData.campaignId}
        txHash={successData.txHash}
        warning={successData.warning}
        onReset={handleReset}
      />
    );
  }

  // ── Render Form ────────────────────────────────────────────────────────────
  return (
    <>
      {/* Progress Modal */}
      <SubmitProgress
        step={step}
        error={submitError}
        onClose={handleProgressClose}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-7">
        <fieldset disabled={isSubmitting} className="space-y-7">
          {/* ── Title ── */}
          <div>
            <Input
              id="title"
              label="Campaign Title"
              placeholder="e.g. Clean water for rural schools"
              value={values.title}
              onChange={(e) => setField('title', e.target.value)}
              onBlur={() => handleBlur('title')}
              error={fieldError('title')}
              maxLength={120}
              aria-describedby="title-hint"
            />
            <p id="title-hint" className="mt-1 text-xs text-neutral-500">
              5 – 120 characters
            </p>
          </div>

          {/* ── Description ── */}
          <div>
            <Textarea
              id="description"
              label="Description"
              placeholder="Tell people about your campaign, why it matters, and how funds will be used…"
              value={values.description}
              onChange={(e) => setField('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              error={fieldError('description')}
              maxLength={5000}
              rows={6}
              aria-describedby="desc-counter"
            />
            {/* Live character counter */}
            <div id="desc-counter" className="flex justify-between mt-1">
              <p className="text-xs text-neutral-500">30 – 5 000 characters</p>
              <p
                className={`text-xs ${
                  values.description.length > 5000
                    ? 'text-red-400'
                    : values.description.length >= 30
                    ? 'text-emerald-400'
                    : 'text-neutral-500'
                }`}
              >
                {values.description.length} / 5 000
              </p>
            </div>
          </div>

          {/* ── Tags ── */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Tags
            </label>
            <TagSelector
              selected={values.tags}
              onChange={(tags) => {
                setField('tags', tags);
                setTouched((prev) => ({ ...prev, tags: true }));
              }}
              max={3}
            />
            {touched.tags && errors.tags && (
              <p className="mt-1.5 text-sm text-red-400">{errors.tags}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Choose 1 – 3 tags that best describe your campaign.
            </p>
          </div>

          {/* ── Image ── */}
          <ImageDropzone
            file={values.image}
            onChange={(f) => {
              setField('image', f);
              setTouched((prev) => ({ ...prev, image: true }));
            }}
            error={fieldError('image')}
          />

          {/* ── Goal ── */}
          <div>
            <Input
              id="goal"
              type="number"
              label="Funding Goal (MATIC)"
              placeholder="e.g. 500"
              value={values.goal}
              onChange={(e) => setField('goal', e.target.value)}
              onBlur={() => handleBlur('goal')}
              error={fieldError('goal')}
              min="0"
              step="any"
              aria-describedby="goal-hint"
            />
            <p id="goal-hint" className="mt-1 text-xs text-neutral-500">
              Must be greater than 0 · up to 6 decimal places
            </p>
          </div>

          {/* ── Deadline ── */}
          <div>
            <label
              htmlFor="deadline"
              className="block text-sm font-medium text-neutral-300 mb-2"
            >
              Campaign Deadline
            </label>
            <DeadlinePicker
              value={values.deadline}
              onChange={(v) => {
                setField('deadline', v);
                setTouched((prev) => ({ ...prev, deadline: true }));
              }}
            />
            {touched.deadline && errors.deadline && (
              <p className="mt-1.5 text-sm text-red-400">{errors.deadline}</p>
            )}
            <p className="mt-1 text-xs text-neutral-500">
              Between 1 and 90 days from today.
            </p>
          </div>

          {/* ── Submit ── */}
          <div className="pt-2 space-y-2">
            {/* Helper text when form has errors */}
            {!isFormValid && Object.keys(touched).length > 0 && (
              <p className="text-sm text-amber-400 text-center">
                Fix {errorCount} field{errorCount !== 1 ? 's' : ''} to continue
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              variant="primary"
              disabled={!isFormValid || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              🚀 Launch Campaign
            </Button>
          </div>
        </fieldset>
      </form>
    </>
  );
}
