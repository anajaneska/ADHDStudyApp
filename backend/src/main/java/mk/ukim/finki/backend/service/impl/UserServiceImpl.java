package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.UsernameAlreadyExistsException;
import mk.ukim.finki.backend.repository.UserRepository;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {
    @Autowired
    private UserRepository repo;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    private JWTService jwtService;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    public User register(User user) throws UsernameAlreadyExistsException {
        if(repo.findByUsername(user.getUsername()).isPresent()){
            throw new UsernameAlreadyExistsException(user.getUsername());
        }
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public String verify(User user) {
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(),user.getPassword()));

        if(authentication.isAuthenticated()){
            return jwtService.generateToken(user.getUsername());
        }
        return "fail";
    }

    public Optional<User> getUserById(Long id) {
        return repo.findById(id);
    }

    @Override
    public Optional<User> findByUsername(String username) {
        return repo.findByUsername(username);
    }
}
