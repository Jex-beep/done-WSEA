import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);
  // URL to your Node.js backend - ensure the route exists in server.js
// private apiUrl = 'http://localhost:3000/api/blogs'; // OLD
private apiUrl = 'https://mjqualitycars-backend-api.onrender.com/api/blogs'; // NEW

  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBlogById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  addBlog(blogData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, blogData);
  }

  updateBlog(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${id}`, data);
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
