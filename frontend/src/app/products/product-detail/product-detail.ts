import { Component, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CarService } from '../../services/car';
import { Nav } from '../../nav/nav';
import { Footer } from '../../footer/footer';
import { Observable, tap, map } from 'rxjs';
import { API_BASE } from '../../api-config';
import { SITE } from '../../site-info';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit, OnDestroy {
  car$: Observable<any> | undefined;
  mainDisplayImage: string | null = null;

  // LIGHTBOX STATE
  zoomedImage: string | null = null;

  site = SITE;

  // Relative image paths are served by the backend.
  private baseImageUrl = API_BASE;

  private route = inject(ActivatedRoute);
  private carService = inject(CarService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.car$ = this.carService.getCarById(id).pipe(
        map(res => res.data ? res.data : res),
        tap(car => {
          if (car) {
            this.updateDetailSEO(car);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    // Never leave the page scroll-locked if the visitor navigates away while zoomed.
    document.body.style.overflow = '';
  }

  // --- IMAGE HELPERS ---

  formatImg(path: string): string {
    if (!path) return 'assets/placeholder-car.png';
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    return `${this.baseImageUrl}/${path}`;
  }

  setMainImage(imagePath: string): void {
    this.mainDisplayImage = imagePath;
  }

  // --- LIGHTBOX METHODS ---

  openZoom(imagePath: string): void {
    this.zoomedImage = imagePath;
    // Lock body scroll for better UX
    document.body.style.overflow = 'hidden';
  }

  @HostListener('document:keydown.escape')
  closeZoom(): void {
    if (!this.zoomedImage) return;
    this.zoomedImage = null;
    // Restore body scroll
    document.body.style.overflow = '';
  }

  // --- SEO ENHANCEMENT ---

  updateDetailSEO(car: any): void {
    const priceVal = car.price ? Number(car.price) : 0;
    const formattedPrice = new Intl.NumberFormat('en-PH', {
      style: 'currency', currency: 'PHP', maximumFractionDigits: 0
    }).format(priceVal);

    const carTitle = `${car.year || ''} ${car.make} ${car.model || ''}`;
    this.titleService.setTitle(`${carTitle} | M&J Quality Cars`);

    const fullDesc = `Check out this ${carTitle} for ${formattedPrice}. Gearbox: ${car.gearbox}, Fuel: ${car.fuel}, Seats: ${car.seats}. Available at M&J Quality Cars Showroom, Mabalacat, Pampanga.`;

    // Standard Meta Tags
    this.metaService.updateTag({ name: 'description', content: fullDesc });
    this.metaService.updateTag({ name: 'keywords', content: `${car.make}, ${car.model}, ${car.year}, used cars Mabalacat, premium cars Philippines, M&J Quality Cars` });
    this.metaService.updateTag({ name: 'author', content: 'M&J Quality Cars' });
    this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });

    // Open Graph / Facebook Meta Tags
    this.metaService.updateTag({ property: 'og:title', content: `${carTitle} - M&J Quality Cars` });
    this.metaService.updateTag({ property: 'og:description', content: fullDesc });
    this.metaService.updateTag({ property: 'og:image', content: this.formatImg(car.image) });
    this.metaService.updateTag({ property: 'og:type', content: 'product' });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });

    // Twitter Meta Tags
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: carTitle });
    this.metaService.updateTag({ name: 'twitter:description', content: fullDesc });
    this.metaService.updateTag({ name: 'twitter:image', content: this.formatImg(car.image) });

    // Additional SEO Tags from Saved Info
    this.metaService.updateTag({ name: 'geo.region', content: 'PH-PAM' });
    this.metaService.updateTag({ name: 'geo.placename', content: 'Mabalacat City' });
    this.metaService.updateTag({ name: 'geo.position', content: '15.2215;120.5744' });
    this.metaService.updateTag({ name: 'revisit-after', content: '1 day' });
    this.metaService.updateTag({ name: 'theme-color', content: '#e31e24' });
  }
}
