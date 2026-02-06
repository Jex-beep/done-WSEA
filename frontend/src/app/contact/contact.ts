import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { FormsModule } from '@angular/forms';
import { Title, Meta } from '@angular/platform-browser';
import emailjs from '@emailjs/browser';
import { CommonModule } from '@angular/common';

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
  form: ContactForm = { name: '', email: '', phone: '', message: '' };
  isSending = false;

  // Popup Control
  showPopup = false;
  popupTitle = '';
  popupMessage = '';
  isSuccess = true;

  constructor(
    private title: Title, 
    private meta: Meta, 
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit() {
    emailjs.init('fdKiUJiJkms7lnJ1D');
    this.updateContactSEO();
  }

  updateContactSEO() {
    this.title.setTitle('Contact M&J Quality Used Cars | Mabalacat City');
    this.meta.updateTag({ name: 'description', content: 'Contact JM Punsalan at M&J Quality Used Cars Mabalacat. Get the best secondhand car deals in Pampanga.' });
    this.meta.updateTag({ name: 'keywords', content: 'Mabalacat car dealer, contact M&J, buy used cars Pampanga, M&J quality used cars, secondhand cars Mabalacat' });
    this.meta.updateTag({ name: 'robots', content: 'index, follow' });
    this.meta.updateTag({ property: 'og:image', content: 'https://raw.githubusercontent.com/Jex-beep/WSEA-FINALS/master/public/MJlogo.png' });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: 'Contact M&J Quality Used Cars' });
  }

  send() {
    // 1. Check for empty fields AGAD
    if (!this.form.email || !this.form.name || !this.form.message) {
      this.popupTitle = 'Input Incorrect';
      this.popupMessage = 'Please fill in the required fields.';
      this.isSuccess = false;
      this.showPopup = true;
      return;
    }

    // 2. TRIGGER SUCCESS POPUP INSTANTLY
    // We don't wait for EmailJS to finish because we know it's fast
    this.popupTitle = 'Sent Successfully!';
    this.popupMessage = 'Your message has been sent to M&J Quality Used Cars.';
    this.isSuccess = true;
    this.showPopup = true;
    this.isSending = true;

    const templateParams = {
      name: this.form.name,
      email: this.form.email,
      phone: this.form.phone,
      message: this.form.message,
      to_name: 'M&J Admin'
    };

    // 3. Send email in the background
    emailjs.send('service_h64pn57', 'template_gdfdmqa', templateParams)
      .then((response) => {
        this.zone.run(() => {
          console.log('SUCCESS!', response.status, response.text);
          this.resetForm();
          this.isSending = false;
          this.cdr.detectChanges();
        });
      })
      .catch((err) => {
        this.zone.run(() => {
          console.error('FAILED...', err);
          // If it actually fails, update the popup text
          this.popupTitle = 'Failed to Send';
          this.popupMessage = 'Check your internet connection and try again.';
          this.isSuccess = false;
          this.isSending = false;
          this.cdr.detectChanges();
        });
      });
  }

  closePopup() {
    this.showPopup = false;
    this.cdr.detectChanges();
  }

  resetForm() {
    this.form = { name: '', email: '', phone: '', message: '' };
  }
}