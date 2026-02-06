import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta, DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../services/blogs';
import { Nav } from '../../nav/nav';
import { Footer } from '../../footer/footer';
import { Observable, tap, map } from 'rxjs';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.css'
})
export class BlogDetail implements OnInit {
  blog$: Observable<any> | undefined;

  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.blog$ = this.blogService.getBlogById(id).pipe(
        map(res => res.data ? res.data : res),
        map(blog => {
          // FIX: Replace &nbsp; with regular spaces
          if (blog && blog.content) {
            blog.content = blog.content.replace(/&nbsp;/g, ' ');
          }
          return blog;
        }),
        tap(blog => {
          if (blog) {
            // DEBUG: Check if title has spaces
            console.log('Title:', blog.title);
            console.log('Title has spaces:', blog.title.includes(' '));
            console.log('Title length:', blog.title.length);
            console.log('Content preview:', blog.content?.substring(0, 100));
            
            this.updateBlogSEO(blog);
          }
        })
      );
    }
  }

  updateBlogSEO(blog: any): void {
    this.titleService.setTitle(`${blog.title} | M&J Blog`);
    this.metaService.updateTag({ name: 'description', content: blog.description || 'Expert automotive advice from M&J Quality Used Cars.' });
    this.metaService.updateTag({ property: 'og:title', content: blog.title });
    this.metaService.updateTag({ property: 'og:image', content: blog.image || '' });
    this.metaService.updateTag({ property: 'og:url', content: window.location.href });
    this.metaService.updateTag({ name: 'geo.region', content: 'PH-PAM' });
    this.metaService.updateTag({ name: 'geo.placename', content: 'Mabalacat, Pampanga' });
  }
}