import { useLayoutEffect, useRef } from 'react';
import { gsap } from '../animations/gsap';

const numberFormatter = new Intl.NumberFormat('vi-VN');

export default function AnimatedNumber({ value }) {
  const numberRef = useRef(null);
  const text = String(value);

  useLayoutEffect(() => {
    const element = numberRef.current;
    const match = text.match(/^(\d[\d.]*)(\+?)$/);

    // Settings may contain non-numeric copy. Keep that content unchanged.
    if (!element || !match) {
      return;
    }

    const target = Number(match[1].replaceAll('.', ''));

    if (!Number.isSafeInteger(target)) {
      return;
    }

    const suffix = match[2];
    const media = gsap.matchMedia();

    media.add('(prefers-reduced-motion: no-preference)', () => {
      const counter = { value: 0 };

      gsap.to(counter, {
        value: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: element,
          start: 'top 95%',
          once: true,
        },
        onUpdate() {
          element.textContent = numberFormatter.format(Math.round(counter.value)) + suffix;
        },
        onComplete() {
          element.textContent = text;
        },
      });

      return () => {
        element.textContent = text;
      };
    });

    return () => {
      media.revert();
    };
  }, [text]);

  return (
    <strong aria-label={text}>
      <span ref={numberRef} aria-hidden="true" className="animated-number">
        {text}
      </span>
    </strong>
  );
}
