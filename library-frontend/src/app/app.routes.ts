import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';
import { BookFormComponent } from './components/book-form/book-form.component';

// Each route maps a URL path to a standalone component. Order matters:
// a literal path like 'books/new' should come before a param route like
// 'books/:id' so it doesn't get swallowed by the wildcard match.
export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: BookListComponent },
  { path: 'books/new', component: BookFormComponent },
  { path: 'books/:id/edit', component: BookFormComponent },
];
