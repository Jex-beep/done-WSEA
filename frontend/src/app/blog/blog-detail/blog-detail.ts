import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title, Meta, DomSanitizer } from '@angular/platform-browser';
import { BlogService } from '../../services/blogs';
import { Nav } from '../../nav/nav';
import { Footer } from '../../footer/footer';
import { Observable, tap, map, switchMap, of, catchError } from 'rxjs';

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
  private router = inject(Router);
  private blogService = inject(BlogService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  private schemaId = 'mj-blogposting-schema';
  private schemaEl?: HTMLScriptElement;

  // ✅ Mongo ObjectId check (24 hex chars)
  private isMongoId(value: string): boolean {
    return /^[a-f0-9]{24}$/i.test(value);
  }

  ngOnInit(): void {
    // We keep route param name as "id" (since your route is blog/:id)
    const value = this.route.snapshot.paramMap.get('slug');

    if (!value) return;

    // If param looks like Mongo ID → fetch by ID then redirect to slug
    // Else → treat as slug and fetch by slug
    this.blog$ = (this.isMongoId(value)
      ? this.blogService.getBlogById(value).pipe(
          map((res) => (res?.data ? res.data : res)),
          tap((blog) => {
            // If we got a slug, redirect to canonical URL
            if (blog?.slug) {
              this.router.navigateByUrl(`/blog/${encodeURIComponent(blog.slug)}`, { replaceUrl: true });
            }
          }),
          // After redirect, still return blog so page can render immediately if needed
          map((blog) => blog)
        )
      : this.blogService.getBlogBySlug(value).pipe(
          map((res) => (res?.data ? res.data : res))
        )
    ).pipe(
      map((blog) => {
        if (blog?.content) {
          blog.content = blog.content.replace(/&nbsp;/g, ' ');
        }
        return blog;
      }),
      tap((blog) => {
        if (blog) {
          this.updateBlogSEO(blog);

          // ✅ Use slug if available; fallback to current URL param
          const canonicalSlug = blog.slug || value;
          this.injectBlogPostingSchema(blog, canonicalSlug);
        }
      }),
      catchError((err) => {
        console.error('Blog detail load error:', err);
        // Optional: route to error page
        // this.router.navigateByUrl('/error');
        return of(null);
      })
    );
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

    // ✅ OG URL should be canonical slug URL if possible
    const BASE_URL = 'https://www.mjqualitycars.com';
    const slug = blog.slug ? encodeURIComponent(blog.slug) : '';
    const canonicalUrl = slug ? `${BASE_URL}/blog/${slug}` : window.location.href;
    this.metaService.updateTag({ property: 'og:url', content: canonicalUrl });

    this.metaService.updateTag({ name: 'geo.region', content: 'PH-PAM' });
    this.metaService.updateTag({ name: 'geo.placename', content: 'Mabalacat, Pampanga' });
  }

  private injectBlogPostingSchema(blog: any, slug: string): void {
    const existing = document.getElementById(this.schemaId);
    if (existing) existing.remove();

    const BASE_URL = 'https://www.mjqualitycars.com';
    const BUSINESS_NAME = 'MJ Quality Used Cars';
    const LOGO_URL = `${BASE_URL}/MJlogo.webp`;

    // ✅ Canonical post URL uses slug
    const postUrl = `${BASE_URL}/blog/${encodeURIComponent(slug)}`;

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
      datePublished: blog?.date,
      dateModified: blog?.date,
      image: [LOGO_URL],
      author: blog?.author
        ? { '@type': 'Person', name: blog.author }
        : { '@type': 'Organization', name: BUSINESS_NAME },
      publisher: {
        '@type': 'Organization',
        name: BUSINESS_NAME,
        logo: { '@type': 'ImageObject', url: LOGO_URL },
      },
    };

    this.schemaEl = document.createElement('script');
    this.schemaEl.id = this.schemaId;
    this.schemaEl.type = 'application/ld+json';
    this.schemaEl.text = JSON.stringify(schema);
    document.head.appendChild(this.schemaEl);
  }
}