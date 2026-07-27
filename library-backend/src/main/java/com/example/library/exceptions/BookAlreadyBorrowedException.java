package com.example.library.exceptions;

public class BookAlreadyBorrowedException extends RuntimeException {
    public BookAlreadyBorrowedException(Long id) {
        super("Book with id " + id + " is already borrowed");
    }
}
