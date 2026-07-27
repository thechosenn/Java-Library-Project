package com.example.library.security;

import com.example.library.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

// Spring Security doesn't know about our own `User` entity - it only knows
// about its own `UserDetails` interface. This class is the adapter between
// the two: "given a username, find our User row and describe it the way
// Spring Security expects."
@Service
@RequiredArgsConstructor
public class AppUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.example.library.model.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        // Spring Security's own User.builder() - unrelated to our JPA entity
        // of the same name, hence the fully-qualified reference above.
        return new User(user.getUsername(), user.getPassword(), Collections.emptyList());
    }
}
