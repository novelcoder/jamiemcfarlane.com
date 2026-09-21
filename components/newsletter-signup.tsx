'use client';

import { ArrowRight } from 'lucide-react';
import { useId, useState, type SubmitEvent } from 'react';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

type SubscribeResponse = {
  ok?: boolean;
  code?: string;
};

function getErrorMessage(code?: string) {
  if (code === 'invalid_email') {
    return 'Enter a valid email address.';
  }

  if (code === 'rate_limited') {
    return 'Too many requests right now. Please try again shortly.';
  }

  return 'Signup is temporarily unavailable. Please try again.';
}

export function NewsletterSignup({
  compact = false,
  anchorId,
}: {
  compact?: boolean;
  anchorId?: string;
}) {
  const inputId = useId();
  const [submissionState, setSubmissionState] =
    useState<SubmissionState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email');
    const website = formData.get('website');

    setSubmissionState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, website }),
      });
      const result = (await response
        .json()
        .catch(() => null)) as SubscribeResponse | null;

      if (!response.ok || !result?.ok) {
        setSubmissionState('error');
        setMessage(getErrorMessage(result?.code));
        return;
      }

      form.reset();
      setSubmissionState('success');
      setMessage("You're in. Check your inbox for the next step.");
    } catch {
      setSubmissionState('error');
      setMessage(getErrorMessage());
    }
  }

  const isSubmitting = submissionState === 'submitting';

  return (
    <div
      className={
        compact ? 'signup-widget signup-widget-compact' : 'signup-widget'
      }
      id={anchorId}
    >
      <form
        className={
          compact ? 'signup-panel signup-panel-compact' : 'signup-panel'
        }
        onSubmit={handleSubmit}
      >
        <label className="signup-visually-hidden" htmlFor={inputId}>
          Email address
        </label>
        <input
          className="signup-email"
          id={inputId}
          name="email"
          type="email"
          placeholder="Your email"
          autoComplete="email"
          maxLength={254}
          required
          disabled={isSubmitting}
        />

        <label className="signup-honeypot" aria-hidden="true">
          Website
          <input name="website" type="text" tabIndex={-1} autoComplete="off" />
        </label>

        <button className="gold-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send me the books'}
          <ArrowRight aria-hidden="true" />
        </button>
      </form>

      {message ? (
        <p
          className={`signup-feedback signup-feedback-${submissionState}`}
          role={submissionState === 'error' ? 'alert' : 'status'}
          aria-live="polite"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
