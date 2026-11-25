'use client';

import React, { useState } from 'react';

const CUSTOM = '__custom__';

interface SelectOrCustomProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  customLabel: string;
  customPlaceholder?: string;
  required?: boolean;
  maxLength?: number;
  invalid?: boolean;
  describedBy?: string;
}

/**
 * A dropdown of the values already used in the data (so spelling stays consistent
 * and filters keep working), with an "add new…" option that switches to a text box.
 * A value that isn't in the list (e.g. typed earlier) automatically shows as text.
 */
export function SelectOrCustom({
  id, value, onChange, options, placeholder, customLabel, customPlaceholder, required, maxLength, invalid, describedBy,
}: SelectOrCustomProps) {
  const inList = value === '' || options.includes(value);
  const [typing, setTyping] = useState(!inList);
  const [focusOnMount, setFocusOnMount] = useState(false);

  // A value from outside that isn't in the list can only be shown in the text box.
  if (!typing && !inList) setTyping(true);

  const aria = { 'aria-invalid': invalid || undefined, 'aria-describedby': describedBy };

  if (typing) {
    return (
      <div className="flex gap-2 items-center">
        <input
          id={id}
          type="text"
          className="input"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={customPlaceholder}
          required={required}
          maxLength={maxLength}
          autoFocus={focusOnMount}
          {...aria}
        />
        {options.length > 0 && (
          <button
            type="button"
            className="btn btn-sm btn-ghost shrink-0"
            onClick={() => {
              setTyping(false);
              if (!options.includes(value)) onChange('');
            }}
          >
            Pick from list
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      id={id}
      className="input"
      value={value}
      required={required}
      onChange={e => {
        if (e.target.value === CUSTOM) {
          setTyping(true);
          setFocusOnMount(true);
          onChange('');
        } else {
          onChange(e.target.value);
        }
      }}
      {...aria}
    >
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
      <option value={CUSTOM}>{customLabel}</option>
    </select>
  );
}
