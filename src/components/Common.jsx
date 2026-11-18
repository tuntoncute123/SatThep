'use client';

import { useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { ArrowUpRight, X, PackageOpen, LoaderCircle } from 'lucide-react';
import { useSite } from '../lib';
export function Logo({ light = false, compact = false }) {
  const { settings } = useSite();
  return (
    <Link className={'brand ' + (light ? 'light' : '')} href="/" aria-label="Về trang chủ">
      <span className="brand-symbol">
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M4 5h36v8H27v26H17V13H4Z" fill="currentColor" />
          <path d="m32 20 8-5v24h-8Z" fill="currentColor" opacity=".5" />
        </svg>
      </span>
      <span>
        <strong>{settings?.name || 'Thép Việt'}</strong>
        {!compact && <small>VỮNG CHẤT THÉP · BỀN GIÁ TRỊ</small>}
      </span>
    </Link>
  );
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') {
        closeRef.current();
      }
      if (e.key === 'Tab') {
        const elements = ref.current?.querySelectorAll(
          'button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]',
        );
        if (!elements?.length) {
          return;
        }
        const first = elements[0];
        const last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={'modal ' + (wide ? 'wide' : '')}
      >
        <div className="modal-heading">
          <div>
            <span className="eyebrow">THÉP VIỆT</span>
            <h2 id={titleId}>{title}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Đóng hộp thoại">
            <X />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Loading() {
  return (
    <div className="state-box">
      <LoaderCircle className="spin" />
      <p>Đang tải dữ liệu…</p>
    </div>
  );
}
export function Empty({
  title = 'Chưa có dữ liệu',
  description = 'Dữ liệu mới sẽ xuất hiện tại đây.',
}) {
  return (
    <div className="state-box">
      <PackageOpen size={42} />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
export function SectionHeading({ eyebrow, title, description, link, href }) {
  return (
    <div className="section-heading" data-aos="reveal">
      <div>
        <span className="eyebrow">
          <i />
          {eyebrow}
        </span>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {link && (
        <Link className="text-link" href={href}>
          {link}
          <ArrowUpRight size={19} />
        </Link>
      )}
    </div>
  );
}
export function Field({ label, children, wide = false }) {
  return (
    <label className={'field ' + (wide ? 'full' : '')}>
      <span>{label}</span>
      {children}
    </label>
  );
}
