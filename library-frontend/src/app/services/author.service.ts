import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Author } from '../models/author.model';

@Injectable({
  providedIn: 'root',
})
export class AuthorService {
  private readonly baseUrl = 'http://localhost:8082/api/authors';

  constructor(private http: HttpClient) {}

  getAllAuthors(): Observable<Author[]> {
    return this.http.get<Author[]>(this.baseUrl);
  }

  createAuthor(name: string): Observable<Author> {
    return this.http.post<Author>(this.baseUrl, { name });
  }
}
