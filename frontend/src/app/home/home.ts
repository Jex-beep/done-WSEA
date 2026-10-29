import { Component, OnInit, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CarService } from '../services/car';
import { SITE } from '../site-info';

@Component({
  selector: 'app-home',
  imports: [Nav, Footer, RouterLink, CurrencyPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private carService = inject(CarService);

  site = SITE;

  /** Labels shown to visitors; `type` matches the Products filter values. */
  categories = [
    { type: 'Sedan', label: 'Sedan', icon: '/sedan-car-icon.webp' },
    { type: 'Pickup', label: 'Pick-up', icon: '/pickup-truck-icon.webp' },
    { type: 'Coupe', label: 'Coupe', icon: '/coupe-car-icon.webp' },
    { type: 'Suv', label: 'SUV', icon: '/suv-car-icon.webp' },
    { type: 'Micro', label: 'Micro', icon: '/micro-car-icon.webp' }
  ];

  latest = signal<any[]>([]);
  isLoading = signal(true);

  ngOnInit(): void {
    this.carService.getCars().subscribe({
      next: (cars) => {
        // Mongo _ids start with a timestamp, so a descending sort is newest first.
        const newest = [...cars]
          .sort((a, b) => String(b._id).localeCompare(String(a._id)))
          .slice(0, 6);
        this.latest.set(newest);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }
}
