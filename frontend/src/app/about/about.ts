import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Import this
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-about',
  standalone: true,
  // Add CommonModule here
  imports: [CommonModule, Nav, Footer], 
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About {
  faqs = [
    { 
      question: 'What documents do I need to buy a car?', 
      answer: 'You will typically need a valid ID, proof of income, and proof of residence.',
      open: false 
    },
    { 
      question: 'Do you offer financing options?', 
      answer: 'Yes, we partner with several banks to provide flexible payment terms.',
      open: false 
    },
    { 
      question: 'Are the cars pre-inspected?', 
      answer: 'Absolutely. Every vehicle undergoes a rigorous 150-point inspection before being listed.',
      open: false 
    }
  ];

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  // Revs

 reviews = [
    {
      name: 'Andre Josef',
      content: 'Great experience! The staff was friendly and helped me find the perfect car within my budget.',
      rating: 5 // Changed from 5/5 to 5
    },
    {
      name: 'Renz Chu',
      content: 'Wide selection of vehicles and transparent pricing. Highly recommend M&J Quality Used Cars!',
      rating: 5 // Changed from 5/5 to 5
    },
    {
      name: 'Clarence Castillo',
      content: 'The financing process was smooth and hassle-free. I drove away in my new car the same day!',
      rating: 5 // Changed from 5/5 to 5
    }
  ];

  getStars(rating: number): number[] {
    // rating is now 5, so it returns an array with 5 items
    return new Array(rating);
  }
}