package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.UsernameAlreadyExistsException;

import java.util.Optional;

public interface UserService {
    User register(User user) throws UsernameAlreadyExistsException;
    String verify(User user);
    Optional<User> getUserById(Long id);
    Optional<User> findByUsername(String username);
}
