package com.example.library.service;

import com.example.library.dto.BookRequest;
import com.example.library.dto.BookResponse;
import com.example.library.model.Author;
import com.example.library.model.Book;
import com.example.library.repository.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final AuthorService authorService;

    public List<BookResponse> getAllBooks() {
        return bookRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public BookResponse getBookById(Long id) {
        return toResponse(findBookEntity(id));
    }

    public BookResponse createBook(BookRequest request) {
        Author author = authorService.getAuthorById(request.getAuthorId());
        Book book = Book.builder()
                .title(request.getTitle())
                .isbn(request.getIsbn())
                .author(author)
                .available(true)
                .build();
        log.info("Creating book '{}' for author id {}", book.getTitle(), author.getId());
        return toResponse(bookRepository.save(book));
    }

    public BookResponse updateBook(Long id, BookRequest request) {
        Book existing = findBookEntity(id);
        Author author = authorService.getAuthorById(request.getAuthorId());
        existing.setTitle(request.getTitle());
        existing.setIsbn(request.getIsbn());
        existing.setAuthor(author);
        return toResponse(bookRepository.save(existing));
    }

    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new BookNotFoundException(id);
        }
        bookRepository.deleteById(id);
    }

    public BookResponse borrowBook(Long id) {
        Book book = findBookEntity(id);
        if (!book.isAvailable()) {
            throw new BookAlreadyBorrowedException(id);
        }
        book.setAvailable(false);
        log.info("Book {} borrowed", id);
        return toResponse(bookRepository.save(book));
    }

    public BookResponse returnBook(Long id) {
        Book book = findBookEntity(id);
        if (book.isAvailable()) {
            throw new BookAlreadyAvailableException(id);
        }
        book.setAvailable(true);
        log.info("Book {} returned", id);
        return toResponse(bookRepository.save(book));
    }

    private Book findBookEntity(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException(id));
    }

    private BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .isbn(book.getIsbn())
                .available(book.isAvailable())
                .authorId(book.getAuthor().getId())
                .authorName(book.getAuthor().getName())
                .build();
    }
}
