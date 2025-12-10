package mk.ukim.finki.backend.web;

import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.dto.LoginResponse;
import mk.ukim.finki.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @Autowired
    private UserService userService;


    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user){
        try {
            User createdUser = userService.register(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        try {
            System.out.println("Login attempt: " + user.getUsername());

            String token = userService.verify(user); // returns JWT
            System.out.println("Token generated: " + token);

            User loggedInUser = userService.findByUsername(user.getUsername())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LoginResponse response = new LoginResponse(
                    token,
                    loggedInUser.getId(),
                    loggedInUser.getUsername()
            );

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

}