// Add this to your imports at the top
import { ImageOptimizationService } from '../services/image-optimization';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { BlogService } from '../services/blogs';
import { AuthService } from '../services/auth';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink, FormsModule, QuillModule],
  templateUrl: './blog.html',
  styleUrl: './blog.css'
})
export class Blog implements OnInit {
  public authService = inject(AuthService);
  private blogService = inject(BlogService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private cdr = inject(ChangeDetectorRef);
  private router = inject(Router);
  private imageService = inject(ImageOptimizationService)

  // --- State Management ---
  isLoading: boolean = true;
  selectedCategory: string = 'All';
  isFilterMenuOpen: boolean = false; 
  blogs: any[] = [];
  showAddModal = false;
  isSaving = false;
  isEditMode = false;
  currentEditId: string | null = null;

  showSuccessPopup: boolean = false;
  successMessage: string = '';
  
  mainFileName: string = '';
  authorFileName: string = '';

  newBlog: any = {
    title: '',
    category: 'Guides',
    date: '',
    author: '',
    authorImage: '',
    readTime: '',
    image: '',
    imageAlt: '', 
    description: '',
    content: '',
    inlineImages: [] 
  };

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Analytics tracking
        if ((window as any).gtag) {
          (window as any).gtag('config', 'G-R5W1YYRC92', { page_path: event.urlAfterRedirects });
        }
        console.log('GA page view:', event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    this.loadBlogs();
    this.setInitialSEO();
  }

  // --- Quill Image Detection Logic ---
  onContentChanged(event: any) {
    const html = event.html;
    if (!html) {
      this.newBlog.inlineImages = [];
      return;
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const images = Array.from(doc.querySelectorAll('img'));

    // Sync the local inlineImages array with images found in the editor
    this.newBlog.inlineImages = images.map((img: any, index: number) => {
      const existingAlt = this.newBlog.inlineImages[index]?.alt || img.getAttribute('alt') || '';
      return {
        src: img.getAttribute('src'),
        alt: existingAlt
      };
    });
    this.cdr.detectChanges();
  }

// --- SEO & Meta Tags ---
  setInitialSEO() {
    const siteTitle = 'M&J Quality Used Cars | Automotive Blog & Guides Mabalacat City';
    const description = 'Expert car buying guides, maintenance tips, and automotive news in Mabalacat City, Pampanga. Trust M&J Quality Used Cars for reliable vehicle advice.';
    
    this.titleService.setTitle(siteTitle);
    this.metaService.addTags([
      { name: 'description', content: description },
      { name: 'keywords', content: 'used cars Mabalacat City, second hand cars Pampanga, M&J Quality Cars blog, car dealer Sta. Ines, car maintenance tips Philippines, buy used cars Mabalacat, automotive guides Pampanga' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'M&J Quality Used Cars' },
      // Local SEO / Geo Tags
      { name: 'geo.region', content: 'PH-PAM' },
      { name: 'geo.placename', content: 'Mabalacat City' },
      { name: 'geo.position', content: '15.2238;120.5739' },
      { name: 'ICBM', content: '15.2238, 120.5739' },
      // Social Media Tags
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: siteTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: '/assets/blog-thumbnail.jpg' },
      { property: 'og:url', content: 'https://mjqualityusedcars.com/blog' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'theme-color', content: '#e31e24' }
    ]);
  }

  updateSEO(category: string): void {
    const description = `Read our latest ${category} articles and automotive guides in Mabalacat City at M&J Quality Used Cars.`;
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: `M&J Blog - ${category} Insights` });
    this.metaService.updateTag({ name: 'keywords', content: `used cars blog, ${category} pampanga, car maintenance tips, M&J blog` });
  }

  loadBlogs() {
    this.isLoading = true;
    this.blogService.getBlogs().subscribe({
      next: (data: any) => {
        this.blogs = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Blog database connection failed', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFilterMenu(): void {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
    document.body.style.overflow = this.isFilterMenuOpen ? 'hidden' : 'auto';
    this.cdr.detectChanges();
  }

  filterBlogs(category: string): void {
    this.selectedCategory = category;
    this.isFilterMenuOpen = false;
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 300, behavior: 'smooth' });
    this.updateSEO(category);
    this.cdr.detectChanges();
  }

async onImageSelected(event: any, type: 'featured' | 'author') {
    const file = event.target.files[0];
    if (!file) return;

    // 1. Set the filename immediately so the *ngIf in HTML sees it
    if (type === 'featured') {
      this.mainFileName = file.name;
    } else {
      this.authorFileName = file.name;
    }
    
    // Trigger detection so the UI shows the "Alt Text" field as soon as filename is set
    this.cdr.detectChanges();

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const originalImage = e.target.result;

      // 2. COMPRESS: This is the "bypass" for your 12MB problem.
      // It shrinks the string size before it ever hits your database.
      const compressed = await this.imageService.compressImage(originalImage);

      if (type === 'featured') {
        this.newBlog.image = compressed;
      } else {
        this.newBlog.authorImage = compressed;
      }
      this.cdr.detectChanges(); 
    };
    reader.readAsDataURL(file);
  }

  clearFile(type: 'author' | 'featured', input: HTMLInputElement) {
    input.value = ''; 
    if (type === 'author') {
      this.authorFileName = '';
      this.newBlog.authorImage = '';
    } else {
      this.mainFileName = '';
      this.newBlog.image = '';
      this.newBlog.imageAlt = '';
    }
    this.cdr.detectChanges();
  }

  // --- CRUD Operations ---
  submitBlog(event?: Event) {
    if (event) event.preventDefault();
    if (this.isSaving) return;
    this.isSaving = true;

    if (!this.newBlog.date) {
      this.newBlog.date = new Date().toISOString().split('T')[0];
    }

    // FIXED: Ensure Featured Image Alt is properly set with fallback
    if (!this.newBlog.imageAlt || this.newBlog.imageAlt.trim() === '') {
      this.newBlog.imageAlt = this.newBlog.title || 'Blog featured image';
    }

    // Process Quill content images and ensure they have alt tags
    if (this.newBlog.content) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(this.newBlog.content, 'text/html');
      const images = doc.querySelectorAll('img');

      images.forEach((img, index) => {
        // Fallback: If no custom inline alt, use "Title - image index"
        const fallbackAlt = `${this.newBlog.title || 'Blog content'} - image ${index + 1}`;
        const altText = (this.newBlog.inlineImages[index] && this.newBlog.inlineImages[index].alt) 
                        ? this.newBlog.inlineImages[index].alt 
                        : fallbackAlt;
        
        img.setAttribute('alt', altText);
      });
      
      this.newBlog.content = doc.body.innerHTML;
    }

    const blogToSave = { ...this.newBlog }; 

    // Log to verify alt text is being saved
    console.log('Saving blog with imageAlt:', blogToSave.imageAlt);

    if (this.isEditMode && this.currentEditId) {
      this.blogService.updateBlog(this.currentEditId, blogToSave).subscribe({
        next: () => this.triggerSuccess('Article updated successfully!'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.blogService.addBlog(blogToSave).subscribe({
        next: () => this.triggerSuccess('Article published successfully!'),
        error: (err) => this.handleError(err)
      });
    }
  }

  triggerSuccess(msg: string) {
    this.isSaving = false;
    this.successMessage = msg;
    this.showSuccessPopup = true;
    this.showAddModal = false; 
    document.body.style.overflow = 'auto';
    this.resetForm();
    this.loadBlogs();
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.showSuccessPopup = false; 
      this.cdr.detectChanges(); 
    }, 3000);
  }

  handleError(err: any) {
    this.isSaving = false;
    this.successMessage = "Error: Could not save article.";
    this.showSuccessPopup = true;
    this.cdr.detectChanges();
    setTimeout(() => { 
      this.showSuccessPopup = false; 
      this.cdr.detectChanges(); 
    }, 4000);
  }

  toggleAddModal() {
    this.showAddModal = !this.showAddModal;
    this.isEditMode = false;
    this.currentEditId = null;
    document.body.style.overflow = this.showAddModal ? 'hidden' : 'auto';
    if (!this.showAddModal) this.resetForm();
    this.cdr.detectChanges();
  }

  openEditModal(blog: any) {
    this.isEditMode = true;
    this.currentEditId = blog._id;
    // Deep copy to prevent accidental live-binding
    this.newBlog = JSON.parse(JSON.stringify(blog));
    
    // Ensure the alt property exists even for old posts
    if (!this.newBlog.imageAlt) this.newBlog.imageAlt = blog.title;
    if (!this.newBlog.inlineImages) this.newBlog.inlineImages = [];
    
    this.mainFileName = blog.image ? 'Existing Featured Image' : '';
    this.authorFileName = blog.authorImage ? 'Existing Author Image' : '';
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  resetForm() {
    this.mainFileName = '';
    this.authorFileName = '';
    this.newBlog = {
      title: '', 
      category: 'Guides', 
      date: '', 
      author: 'M&J Admin',
      authorImage: '', 
      readTime: '5 min read', 
      image: '', 
      imageAlt: '',
      description: '', 
      content: '',
      inlineImages: []
    };
    this.cdr.detectChanges();
  }

  onDelete(id: string) {
    if(confirm('Delete this article?')) {
      this.blogService.deleteBlog(id).subscribe({
        next: () => {
          this.loadBlogs();
          this.triggerSuccess('Article removed.');
        },
        error: () => alert('Delete failed.')
      });
    }
  }

  get availableBlogs() {
    if (this.selectedCategory === 'All') return this.blogs;
    return this.blogs.filter(post => 
      post.category.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }
}
