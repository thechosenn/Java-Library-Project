package com.example.library.controller;

import com.example.library.dto.BookRequest;
import com.example.library.dto.BookResponse;
import com.example.library.service.BookAlreadyBorrowedException;
import com.example.library.service.BookNotFoundException;
import com.example.library.service.BookService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

// @WebMvcTest loads ONLY the web layer (this controller + Spring MVC +
// Jackson + our GlobalExceptionHandler) - no real database, no full Spring
// context. Much faster than @SpringBootTest, and it isolates exactly what
// we want to test: does the HTTP contract behave correctly?
// @WithMockUser simulates an already-authenticated request in every test in
// this class. Without it, every request here would now get a 401, since
// SecurityConfig requires authentication on all /api/** endpoints except
// /api/auth/**. This deliberately keeps the controller test focused on
// controller behavior, not re-testing the login flow itself.
@WebMvcTest(BookController.class)
@WithMockUser
class BookControllerTest {

    @Autowired
    private MockMvc mockMvc; // simulates HTTP requests without a real server/port

    // @MockBean replaces the real BookService bean in the Spring context with
    // a Mockito mock - the controller doesn't know the difference.
    @MockBean
    private BookService bookService;

    @Autowired
    private ObjectMapper objectMapper; // converts Java objects <-> JSON, same as Spring uses internally

    @Test
    void getAllBooks_returns200AndJsonList() throws Exception {
        BookResponse book = BookResponse.builder()
                .id(1L).title("Clean Code").isbn("123").available(true)
                .authorId(1L).authorName("Robert Martin")
                .build();
        when(bookService.getAllBooks()).thenReturn(List.of(book));

        mockMvc.perform(get("/api/books"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Clean Code"))
                .andExpect(jsonPath("$[0].authorName").value("Robert Martin"));
    }

    @Test
    void getBookById_whenNotFound_returns404() throws Exception {
        when(bookService.getBookById(999L)).thenThrow(new BookNotFoundException(999L));

        mockMvc.perform(get("/api/books/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Book not found with id 999"));
    }

    @Test
    void createBook_withValidRequest_returns201() throws Exception {
        BookResponse created = BookResponse.builder()
                .id(1L).title("Clean Code").isbn("123").available(true)
                .authorId(1L).authorName("Robert Martin")
                .build();
        when(bookService.createBook(any())).thenReturn(created);

        BookRequest request = BookRequest.builder()
                .title("Clean Code").isbn("123").authorId(1L)
                .build();

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Clean Code"));
    }

    @Test
    void createBook_withBlankTitle_returns400WithFieldError() throws Exception {
        // authorId missing AND title blank - @Valid should catch both
        BookRequest invalidRequest = BookRequest.builder()
                .title("")
                .isbn("")
                .authorId(null)
                .build();

        mockMvc.perform(post("/api/books")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").value("Title is required"))
                .andExpect(jsonPath("$.errors.authorId").value("authorId is required"));
    }

    @Test
    void borrowBook_whenAlreadyBorrowed_returns409() throws Exception {
        when(bookService.borrowBook(1L)).thenThrow(new BookAlreadyBorrowedException(1L));

        mockMvc.perform(post("/api/books/1/borrow"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Book with id 1 is already borrowed"));
    }

    @Test
    void deleteBook_returns204() throws Exception {
        mockMvc.perform(delete("/api/books/1"))
                .andExpect(status().isNoContent());
    }
}
