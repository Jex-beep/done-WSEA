import { Component, signal, OnInit, inject } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';

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

  ngOnInit() {
    const trackingId = 'G-R5W1YYRC92';

    // 1️⃣ Dynamically load GA script (only if not already present)
    if (!document.getElementById('ga-script')) {
      const script = document.createElement('script');
      script.id = 'ga-script';
      script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
      script.async = true;
      document.head.appendChild(script);

      // 2️⃣ Initialize GA after script loads
      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        
        // Use the standard 'arguments' object to match Google's requirements
        (window as any).gtag = function() {
          (window as any).dataLayer.push(arguments);
        };

        const gtag = (window as any).gtag;
        gtag('js', new Date());
        gtag('config', trackingId);

        console.log('✅ GA initialized for MJ Quality Cars');
      };
    }

    // 3️⃣ Track route changes & RESET SCROLL POSITION
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
        // --- THE FIX: Force scroll to top on every page change ---
        window.scrollTo(0, 0);

        // Google Analytics tracking
        const gtag = (window as any).gtag;
        if (gtag) {
          gtag('config', trackingId, {
            page_path: event.urlAfterRedirects
          });
          console.log('🚀 GA Page View:', event.urlAfterRedirects);
        }
      }
    });
  }
}