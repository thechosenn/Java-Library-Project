package com.example.library.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "app_user") // "user" is a reserved word in some SQL dialects - avoid it as a table name
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    // This stores a BCrypt HASH, never the plain-text password. See
    // SecurityConfig's PasswordEncoder bean for where the hashing happens.
    @NotBlank
    private String password;
}
