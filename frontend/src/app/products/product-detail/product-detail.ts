import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CarService } from '../../services/car';
import { Nav } from '../../nav/nav';
import { Footer } from '../../footer/footer';
import { Observable, tap, map } from 'rxjs';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit {
  car$: Observable<any> | undefined;
  mainDisplayImage: string | null = null;

  // CHANGE THIS to your backend URL if images are stored there
  private baseImageUrl = 'http://localhost:3000'; 

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

  // Helper to ensure paths are correct
  formatImg(path: string): string {
    if (!path) return 'assets/placeholder-car.png';
    if (path.startsWith('http') || path.startsWith('data:image')) return path;
    return `${this.baseImageUrl}/${path}`;
  }

  setMainImage(imagePath: string): void {
    this.mainDisplayImage = imagePath;
  }

  updateDetailSEO(car: any): void {
    const priceVal = car.price ? Number(car.price) : 0;
    const formattedPrice = new Intl.NumberFormat('en-PH', {
      style: 'currency', currency: 'PHP', maximumFractionDigits: 0
    }).format(priceVal);

    this.titleService.setTitle(`${car.year || ''} ${car.make} ${car.model || ''} | M&J Quality Cars`);

    const fullDesc = `Buy this ${car.make} ${car.model} for ${formattedPrice}. Specs: ${car.gearbox}, ${car.fuel}. Located in Mabalacat, Pampanga.`;

    this.metaService.updateTag({ name: 'description', content: fullDesc });
    this.metaService.updateTag({ name: 'keywords', content: `${car.make}, ${car.model}, used cars Mabalacat` });
    this.metaService.updateTag({ property: 'og:title', content: `${car.make} ${car.model}` });
    this.metaService.updateTag({ property: 'og:image', content: this.formatImg(car.image) });
  }
}