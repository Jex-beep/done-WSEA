import { Directive, ElementRef, Input, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Fades an element up the first time it scrolls into view.
 *
 *   <div appReveal>                      reveals as soon as it is visible
 *   <li [appReveal]="index * 70">        delay in ms, to stagger siblings
 *
 * The element is only hidden once this runs in the browser, so nothing is lost
 * if JavaScript fails, and visitors who prefer reduced motion see everything
 * straight away. The .reveal / .reveal-in classes live in styles.css and are
 * removed again after the animation so they never fight with hover styles.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal implements OnInit, OnDestroy {
  @Input('appReveal') delay: number | string = 0;

  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.el.classList.add('reveal');

    this.observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        this.observer?.disconnect();

        this.el.style.animationDelay = `${Number(this.delay) || 0}ms`;
        this.el.classList.add('reveal-in');

        const done = (event: AnimationEvent) => {
          // animationend bubbles, so ignore animations that belong to children.
          if (event.target !== this.el) return;
          this.el.removeEventListener('animationend', done);
          this.el.classList.remove('reveal', 'reveal-in');
          this.el.style.animationDelay = '';
        };
        this.el.addEventListener('animationend', done);
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    this.observer.observe(this.el);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
