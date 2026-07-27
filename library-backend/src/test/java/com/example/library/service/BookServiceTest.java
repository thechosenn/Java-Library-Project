package com.example.library.service;

import com.example.library.dto.BookRequest;
import com.example.library.dto.BookResponse;
import com.example.library.model.Author;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

// @ExtendWith(MockitoExtension.class) tells JUnit 5 to process Mockito's
// annotations (@Mock, @InjectMocks) below - without it, they'd just be null.
@ExtendWith(MockitoExtension.class)
class BookServiceTest {

    // A fake BookRepository - it never touches a real database. We control
    // exactly what it returns for each test with `when(...).thenReturn(...)`.
    @Mock
    private BookRepository bookRepository;

    // AuthorService is a real collaborator BookService depends on - we mock
    // it too, since we're testing BookService in ISOLATION, not AuthorService.
    @Mock
    private AuthorService authorService;

    // Mockito creates a real BookService and automatically injects the two
    // @Mock fields above into its constructor (BookService has a
    // @RequiredArgsConstructor, so this "just works").
    @InjectMocks
    private BookService bookService;

    private Author author;
    private Book book;

    // Runs before EVERY test method - keeps each test starting from the
    // same clean, known state instead of leaking data between tests.
    @BeforeEach
    void setUp() {
        author = Author.builder().id(1L).name("Robert Martin").build();
        book = Book.builder()
                .id(10L)
                .title("Clean Code")
                .isbn("9780132350884")
                .author(author)
                .available(true)
                .build();
    }

    @Test
    void getAllBooks_returnsMappedResponses() {
        when(bookRepository.findAll()).thenReturn(List.of(book));

        List<BookResponse> result = bookService.getAllBooks();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Clean Code");
        assertThat(result.get(0).getAuthorName()).isEqualTo("Robert Martin");
    }

    @Test
    void getBookById_whenFound_returnsBook() {
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        BookResponse result = bookService.getBookById(10L);

        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getIsbn()).isEqualTo("9780132350884");
    }

    @Test
    void getBookById_whenNotFound_throwsException() {
        when(bookRepository.findById(999L)).thenReturn(Optional.empty());

        // assertThatThrownBy runs the lambda and asserts it throws - this is
        // how you test "this should fail" instead of "this should succeed".
        assertThatThrownBy(() -> bookService.getBookById(999L))
                .isInstanceOf(BookNotFoundException.class)
                .hasMessageContaining("999");
    }

    @Test
    void createBook_looksUpAuthorAndSaves() {
        BookRequest request = BookRequest.builder()
                .title("The Pragmatic Programmer")
                .isbn("9780135957059")
                .authorId(1L)
                .build();

        when(authorService.getAuthorById(1L)).thenReturn(author);
        // save() is called with a NEW Book (no id yet) - we just return the
        // saved book as-is, since we're not testing the repository itself.
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookResponse result = bookService.createBook(request);

        assertThat(result.getTitle()).isEqualTo("The Pragmatic Programmer");
        assertThat(result.getAuthorId()).isEqualTo(1L);
        // verify() confirms a mock method was actually called - proves the
        // service really did save the book, not just return input unchanged.
        verify(bookRepository).save(any(Book.class));
    }

    @Test
    void borrowBook_whenAvailable_marksUnavailable() {
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookResponse result = bookService.borrowBook(10L);

        assertThat(result.isAvailable()).isFalse();
    }

    @Test
    void borrowBook_whenAlreadyBorrowed_throwsException() {
        book.setAvailable(false); // simulate: someone already borrowed it
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> bookService.borrowBook(10L))
                .isInstanceOf(BookAlreadyBorrowedException.class);

        // the book must NOT have been saved again - nothing should change
        verify(bookRepository, never()).save(any());
    }

    @Test
    void returnBook_whenBorrowed_marksAvailable() {
        book.setAvailable(false);
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));
        when(bookRepository.save(any(Book.class))).thenAnswer(invocation -> invocation.getArgument(0));

        BookResponse result = bookService.returnBook(10L);

        assertThat(result.isAvailable()).isTrue();
    }

    @Test
    void returnBook_whenAlreadyAvailable_throwsException() {
        // book.available is already true from setUp()
        when(bookRepository.findById(10L)).thenReturn(Optional.of(book));

        assertThatThrownBy(() -> bookService.returnBook(10L))
                .isInstanceOf(BookAlreadyAvailableException.class);
    }

    @Test
    void deleteBook_whenExists_deletesIt() {
        when(bookRepository.existsById(10L)).thenReturn(true);

        bookService.deleteBook(10L);

        verify(bookRepository).deleteById(10L);
    }

    @Test
    void deleteBook_whenNotFound_throwsException() {
        when(bookRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> bookService.deleteBook(999L))
                .isInstanceOf(BookNotFoundException.class);

        // deleteById should never be called if the book doesn't exist
        verify(bookRepository, never()).deleteById(any());
    }
}
