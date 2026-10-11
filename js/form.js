/*
 * Form validation for form[data-validate].
 *
 * - Uses the browser's constraint API for the checks, our own messages for
 *   the wording. Override per field with data-error-required / data-error-type /
 *   data-error-short / data-error-pattern.
 * - Errors render in a .field-error under the field, linked by aria-describedby,
 *   plus a summary alert ([data-form-summary]) listing every problem.
 * - Validation runs on submit; after the first submit, fields re-validate live.
 * - Submission is simulated: a short loading state, then the element named
 *   by data-success is shown and a toast confirms. No data leaves the page.
 */
import { icon } from './icons.js';
import { showToast } from './toast.js';

const cfg = window.SITE_CONFIG || {};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

function labelText(field) {
  const label = field.labels && field.labels[0];
  if (!label) return 'this field';
  const clone = label.cloneNode(true);
  clone.querySelectorAll('.field-optional, input').forEach((n) => n.remove());
  return clone.textContent.trim().replace(/\.$/, '');
}

function message(field) {
  const v = field.validity;
  if (v.valid) return '';
  const d = field.dataset;
  const label = labelText(field);
  if (v.valueMissing) {
    if (d.errorRequired) return d.errorRequired;
    if (field.type === 'checkbox') return 'Tick this box to continue.';
    if (label.endsWith('?')) return field.tagName === 'SELECT' ? 'Choose an answer.' : 'Answer this question.';
    if (field.tagName === 'SELECT') return `Choose ${label.toLowerCase()}.`;
    return `Enter ${label.toLowerCase()}.`;
  }
  if (v.typeMismatch) {
    if (d.errorType) return d.errorType;
    if (field.type === 'email') return 'Enter an email address like name@example.com.';
    if (field.type === 'url') return 'Enter a web address like https://example.com.';
  }
  if (v.tooShort) return d.errorShort || `${label} needs at least ${field.minLength} characters.`;
  if (v.patternMismatch) return d.errorPattern || `Check the format of ${label.toLowerCase()}.`;
  return field.validationMessage;
}

function errorElement(field) {
  const id = `${field.id}-error`;
  let el = document.getElementById(id);
  if (!el) {
    el = document.createElement('div');
    el.className = 'field-error';
    el.id = id;
    const host = field.closest('.field') || field.parentElement;
    host.appendChild(el);
  }
  return el;
}

function setError(field, msg) {
  if (!field.id) return;
  const el = errorElement(field);
  const described = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
  if (msg) {
    el.innerHTML = `${icon('alert-circle')}<span></span>`;
    el.lastElementChild.textContent = msg;
    field.setAttribute('aria-invalid', 'true');
    if (!described.includes(el.id)) described.push(el.id);
  } else {
    el.textContent = '';
    field.removeAttribute('aria-invalid');
    const i = described.indexOf(el.id);
    if (i > -1) described.splice(i, 1);
  }
  if (described.length) field.setAttribute('aria-describedby', described.join(' '));
  else field.removeAttribute('aria-describedby');
}

function fieldsOf(form) {
  return Array.from(form.elements).filter((el) => el.willValidate && el.name && !['submit', 'button', 'reset'].includes(el.type));
}

function renderSummary(form, errors) {
  const summary = form.querySelector('[data-form-summary]');
  if (!summary) return;
  if (!errors.length) { summary.hidden = true; summary.replaceChildren(); return; }
  summary.replaceChildren();
  const tpl = document.createElement('template');
  tpl.innerHTML = `${icon('alert-circle')}<div><p class="alert-title"></p><ul></ul></div>`;
  summary.appendChild(tpl.content);
  summary.querySelector('.alert-title').textContent = errors.length === 1
    ? 'Fix one thing before sending'
    : `Fix ${errors.length} things before sending`;
  const list = summary.querySelector('ul');
  errors.forEach(([field, msg]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `#${field.id}`;
    a.textContent = msg;
    a.addEventListener('click', (e) => { e.preventDefault(); field.focus(); });
    li.appendChild(a);
    list.appendChild(li);
  });
  summary.hidden = false;
}

export function initForms(root = document) {
  root.querySelectorAll('form[data-validate]').forEach((form) => {
    form.noValidate = true;
    let submitted = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      submitted = true;
      const fields = fieldsOf(form);
      const errors = [];
      fields.forEach((f) => {
        const msg = message(f);
        setError(f, msg);
        if (msg) errors.push([f, msg]);
      });
      renderSummary(form, errors);
      if (errors.length) { errors[0][0].focus(); return; }

      const btn = form.querySelector('[type="submit"]');
      if (btn) { btn.setAttribute('data-loading', 'true'); btn.setAttribute('aria-disabled', 'true'); }
      await wait(900);
      if (btn) { btn.removeAttribute('data-loading'); btn.removeAttribute('aria-disabled'); }

      const success = form.dataset.success ? document.querySelector(form.dataset.success) : null;
      if (success) {
        form.hidden = true;
        success.hidden = false;
        success.setAttribute('tabindex', '-1');
        success.focus();
      }
      showToast({
        title: form.dataset.successToast || 'Sent (simulated)',
        body: cfg.simulatedLabel || '',
        tone: 'success'
      });
      const dialog = form.closest('dialog');
      if (dialog) { dialog.close('submitted'); form.reset(); }
      form.dispatchEvent(new CustomEvent('simulated-submit', { bubbles: true }));
    });

    const live = (e) => {
      if (!submitted || !e.target.willValidate) return;
      setError(e.target, message(e.target));
      const errors = fieldsOf(form).map((f) => [f, message(f)]).filter(([, m]) => m);
      renderSummary(form, errors);
    };
    form.addEventListener('input', live);
    form.addEventListener('change', live);
    form.addEventListener('reset', () => {
      submitted = false;
      fieldsOf(form).forEach((f) => setError(f, ''));
      renderSummary(form, []);
    });
  });

  /* "Send another" buttons: [data-form-restore="#form-id"] */
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-form-restore]');
    if (!btn) return;
    const form = document.querySelector(btn.getAttribute('data-form-restore'));
    if (!form) return;
    const success = form.dataset.success ? document.querySelector(form.dataset.success) : null;
    form.reset();
    form.hidden = false;
    if (success) success.hidden = true;
    const first = form.querySelector('input, select, textarea');
    if (first) first.focus();
  });
}
