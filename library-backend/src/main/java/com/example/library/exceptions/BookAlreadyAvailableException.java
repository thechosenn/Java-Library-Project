package com.example.library.exceptions;

public class BookAlreadyAvailableException extends RuntimeException {
    public BookAlreadyAvailableException(Long id) {
        super("Book with id " + id + " is already available - it wasn't borrowed");
    }
}
