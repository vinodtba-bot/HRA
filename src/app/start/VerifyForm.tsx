'use client';
import { useActionState } from 'react';
import { verify, type VerifyState } from './actions';

type Field = { name: string; label: string; type: string; hint: string; autoComplete?: string; inputMode?: 'numeric' | 'text' };

export default function VerifyForm({ fields, submit, checking }: { fields: Field[]; submit: string; checking: string }) {
  const [state, action, pending] = useActionState<VerifyState, FormData>(verify, {});
  return (
    <form action={action} noValidate>
      {fields.map(f => (
        <div key={f.name}>
          <label htmlFor={f.name}>{f.label}</label>
          {f.hint && <div className="muted" id={`${f.name}-hint`}>{f.hint}</div>}
          <input id={f.name} name={f.name} type={f.type} required autoComplete={f.autoComplete} inputMode={f.inputMode}
            aria-describedby={f.hint ? `${f.name}-hint` : undefined} aria-invalid={!!state.error} />
        </div>
      ))}
      {state.error && <p className="error" role="alert" style={{ marginTop: 14 }}>{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? checking : submit}</button>
    </form>
  );
}
