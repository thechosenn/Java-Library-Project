import { Routes } from '@angular/router';
import { BookListComponent } from './components/book-list/book-list.component';

// Each route maps a URL path to a standalone component. path: '' means
// "the default route, shown at the root URL" - redirectTo sends a bare
// visit to /books straight to it. More routes (book detail, add form)
// get added here in Step 4.
export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: BookListComponent },
];
