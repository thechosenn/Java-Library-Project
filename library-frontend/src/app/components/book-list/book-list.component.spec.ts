import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { BookListComponent } from './book-list.component';
import { BookService } from '../../services/book.service';
import { AuthService } from '../../services/auth.service';
import { Book } from '../../models/book.model';

describe('BookListComponent', () => {
  let component: BookListComponent;
  let fixture: ComponentFixture<BookListComponent>;
  // jasmine.createSpyObj builds a fake object with the listed methods as
  // "spies" - fake functions we control per test, so we NEVER hit a real
  // backend or network in a unit test. Same idea as Mockito's @Mock in Java.
  let bookServiceSpy: jasmine.SpyObj<BookService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  const mockBooks: Book[] = [
    { id: 1, title: 'Clean Code', isbn: '123', available: true, authorId: 1, authorName: 'Robert Martin' },
    { id: 2, title: '1984', isbn: '456', available: false, authorId: 2, authorName: 'George Orwell' },
  ];

  beforeEach(async () => {
    bookServiceSpy = jasmine.createSpyObj('BookService', [
      'getAllBooks',
      'deleteBook',
      'borrowBook',
      'returnBook',
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getUsername', 'logout']);
    authServiceSpy.getUsername.and.returnValue('alice');

    await TestBed.configureTestingModule({
      imports: [BookListComponent], // standalone component - imported directly, no NgModule
      providers: [
        { provide: BookService, useValue: bookServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        provideRouter([]), // RouterLink in the template needs a Router to be injectable
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BookListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // default stub so ngOnInit (which runs on the first fixture.detectChanges())
    // has something to subscribe to
    bookServiceSpy.getAllBooks.and.returnValue(of([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load books on init', () => {
    bookServiceSpy.getAllBooks.and.returnValue(of(mockBooks));

    fixture.detectChanges(); // triggers ngOnInit

    expect(component.books.length).toBe(2);
    expect(component.books[0].title).toBe('Clean Code');
  });

  it('should show an error message when loading books fails', () => {
    bookServiceSpy.getAllBooks.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();

    expect(component.errorMessage).toContain('Could not load books');
  });

  it('should call bookService.borrowBook and reload the list', () => {
    bookServiceSpy.getAllBooks.and.returnValue(of(mockBooks));
    fixture.detectChanges();

    bookServiceSpy.borrowBook.and.returnValue(of(mockBooks[0]));
    // getAllBooks gets called again after a successful borrow - stub it once more
    bookServiceSpy.getAllBooks.and.returnValue(of(mockBooks));

    component.borrowBook(1);

    expect(bookServiceSpy.borrowBook).toHaveBeenCalledWith(1);
    expect(bookServiceSpy.getAllBooks).toHaveBeenCalledTimes(2); // once on init, once after borrow
  });

  it('should not delete when the confirm dialog is cancelled', () => {
    bookServiceSpy.getAllBooks.and.returnValue(of(mockBooks));
    fixture.detectChanges();

    spyOn(window, 'confirm').and.returnValue(false); // simulate the user clicking "Cancel"

    component.deleteBook(1);

    expect(bookServiceSpy.deleteBook).not.toHaveBeenCalled();
  });
});
