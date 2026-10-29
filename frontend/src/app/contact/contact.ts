import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { SITE } from '../site-info';

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  message: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [Nav, Footer, FormsModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit {
  site = SITE;
  form: ContactForm = { name: '', email: '', phone: '', message: '' };
  isSending = false;

  // Popup Control
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  isSuccess = true;
  mapLoaded = false;

  constructor(
    private title: Title,
    private meta: Meta,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.updateContactSEO();
  }

  updateContactSEO() {
    this.title.setTitle('Contact | M&J Quality Used Cars (portfolio demo)');
    this.meta.updateTag({ name: 'description', content: 'Contact page of the M&J Quality Used Cars portfolio project. Contact details are placeholders.' });
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: 'Contact | M&J Quality Used Cars' });
  }

  /**
   * Portfolio demo: nothing is sent anywhere. The form validates and shows
   * a message so visitors can see the flow without emailing a real person.
   */
  send() {
    if (!this.form.email || !this.form.name || !this.form.message) {
      this.popupTitle = 'Input Incorrect';
      this.popupMessage = 'Please fill in the required fields.';
      this.isSuccess = false;
      this.showPopup = true;
      return;
    }

    this.popupTitle = 'Demo form';
    this.popupMessage = 'Thanks! This is a portfolio project, so your message was not sent anywhere.';
    this.isSuccess = true;
    this.showPopup = true;
    this.resetForm();
  }

  closePopup() {
    this.showPopup = false;
    this.cdr.detectChanges();
  }

  resetForm() {
    this.form = { name: '', email: '', phone: '', message: '' };
  }
}
