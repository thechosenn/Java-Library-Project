import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

// standalone: true means this component declares its own dependencies
// (CommonModule for *ngFor/*ngIf) instead of belonging to an NgModule.
// This is the modern Angular style (v14+) and what app.routes.ts expects.
@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-list.component.html',
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  errorMessage = '';

  constructor(private bookService: BookService) {}

  // ngOnInit runs once, right after Angular creates the component -
  // the natural place to trigger the initial data load (similar to
  // a constructor in spirit, but safer to inject/use services in).
  ngOnInit(): void {
    this.bookService.getAllBooks().subscribe({
      next: (data) => (this.books = data),
      error: (err) => (this.errorMessage = 'Could not load books: ' + err.message),
    });
  }
}
