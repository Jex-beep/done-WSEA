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

/*
 * IntersectionObserver only reports when an element's visibility changes. If a
 * visitor jumps or flicks straight past an element (End key, fast scroll,
 * restored scroll position) it goes from "below the screen" to "above the
 * screen" without ever being visible, so the observer never says anything and
 * the element would stay hidden until they scrolled back up. One shared scroll
 * check reveals anything that has been left behind.
 */
const waiting = new Set<Reveal>();
let sweepQueued = false;

function sweep(): void {
  sweepQueued = false;
  for (const item of [...waiting]) item.showIfPassed();
}

function queueSweep(): void {
  if (sweepQueued) return;
  sweepQueued = true;
  requestAnimationFrame(sweep);
}

function startWatching(item: Reveal): void {
  if (waiting.size === 0) {
    window.addEventListener('scroll', queueSweep, { passive: true });
    window.addEventListener('resize', queueSweep, { passive: true });
  }
  waiting.add(item);
}

function stopWatching(item: Reveal): void {
  waiting.delete(item);
  if (waiting.size === 0) {
    window.removeEventListener('scroll', queueSweep);
    window.removeEventListener('resize', queueSweep);
  }
}

@Directive({ selector: '[appReveal]' })
export class Reveal implements OnInit, OnDestroy {
  @Input('appReveal') delay: number | string = 0;

  private el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.el.classList.add('reveal');
    startWatching(this);

    this.observer = new IntersectionObserver(
      (entries) => {
        // One callback can carry several entries for this element (for example an
        // early "not visible" one followed by a "visible" one), so check all of
        // them rather than only the first.
        if (entries.some((entry) => entry.isIntersecting)) {
          this.playReveal();
        } else {
          this.showIfPassed();
        }
      },
      // No bottom inset: shrinking the viewport made elements near the end of the
      // page impossible to reveal on tall or zoomed-out screens.
      { threshold: 0.1 }
    );
    this.observer.observe(this.el);
  }

  /**
   * Called by the shared scroll check. An element that has not revealed yet but
   * whose top edge is above the top of the screen has been scrolled past (it can
   * only be partly on screen, as a thin sliver, or not at all), so show it.
   */
  showIfPassed(): void {
    if (this.el.getBoundingClientRect().top < 0) this.showNow();
  }

  /** Reveal with the fade-up animation (element is on screen). */
  private playReveal(): void {
    this.finishWatching();

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
  }

  /** Reveal instantly with no animation (element is off screen, above the visitor). */
  private showNow(): void {
    this.finishWatching();
    this.el.classList.remove('reveal', 'reveal-in');
  }

  private finishWatching(): void {
    this.observer?.disconnect();
    stopWatching(this);
  }

  ngOnDestroy(): void {
    this.finishWatching();
  }
}
