import { useLayoutEffect } from 'react';
import AOS from 'aos';
import { gsap, ScrollTrigger } from './gsap';

let aosInitialized = false;

function initializeScrollReveals() {
  // AOS installs global listeners. Initialize once, including under React StrictMode.
  if (!aosInitialized) {
    AOS.init({
      duration: 650,
      easing: 'ease-out-cubic',
      offset: 45,
      delay: 0,
      once: true,
      mirror: false,
      anchorPlacement: 'top-bottom',
    });
    aosInitialized = true;
  }

  AOS.refreshHard();
}

function animatePageEntrance(root) {
  const timeline = gsap.timeline({
    defaults: {
      duration: 0.7,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    },
  });
  const hero = root.querySelector('.hero');

  if (hero) {
    timeline
      .from(hero.querySelector('.hero-image'), {
        scale: 1.07,
        duration: 1.6,
        ease: 'power2.out',
      })
      .from(
        hero.querySelectorAll('.hero-copy > *'),
        {
          y: 25,
          opacity: 0,
          stagger: 0.09,
        },
        0.08,
      )
      .from(
        hero.querySelectorAll('.hero-bottom, .hero-side-label'),
        {
          opacity: 0,
          duration: 0.7,
        },
        0.6,
      );
  } else {
    const heading = root.querySelector('.page-hero .container');

    if (heading) {
      timeline.from(heading.children, {
        y: 18,
        opacity: 0,
        stagger: 0.07,
        duration: 0.6,
      });
    }
  }

  return timeline;
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

    media.add('(prefers-reduced-motion: no-preference)', () => {
      timeline = animatePageEntrance(root);
    });

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
    document.fonts.ready.then(refreshPositions);
    refreshPositions();

    return () => {
      active = false;
      cancelAnimationFrame(refreshFrame);
      root.removeEventListener('load', refreshPositions, true);
      root.removeEventListener('focusin', revealFocusedContent);
      delete root.dataset.motionReady;
      media.revert();
    };
  }, [rootRef, routeKey, ready]);
}
