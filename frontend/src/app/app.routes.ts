import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Products } from './products/products';
import { Blog } from './blog/blog';
import { Contact } from './contact/contact';
import { Error } from './error/error';
import { ProductDetail } from './products/product-detail/product-detail';
import { BlogService } from './services/blogs';
import { BlogDetail } from './blog/blog-detail/blog-detail';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'about',
        component: About
    },
    {
        path: 'products',
        component: Products
    },
    {
        path: 'products/:id',
        component: ProductDetail
    },
    {
        path: 'blog',
        component: Blog
    },
    {
        path: 'blog/:id',
        component: BlogDetail
    },
    {
        path: 'contact',
        component: Contact
    },
    {
        path: 'adminlogin',
        loadComponent: () => import('./adminlogin/adminlogin').then(m => m.Adminlogin)
    },
    {
        path: '**',
        component: Error
    }
];
