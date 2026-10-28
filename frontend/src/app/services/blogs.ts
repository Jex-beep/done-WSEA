import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE } from '../api-config';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private http = inject(HttpClient);

  private apiUrl = `${API_BASE}/api/blogs`;

  getBlogs(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getBlogById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }

  // ✅ NEW: fetch by slug
  getBlogBySlug(slug: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/slug/${encodeURIComponent(slug)}`);
  }

  addBlog(blogData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, blogData);
  }

  updateBlog(id: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${encodeURIComponent(id)}`, data);
  }

  deleteBlog(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${encodeURIComponent(id)}`);
  }
}