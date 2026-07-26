import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Book, BookRequest } from '../models/book.model';

// @Injectable({ providedIn: 'root' }) registers this service once, app-wide -
// Angular's dependency injection then hands the SAME instance to any
// component that asks for it in its constructor. No manual "new BookService()"
// anywhere, same idea as @Autowired/@RequiredArgsConstructor on the Java side.
@Injectable({
  providedIn: 'root',
})
export class BookService {
  private readonly baseUrl = 'http://localhost:8080/api/books';

  // HttpClient is injected the same way - Angular's DI container provides it
  // because we registered provideHttpClient() in app.config.ts.
  constructor(private http: HttpClient) {}

  // Every HttpClient method returns an Observable, NOT the data directly.
  // Think of it like a Java CompletableFuture/Stream: nothing happens until
  // something "subscribes" to it (the component template does this via the
  // async pipe, or we call .subscribe() manually).
  getAllBooks(): Observable<Book[]> {
    return this.http.get<Book[]>(this.baseUrl);
  }

  getBookById(id: number): Observable<Book> {
    return this.http.get<Book>(`${this.baseUrl}/${id}`);
  }

  createBook(request: BookRequest): Observable<Book> {
    return this.http.post<Book>(this.baseUrl, request);
  }

  updateBook(id: number, request: BookRequest): Observable<Book> {
    return this.http.put<Book>(`${this.baseUrl}/${id}`, request);
  }

  deleteBook(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  borrowBook(id: number): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/${id}/borrow`, {});
  }

  returnBook(id: number): Observable<Book> {
    return this.http.post<Book>(`${this.baseUrl}/${id}/return`, {});
  }
}
