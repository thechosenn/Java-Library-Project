package com.example.library.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookResponse {
    private Long id;
    private String title;
    private String isbn;
    private boolean available;
    private Long authorId;
    private String authorName;
}
