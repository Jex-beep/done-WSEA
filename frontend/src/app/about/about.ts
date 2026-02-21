import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, Nav, Footer],
  templateUrl: './about.html',
  styleUrls: ['./about.css'],
})
export class About implements OnInit, OnDestroy {
  private schemaEl?: HTMLScriptElement;
  private schemaId = 'mj-about-schema';

  faqs = [
    {
      question: 'What documents do I need to buy a car?',
      answer: 'You will typically need a valid ID, proof of income, and proof of residence.',
      open: false,
    },
    {
      question: 'Do you offer financing options?',
      answer: 'Yes, we partner with several banks to provide flexible payment terms.',
      open: false,
    },
    {
      question: 'Are the cars pre-inspected?',
      answer: 'Absolutely. Every vehicle undergoes a rigorous 150-point inspection before being listed.',
      open: false,
    },
  ];

  reviews = [
    {
      name: 'Andre Josef',
      content: 'Great experience! The staff was friendly and helped me find the perfect car within my budget.',
      rating: 5,
    },
    {
      name: 'Renz Chu',
      content: 'Wide selection of vehicles and transparent pricing. Highly recommend MJ Quality Used Cars!',
      rating: 5,
    },
    {
      name: 'Clarence Castillo',
      content: 'The financing process was smooth and hassle-free. I drove away in my new car the same day!',
      rating: 5,
    },
  ];

  ngOnInit() {
    const existing = document.getElementById(this.schemaId);
    if (existing) existing.remove();

    // ✅ no trailing slash
    const BASE_URL = 'https://www.mjqualitycars.com';
    const BUSINESS_NAME = 'M&J Quality Used Cars';

    const aboutPageSchema = {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: `About ${BUSINESS_NAME}`,
      url: `${BASE_URL}/about`,
      isPartOf: {
        '@type': 'WebSite',
        name: BUSINESS_NAME,
        url: `${BASE_URL}/`,
      },
      about: {
        '@type': 'AutoDealer',
        name: BUSINESS_NAME,
        url: `${BASE_URL}/`,
      },
    };

    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: this.faqs.map((f) => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
    };

    const avgRating =
      this.reviews.reduce((sum, r) => sum + r.rating, 0) / this.reviews.length;

    const reviewSchema = {
      '@context': 'https://schema.org',
      '@type': 'AutoDealer',
      name: BUSINESS_NAME,
      url: `${BASE_URL}/`,
      review: this.reviews.map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.name },
        reviewBody: r.content,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.rating,
          bestRating: 5,
        },
      })),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(avgRating.toFixed(2)),
        reviewCount: this.reviews.length,
        bestRating: 5,
      },
    };

    const schemas = [aboutPageSchema, faqSchema, reviewSchema];

    this.schemaEl = document.createElement('script');
    this.schemaEl.id = this.schemaId;
    this.schemaEl.type = 'application/ld+json';
    this.schemaEl.text = JSON.stringify(schemas);
    document.head.appendChild(this.schemaEl);
  }

  ngOnDestroy() {
    const el = document.getElementById(this.schemaId);
    if (el) el.remove();
    this.schemaEl = undefined;
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  getStars(rating: number): number[] {
    return new Array(rating);
  }
}