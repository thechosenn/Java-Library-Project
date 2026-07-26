import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Book } from '../../models/book.model';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './book-list.component.html',
})
export class BookListComponent implements OnInit {
  books: Book[] = [];
  errorMessage = '';

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  loadBooks(): void {
    this.bookService.getAllBooks().subscribe({
      next: (data) => (this.books = data),
      error: (err) => (this.errorMessage = 'Could not load books: ' + err.message),
    });
  }

  deleteBook(id: number): void {
    if (!confirm('Delete this book?')) {
      return;
    }
    this.bookService.deleteBook(id).subscribe({
      next: () => this.loadBooks(),
      error: (err) => (this.errorMessage = 'Could not delete book: ' + err.message),
    });
  }

  borrowBook(id: number): void {
    this.bookService.borrowBook(id).subscribe({
      next: () => this.loadBooks(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Could not borrow book'),
    });
  }

  returnBook(id: number): void {
    this.bookService.returnBook(id).subscribe({
      next: () => this.loadBooks(),
      error: (err) => (this.errorMessage = err.error?.message ?? 'Could not return book'),
    });
  }
}
