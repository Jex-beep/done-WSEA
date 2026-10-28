import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnInit {
  protected readonly title = signal('mj-quality-cars');
  private router = inject(Router);
  private doc = inject(DOCUMENT);

  ngOnInit() {
    const trackingId = 'G-R5W1YYRC92';

    // 1️⃣ Dynamically load GA script
    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments);
        };

        const gtag = (window as any).gtag;
        gtag('js', new Date());
        gtag('config', trackingId);

        console.log('✅ GA initialized');
      };
    }

    // 2️⃣ Route tracking + scroll reset + canonical
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {

        // Scroll reset
        window.scrollTo(0, 0);

        // Google Analytics page view
        const gtag = (window as any).gtag;
        if (gtag) {
          gtag('config', trackingId, {
            page_path: event.urlAfterRedirects
          });
          console.log('🚀 GA Page View:', event.urlAfterRedirects);
        }

        // ✅ Canonical URL update (SEO fix)
        const base = this.doc.location.origin; // the address the site is actually served from
        const path = event.urlAfterRedirects.split('?')[0];
        const canonicalUrl = base + path;

        let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;

        if (!link) {
          link = this.doc.createElement('link');
          link.rel = 'canonical';
          this.doc.head.appendChild(link);
        }

        link.href = canonicalUrl;
      }
    });
  }
}
