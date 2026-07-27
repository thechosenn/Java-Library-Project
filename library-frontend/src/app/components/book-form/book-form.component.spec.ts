import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { BookFormComponent } from './book-form.component';
import { BookService } from '../../services/book.service';
import { AuthorService } from '../../services/author.service';
import { Author } from '../../models/author.model';
import { Book } from '../../models/book.model';

describe('BookFormComponent', () => {
  let component: BookFormComponent;
  let fixture: ComponentFixture<BookFormComponent>;
  let bookServiceSpy: jasmine.SpyObj<BookService>;
  let authorServiceSpy: jasmine.SpyObj<AuthorService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockAuthors: Author[] = [{ id: 1, name: 'Robert Martin' }];

  // Builds a fresh TestBed for each test, with an injectable route param map
  // controlling whether we're in "create" or "edit" mode - this is how you
  // simulate visiting /books/new vs /books/5/edit without a real URL change.
  function setup(routeId: string | null) {
    bookServiceSpy = jasmine.createSpyObj('BookService', ['getBookById', 'createBook', 'updateBook']);
    authorServiceSpy = jasmine.createSpyObj('AuthorService', ['getAllAuthors', 'createAuthor']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    authorServiceSpy.getAllAuthors.and.returnValue(of(mockAuthors));

    TestBed.configureTestingModule({
      imports: [BookFormComponent],
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        { provide: AuthorService, useValue: authorServiceSpy },
        { provide: Router, useValue: routerSpy },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap(routeId ? { id: routeId } : {}) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookFormComponent);
    component = fixture.componentInstance;
  }

  describe('create mode (/books/new)', () => {
    beforeEach(() => setup(null));

    it('should start with an invalid, empty form', () => {
      fixture.detectChanges();
      expect(component.isEditMode).toBeFalse();
      expect(component.form.valid).toBeFalse();
    });

    it('should not call createBook when the form is invalid', () => {
      fixture.detectChanges();
      component.onSubmit();
      expect(bookServiceSpy.createBook).not.toHaveBeenCalled();
    });

    it('should call createBook and navigate to /books on valid submit', () => {
      fixture.detectChanges();
      const created: Book = {
        id: 1, title: 'Clean Code', isbn: '123', available: true, authorId: 1, authorName: 'Robert Martin',
      };
      bookServiceSpy.createBook.and.returnValue(of(created));

      component.form.setValue({ title: 'Clean Code', isbn: '123', authorId: 1 });
      component.onSubmit();

      expect(bookServiceSpy.createBook).toHaveBeenCalledWith({
        title: 'Clean Code',
        isbn: '123',
        authorId: 1,
      });
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/books']);
    });

    it('should surface backend field errors without navigating away', () => {
      fixture.detectChanges();
      component.form.setValue({ title: 'Clean Code', isbn: '123', authorId: 1 });

      // simulates the exact error shape GlobalExceptionHandler returns
      bookServiceSpy.createBook.and.returnValue(
        throwError(() => ({ error: { message: 'Validation failed', errors: { isbn: 'ISBN already exists' } } }))
      );

      component.onSubmit();

      expect(component.fieldErrors['isbn']).toBe('ISBN already exists');
      expect(routerSpy.navigate).not.toHaveBeenCalled();
    });

    it('should add a new author and auto-select it', () => {
      fixture.detectChanges();
      const newAuthor: Author = { id: 2, name: 'Martin Fowler' };
      authorServiceSpy.createAuthor.and.returnValue(of(newAuthor));

      component.newAuthorName = 'Martin Fowler';
      component.addAuthor();

      expect(authorServiceSpy.createAuthor).toHaveBeenCalledWith('Martin Fowler');
      expect(component.authors).toContain(newAuthor);
      expect(component.form.get('authorId')?.value).toBe(2);
    });
  });

  describe('edit mode (/books/:id/edit)', () => {
    beforeEach(() => setup('5'));

    it('should load the existing book and pre-fill the form', () => {
      const existing: Book = {
        id: 5, title: '1984', isbn: '456', available: true, authorId: 1, authorName: 'Robert Martin',
      };
      bookServiceSpy.getBookById.and.returnValue(of(existing));

      fixture.detectChanges();

      expect(component.isEditMode).toBeTrue();
      expect(component.form.value.title).toBe('1984');
    });

    it('should call updateBook (not createBook) on submit', () => {
      bookServiceSpy.getBookById.and.returnValue(
        of({ id: 5, title: '1984', isbn: '456', available: true, authorId: 1, authorName: 'Robert Martin' })
      );
      fixture.detectChanges();

      const updated: Book = {
        id: 5, title: '1984 (revised)', isbn: '456', available: true, authorId: 1, authorName: 'Robert Martin',
      };
      bookServiceSpy.updateBook.and.returnValue(of(updated));

      component.form.patchValue({ title: '1984 (revised)' });
      component.onSubmit();

      expect(bookServiceSpy.updateBook).toHaveBeenCalledWith(5, {
        title: '1984 (revised)',
        isbn: '456',
        authorId: 1,
      });
      expect(bookServiceSpy.createBook).not.toHaveBeenCalled();
    });
  });
});
