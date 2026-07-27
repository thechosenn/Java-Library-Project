package com.example.library.service;

public class BookAlreadyBorrowedException extends RuntimeException {
    public BookAlreadyBorrowedException(Long id) {
        super("Book with id " + id + " is already borrowed");
    }
}
