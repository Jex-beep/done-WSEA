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

  // --- State Management ---
  isLoading: boolean = true;
  selectedCategory: string = 'All';
  isFilterMenuOpen: boolean = false; // Logic from Products
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
    description: '',
    content: ''
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
        (window as any).gtag('config', 'G-R5W1YYRC92', { page_path: event.urlAfterRedirects });
        console.log('GA page view:', event.urlAfterRedirects);
      }
    });
  }

  ngOnInit(): void {
    this.loadBlogs();
    this.setInitialSEO();
  }

  // --- SEO & Meta Tags (Logic from Products) ---
  setInitialSEO() {
    this.titleService.setTitle('Automotive Blog & Guides | M&J Quality Used Cars');
    this.metaService.addTags([
      { name: 'description', content: 'Expert car buying guides and automotive news in Mabalacat City from M&J Quality Used Cars.' },
      { name: 'keywords', content: 'used cars Mabalacat blog, Pampanga car guides, M&J automotive news, car maintenance Pampanga, car dealer pampanga' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'M&J Quality Used Cars' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'M&J Quality Used Cars' },
      { property: 'og:title', content: 'M&J Automotive Blog - Expert Insights' },
      { property: 'og:description', content: 'Providing the community with quality car advice and news.' },
      { property: 'og:image', content: '/assets/blog-thumbnail.jpg' },
      { property: 'og:url', content: 'https://mjqualityusedcars.com/blog' },
      { name: 'geo.region', content: 'PH-PAM' },
      { name: 'geo.placename', content: 'Mabalacat City' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'revisit-after', content: '1 day' },
      { name: 'format-detection', content: 'telephone=no' },
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

  // --- Mobile Navigation Logic (Direct Copy from Products) ---
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

  // --- Image Handling ---
  onImageSelected(event: any, type: 'featured' | 'author') {
    const file = event.target.files[0];
    if (!file) return;

    if (type === 'featured') {
      this.mainFileName = file.name;
    } else {
      this.authorFileName = file.name;
    }

    const reader = new FileReader();
    reader.onload = (e: any) => {
      if (type === 'featured') {
        this.newBlog.image = e.target.result;
      } else {
        this.newBlog.authorImage = e.target.result;
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

    const blogToSave = { ...this.newBlog }; 

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
    this.newBlog = { ...blog };
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
      title: '', category: 'Guides', date: '', author: 'M&J Admin',
      authorImage: '', readTime: '5 min read', image: '', description: '', content: ''
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