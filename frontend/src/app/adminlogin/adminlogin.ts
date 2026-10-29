import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth'; 
import { Router, RouterLink } from '@angular/router';
import { Nav } from '../nav/nav';

@Component({
  selector: 'app-adminlogin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Nav],
  templateUrl: './adminlogin.html',
  styleUrl: './adminlogin.css'
})
export class Adminlogin {
  authService = inject(AuthService);
  router = inject(Router);

  loginData = { username: '', password: '' };
  errorMessage = '';
  isLoading = false;
  
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    this.isLoading = true;
    this.errorMessage = ''; // Clear previous errors

    // 1. We call the authService and pass our loginData
    this.authService.login(this.loginData).subscribe({
      next: (res: any) => {
        // 2. The service handles the Signal and LocalStorage automatically
        this.isLoading = false;
        console.log('✅ Welcome, ' + res.user);
        this.router.navigate(['/']); 
      },
      error: (err) => {
        this.isLoading = false;
        // 3. Show a friendly error if the database check fails
        this.errorMessage = err.error?.message || 'Login Failed: Access Denied';
      }
    });
  }
}