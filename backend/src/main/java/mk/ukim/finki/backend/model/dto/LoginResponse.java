package mk.ukim.finki.backend.model.dto;

public class LoginResponse {
    private String token;
    private Long userId;
    private String username;

    public LoginResponse(String token, Long userId, String username) {
        this.token = token;
        this.userId = userId;
        this.username = username;
    }
    public Long getUserId() { return userId; }
    public String getToken() {return token;}
    public String getUsername() {return username;}


}
