import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { Nav } from "../nav/nav"; // Import these for SEO

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [RouterLink, Nav],
  templateUrl: './error.html',
  styleUrl: './error.css',
})
export class Error implements OnInit {

  constructor(private titleService: Title, private metaService: Meta) {}

  ngOnInit(): void {
    // 1. Set the Title for the browser tab
    this.titleService.setTitle('Page Not Found | MJ Quality Used Cars Philippines');

    // 2. Add as many Meta Tags as possible for SEO
    this.metaService.updateTag({ name: 'title', content: 'Page Not Found | MJ Quality Used Cars Philippines' });
    this.metaService.updateTag({ name: 'description', content: 'The page you are looking for at MJ Quality Cars does not exist. Return to our showroom for the best second hand car deals in the Philippines.' });
    this.metaService.updateTag({ name: 'keywords', content: '404 error, page not found, MJ Quality Cars, used cars Philippines' });
    
    // 3. Technical SEO: Tell Google NOT to index this specific broken link
    this.metaService.updateTag({ name: 'robots', content: 'noindex, follow' });

    // 4. Social Media Meta Tags (Open Graph & Twitter)
    this.metaService.updateTag({ property: 'og:title', content: 'Oops! Wrong Turn - MJ Quality Cars' });
    this.metaService.updateTag({ property: 'og:description', content: 'We couldn’t find that page, but we can help you find your next car.' });
    this.metaService.updateTag({ property: 'og:image', content: 'https://www.mjqualitycars.com/404.png' });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
  }
}