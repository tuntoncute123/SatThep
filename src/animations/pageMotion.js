import { gsap } from './gsap';

export function animatePageEntrance(root, compact) {
  const timeline = gsap.timeline({
    defaults: {
      duration: 0.9,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
    },
  });
  const hero = root.querySelector('.hero');

  if (hero) {
    timeline
      .from(hero.querySelector('.hero-image'), {
        scale: compact ? 1.12 : 1.24,
        duration: 1.9,
        ease: 'power2.out',
      })
      .from(hero.querySelector('.hero-eyebrow'), { x: -28, opacity: 0, duration: 0.7 }, 0.1)
      .from(
        hero.querySelectorAll('.hero-title-line > *'),
        {
          yPercent: 115,
          rotation: compact ? 0 : 3,
          transformOrigin: 'left bottom',
          stagger: 0.14,
          duration: 1.15,
          ease: 'power4.out',
        },
        0.18,
      )
      .from(
        hero.querySelectorAll('.hero-copy > p, .hero-actions, .hero-assurance'),
        { y: compact ? 22 : 38, opacity: 0, stagger: 0.12 },
        0.5,
      )
      .from(hero.querySelectorAll('.hero-bottom, .hero-side-label'), { y: 16, opacity: 0 }, 0.85);
  } else {
    const heading = root.querySelector('.page-hero .container');

    if (heading) {
      timeline.from(heading.children, {
        y: compact ? 28 : 48,
        opacity: 0,
        stagger: 0.12,
      });
    }
  }

  return timeline;
}

export function animateScrollScenes(root, compact) {
  const stats = root.querySelector('.stats-grid');

  if (stats) {
    gsap.from(stats.children, {
      y: compact ? 24 : 44,
      opacity: 0,
      stagger: 0.1,
      duration: 0.85,
      ease: 'power3.out',
      clearProps: 'opacity,transform',
      scrollTrigger: {
        trigger: stats,
        start: 'top 95%',
        once: true,
      },
    });
  }

  // Mobile keeps the entrance choreography without continuous scroll effects.
  if (compact) {
    return;
  }

  const hero = root.querySelector('.hero');

  if (hero) {
    gsap.to(hero.querySelector('.hero-media'), {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.65,
      },
    });

    gsap.fromTo(
      hero.querySelector('.hero-progress i'),
      { scaleX: 0.15 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.4,
        },
      },
    );
  }

  const about = root.querySelector('.about-visual');

  if (about) {
    gsap.fromTo(
      about.querySelector('.about-accent'),
      { y: 28 },
      {
        y: -28,
        ease: 'none',
        scrollTrigger: {
          trigger: about,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 0.8,
        },
      },
    );
  }
}
