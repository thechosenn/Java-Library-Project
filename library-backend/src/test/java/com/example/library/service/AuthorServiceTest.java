package com.example.library.service;

import com.example.library.model.Author;
import com.example.library.repository.AuthorRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;

    @InjectMocks
    private AuthorService authorService;

    @Test
    void getAuthorById_whenFound_returnsAuthor() {
        Author author = Author.builder().id(1L).name("Robert Martin").build();
        when(authorRepository.findById(1L)).thenReturn(Optional.of(author));

        Author result = authorService.getAuthorById(1L);

        assertThat(result.getName()).isEqualTo("Robert Martin");
    }

    @Test
    void getAuthorById_whenNotFound_throwsException() {
        when(authorRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authorService.getAuthorById(99L))
                .isInstanceOf(AuthorNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    void createAuthor_savesAndReturnsIt() {
        Author toSave = Author.builder().name("Martin Fowler").build();
        Author saved = Author.builder().id(2L).name("Martin Fowler").build();
        when(authorRepository.save(toSave)).thenReturn(saved);

        Author result = authorService.createAuthor(toSave);

        assertThat(result.getId()).isEqualTo(2L);
        verify(authorRepository).save(toSave);
    }

    @Test
    void deleteAuthor_whenNotFound_throwsException() {
        when(authorRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> authorService.deleteAuthor(99L))
                .isInstanceOf(AuthorNotFoundException.class);
    }
}
