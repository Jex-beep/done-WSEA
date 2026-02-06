import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { Title, Meta } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { Nav } from '../nav/nav';
import { Footer } from '../footer/footer';
import { CarService } from '../services/car';
import { AuthService } from '../services/auth';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, Nav, Footer, RouterLink, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css'
})
export class Products implements OnInit {
  public authService = inject(AuthService);
  private carService = inject(CarService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private cdr = inject(ChangeDetectorRef);

  // --- State Management ---
  isLoading: boolean = true; // Added this property for the spinner
  selectedCategory: string = 'All';
  inventory: any[] = []; 
  isFilterMenuOpen: boolean = false;
  showAddModal = false;
  isSaving = false; 
  isEditMode = false;
  currentEditId: string | null = null;

  showSuccessPopup: boolean = false;
  successMessage: string = '';

  mainFileName: string = '';
  galleryFileNames: string[] = [];

  newCar: any = {
    make: '',
    model: '',
    year: '',
    type: '', 
    price: '',
    engine: '',
    gearbox: '',
    fuel: '',
    distance: '',
    seats: '',
    ac: '',
    image: '',
    gallery: [] as string[],
    equipment: [''], 
    description: '',
    isAvailable: true
  };

  ngOnInit(): void {
    this.loadCars(); // This now handles the isLoading state
    this.setInitialSEO();
  }

  // --- Equipment Management ---
  addEquipment() {
    if (this.newCar.equipment.length < 6) {
      this.newCar.equipment.push('');
      this.cdr.detectChanges();
    }
  }

  removeEquipment(index: number) {
    if (this.newCar.equipment.length > 1) {
      this.newCar.equipment.splice(index, 1);
    } else {
      this.newCar.equipment[0] = '';
    }
    this.cdr.detectChanges();
  }

  trackByFn(index: any, item: any) {
    return index;
  }

  // --- SEO & Meta Tags ---
  setInitialSEO() {
    this.titleService.setTitle('Our Inventory | M&J Quality Used Cars Mabalacat');
    this.metaService.addTags([
      { name: 'description', content: 'Browse our premium selection of quality used cars in Mabalacat, Pampanga. High-resolution gallery and full vehicle specs.' },
      { name: 'keywords', content: 'used cars Mabalacat, second hand cars Pampanga, M&J Quality Used Cars, buy car Pampanga, quality cars Mabalacat City, affordable used cars PH, car dealer pampanga, toyota mabalacat, honda mabalacat' },
      { name: 'robots', content: 'index, follow' },
      { name: 'author', content: 'M&J Quality Used Cars' },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'M&J Quality Used Cars' },
      { property: 'og:title', content: 'M&J Quality Used Cars - Admin Managed Inventory' },
      { property: 'og:description', content: 'Check out our latest inspected used vehicles in Mabalacat City. Sedans, SUVs, Pickups, and Motors available.' },
      { property: 'og:image', content: '/bluecar.png' },
      { property: 'og:url', content: 'https://mjqualityusedcars.com/products' },
      { name: 'geo.region', content: 'PH-PAM' },
      { name: 'geo.placename', content: 'Mabalacat City' },
      { name: 'geo.position', content: '15.2215;120.5744' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'revisit-after', content: '1 day' },
      { name: 'format-detection', content: 'telephone=no' },
      { name: 'theme-color', content: '#e31e24' }
    ]);
  }

  updateSEO(category: string): void {
    const description = `Find the best deals on used ${category}s in Mabalacat City at M&J Quality Used Cars. Fast approval and quality checked.`;
    this.metaService.updateTag({ name: 'description', content: description });
    this.metaService.updateTag({ property: 'og:title', content: `M&J Quality Used Cars - ${category} Inventory` });
    this.metaService.updateTag({ name: 'keywords', content: `used ${category} Mabalacat, second hand ${category} Pampanga, M&J ${category} stock` });
  }

  loadCars() {
    this.isLoading = true; // Start the spinner
    this.carService.getCars().subscribe({
      next: (data: any) => {
        this.inventory = data;
        this.isLoading = false; // Stop spinner on success
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Database connection failed', err);
        this.isLoading = false; // Stop spinner on error
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(event: any) {
    let value = event.target.value.replace(/\D/g, ''); 
    this.newCar.price = value; 
    if (value) {
      event.target.value = '₱ ' + new Intl.NumberFormat('en-PH').format(parseInt(value));
    }
  }

  // --- File Upload Handling ---
  onFileSelected(event: any, type: 'main' | 'gallery') {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (type === 'main') {
      this.mainFileName = files[0].name;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newCar.image = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(files[0]);
    } else {
      Array.from(files).forEach((file: any) => {
        this.galleryFileNames.push(file.name);
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.newCar.gallery.push(e.target.result);
          this.cdr.detectChanges();
        };
        reader.readAsDataURL(file);
      });
    }
    event.target.value = ''; 
    this.cdr.detectChanges();
  }

  removeGalleryImage(index: number) {
    this.newCar.gallery.splice(index, 1);
    this.galleryFileNames.splice(index, 1);
    this.cdr.detectChanges();
  }

  submitCar(event?: Event) {
    if (event) {
      event.preventDefault();
    }

    if (this.isSaving) return;
    this.isSaving = true;

    const finalEquipment = this.newCar.equipment.filter((e: string) => e && e.trim() !== '');
    const fullGallery = [...this.newCar.gallery];
    const initialData = { ...this.newCar, gallery: [], equipment: finalEquipment };

    if (this.isEditMode && this.currentEditId) {
      this.carService.updateCar(this.currentEditId, initialData).subscribe({
        next: () => {
          this.carService.updateCar(this.currentEditId!, { gallery: fullGallery }).subscribe({
            next: () => this.triggerSuccess('Listing updated successfully!'),
            error: () => this.triggerSuccess('Data updated, but gallery was too heavy.')
          });
        },
        error: (err) => {
          this.isSaving = false;
          this.handleError(err);
        }
      });
    } else {
      this.carService.addCar(initialData).subscribe({
        next: (res: any) => {
          const carId = res.id || res._id; 
          this.carService.updateCar(carId, { gallery: fullGallery }).subscribe({
            next: () => this.triggerSuccess('Car added successfully!'),
            error: () => this.triggerSuccess('Car added, but gallery failed.')
          });
        },
        error: (err) => {
          this.isSaving = false;
          this.handleError(err);
        }
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
    this.loadCars();
    this.cdr.detectChanges();
    setTimeout(() => {
      this.showSuccessPopup = false;
      this.cdr.detectChanges();
    }, 4000);
  }

  handleError(err: any) {
    this.isSaving = false;
    this.successMessage = "Error: Could not save vehicle.";
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

  openEditModal(car: any) {
    this.isEditMode = true;
    this.currentEditId = car._id;
    const loadedEquip = car.equipment && car.equipment.length > 0 ? [...car.equipment] : [''];
    this.newCar = { ...car, equipment: loadedEquip };
    this.mainFileName = 'Existing Main Image';
    this.galleryFileNames = car.gallery ? car.gallery.map((_: any, i: number) => `Gallery Photo ${i + 1}`) : [];
    this.showAddModal = true;
    document.body.style.overflow = 'hidden';
    this.cdr.detectChanges();
  }

  resetForm() {
    this.mainFileName = '';
    this.galleryFileNames = [];
    this.newCar = {
      make: '', model: '', year: '', type: '', price: '',
      engine: '', gearbox: '', fuel: '', distance: '',
      seats: '', ac: '', image: '', gallery: [], equipment: [''],
      description: '', isAvailable: true
    };
    this.cdr.detectChanges();
  }

  onDelete(id: string) {
    if(confirm('Are you sure you want to remove this vehicle?')) {
      this.carService.deleteCar(id).subscribe({
        next: () => {
          this.loadCars();
          this.triggerSuccess('Vehicle deleted successfully.');
        },
        error: (err: any) => {
          this.successMessage = "Delete failed.";
          this.showSuccessPopup = true;
          this.cdr.detectChanges();
          setTimeout(() => { this.showSuccessPopup = false; this.cdr.detectChanges(); }, 4000);
        }
      });
    }
  }

  toggleFilterMenu(): void {
    this.isFilterMenuOpen = !this.isFilterMenuOpen;
    document.body.style.overflow = this.isFilterMenuOpen ? 'hidden' : 'auto';
    this.cdr.detectChanges();
  }

  filterCars(category: string): void {
    this.selectedCategory = category;
    this.isFilterMenuOpen = false;
    document.body.style.overflow = 'auto';
    window.scrollTo({ top: 300, behavior: 'smooth' });
    this.updateSEO(category);
    this.cdr.detectChanges();
  }

  formatMileage(event: any) {
    let value = event.target.value.replace(/\D/g, ''); 
    this.newCar.distance = value; 
    if (value) {
      event.target.value = new Intl.NumberFormat('en-PH').format(parseInt(value));
    } else {
      event.target.value = '';
    }
  }

  get availableCars() {
    if (this.selectedCategory === 'All') return this.inventory.filter(car => car.isAvailable);
    return this.inventory.filter(car => 
      car.isAvailable && car.type.toLowerCase() === this.selectedCategory.toLowerCase()
    );
  }
}