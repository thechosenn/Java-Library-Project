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

  constructor(private http: HttpClient) {}

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
