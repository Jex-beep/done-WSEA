import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta, DomSanitizer } from '@angular/platform-browser';
import { BlogService } from '../../services/blogs';
import { Nav } from '../../nav/nav';
import { Footer } from '../../footer/footer';
import { Observable, tap, map } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css',
})
export class BlogDetail implements OnInit, OnDestroy {
  blog$: Observable<any> | undefined;

  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  // ✅ JSON-LD schema handling
  private schemaId = 'mj-blogposting-schema';
  private schemaEl?: HTMLScriptElement;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.blog$ = this.blogService.getBlogById(id).pipe(
        map((res) => (res?.data ? res.data : res)),
        map((blog) => {
          // FIX: Replace &nbsp; with regular spaces
          if (blog?.content) {
            blog.content = blog.content.replace(/&nbsp;/g, ' ');
          }
          return blog;
        }),
        tap((blog) => {
          if (blog) {
            // DEBUG
            console.log('Title:', blog.title);
            console.log('Title has spaces:', blog.title.includes(' '));
            console.log('Title length:', blog.title.length);
            console.log('Content preview:', blog.content?.substring(0, 100));

            this.updateBlogSEO(blog);

            // ✅ Inject BlogPosting schema for this page
            this.injectBlogPostingSchema(blog, id);
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    const el = document.getElementById(this.schemaId);
    if (el) el.remove();
    this.schemaEl = undefined;
  }

  updateBlogSEO(blog: any): void {
    this.titleService.setTitle(`${blog.title} | M&J Blog`);

    this.metaService.updateTag({
      name: 'description',
      content: blog.description || 'Expert automotive advice from M&J Quality Used Cars.',
    });

    this.metaService.updateTag({ property: 'og:title', content: blog.title });
    this.metaService.updateTag({ property: 'og:image', content: blog.image || '' });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });

    this.metaService.updateTag({ name: 'geo.region', content: 'PH-PAM' });
    this.metaService.updateTag({ name: 'geo.placename', content: 'Mabalacat, Pampanga' });
  }

  private injectBlogPostingSchema(blog: any, id: string): void {
    // ✅ Prevent duplicates
    const existing = document.getElementById(this.schemaId);
    if (existing) existing.remove();

    // ✅ No trailing slash
    const BASE_URL = 'https://www.mjqualitycars.com';
    const BUSINESS_NAME = 'MJ Quality Used Cars';

    // ✅ Use a real hosted image URL for schema (NOT base64)
    const LOGO_URL = `${BASE_URL}/MJlogo.webp`;

    const postUrl = `${BASE_URL}/blog/${encodeURIComponent(id)}`;

    const description =
      blog?.description ||
      (blog?.content ? String(blog.content).replace(/<[^>]*>/g, '').slice(0, 160) : '');

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: blog?.title || 'Blog Post',
      description,
      mainEntityOfPage: postUrl,
      url: postUrl,

      // ✅ Your API has blog.date like "2026-02-07"
      datePublished: blog?.date,
      dateModified: blog?.date,

      // ✅ Avoid base64 image in schema; use hosted logo for now
      image: [LOGO_URL],

      // ✅ Your API has blog.author
      author: blog?.author
        ? { '@type': 'Person', name: blog.author }
        : { '@type': 'Organization', name: BUSINESS_NAME },

      publisher: {
        '@type': 'Organization',
        name: BUSINESS_NAME,
        logo: {
          '@type': 'ImageObject',
          url: LOGO_URL,
        },
      },
    };

    this.schemaEl = document.createElement('script');
    this.schemaEl.id = this.schemaId;
    this.schemaEl.type = 'application/ld+json';
    this.schemaEl.text = JSON.stringify(schema);
    document.head.appendChild(this.schemaEl);
  }
}