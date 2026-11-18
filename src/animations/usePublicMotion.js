import { useLayoutEffect } from 'react';
import AOS from 'aos';
import { gsap, ScrollTrigger } from './gsap';
import { animatePageEntrance, animateScrollScenes } from './pageMotion';

let aosInitialized = false;

function initializeScrollReveals() {
  // AOS installs global listeners. Initialize once, including under React StrictMode.
  if (!aosInitialized) {
    AOS.init({
      duration: 900,
      easing: 'ease-out-cubic',
      offset: 55,
      delay: 0,
      once: true,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
    aosInitialized = true;
  }

  AOS.refreshHard();
}

export default function usePublicMotion(rootRef, routeKey, ready) {
  useLayoutEffect(() => {
    const root = rootRef.current;

    if (!ready || !root) {
      return;
    }

    let active = true;
    let refreshFrame;
    let timeline;
    const media = gsap.matchMedia(root);

    initializeScrollReveals();
    root.dataset.motionReady = 'true';

    media.add(
      {
        motion: '(prefers-reduced-motion: no-preference)',
        compact: '(max-width: 959px)',
      },
      (context) => {
        const { motion, compact } = context.conditions;

        if (!motion) {
          return;
        }

        timeline = animatePageEntrance(root, compact);
        animateScrollScenes(root, compact);
      },
    );

    function refreshPositions() {
      if (!active) {
        return;
      }

      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => {
        AOS.refreshHard();
        ScrollTrigger.refresh();
      });
    }

    function revealFocusedContent(event) {
      // Mouse focus must not move a button between pointerdown and click.
      if (!event.target.matches(':focus-visible')) {
        return;
      }

      const entrance = event.target.closest('.hero-copy, .page-hero');

      if (entrance && timeline?.isActive()) {
        timeline.progress(1);
      }

      const reveal = event.target.closest('[data-aos]');

      if (reveal) {
        reveal.classList.add('aos-animate');
      }
    }

    // Font and lazy-image loading can change section positions after the initial render.
    root.addEventListener('load', refreshPositions, true);
    root.addEventListener('focusin', revealFocusedContent);
    // Expanding FAQs and changing product filters also move reveal targets.
    const resizeObserver = new ResizeObserver(refreshPositions);
    resizeObserver.observe(root);
    document.fonts.ready.then(refreshPositions);
    refreshPositions();

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      root.removeEventListener('load', refreshPositions, true);
      root.removeEventListener('focusin', revealFocusedContent);
      resizeObserver.disconnect();
      delete root.dataset.motionReady;
      media.revert();
    };
  }, [rootRef, routeKey, ready]);
}
