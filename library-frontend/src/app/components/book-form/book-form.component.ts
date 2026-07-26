import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { Author } from '../../models/author.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './book-form.component.html',
})
export class BookFormComponent implements OnInit {
  form!: FormGroup;
  authors: Author[] = [];
  isEditMode = false;
  bookId: number | null = null;
  errorMessage = '';
  fieldErrors: Record<string, string> = {};

  // used by the small "add a new author on the fly" mini-form
  newAuthorName = '';

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private authorService: AuthorService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // FormBuilder.group() builds a reactive form: each control below tracks
    // its own value + validation state, independent of the DOM. Validators
    // here mirror the backend's @NotBlank/@NotNull - this gives instant
    // feedback in the browser, but the backend still re-validates on submit
    // (never trust client-side validation alone).
    this.form = this.fb.group({
      title: ['', Validators.required],
      isbn: ['', Validators.required],
      authorId: [null, Validators.required],
    });

    this.loadAuthors();

    // route param exists -> we're editing an existing book
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.bookId = Number(idParam);
      this.bookService.getBookById(this.bookId).subscribe({
        next: (book) =>
          this.form.patchValue({
            title: book.title,
            isbn: book.isbn,
            authorId: book.authorId,
          }),
        error: (err) => (this.errorMessage = 'Could not load book: ' + err.message),
      });
    }
  }

  loadAuthors(): void {
    this.authorService.getAllAuthors().subscribe({
      next: (data) => (this.authors = data),
      error: (err) => (this.errorMessage = 'Could not load authors: ' + err.message),
    });
  }

  addAuthor(): void {
    if (!this.newAuthorName.trim()) {
      return;
    }
    this.authorService.createAuthor(this.newAuthorName.trim()).subscribe({
      next: (author) => {
        this.authors.push(author);
        this.form.patchValue({ authorId: author.id }); // auto-select the new author
        this.newAuthorName = '';
      },
      error: (err) => (this.errorMessage = 'Could not create author: ' + err.message),
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.fieldErrors = {};

    if (this.form.invalid) {
      this.form.markAllAsTouched(); // forces validation messages to show
      return;
    }

    const request = this.form.value;
    const save$ = this.isEditMode
      ? this.bookService.updateBook(this.bookId!, request)
      : this.bookService.createBook(request);

    save$.subscribe({
      next: () => this.router.navigate(['/books']),
      error: (err) => {
        // matches the { errors: { field: message } } shape from
        // GlobalExceptionHandler's validation handler
        this.fieldErrors = err.error?.errors ?? {};
        this.errorMessage = err.error?.message ?? 'Could not save book';
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/books']);
  }
}
