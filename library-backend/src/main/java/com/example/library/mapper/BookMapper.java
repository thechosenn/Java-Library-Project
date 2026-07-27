package com.example.library.mapper;

import com.example.library.dto.BookResponse;
import com.example.library.model.Book;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookResponse from(Book book) {
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
