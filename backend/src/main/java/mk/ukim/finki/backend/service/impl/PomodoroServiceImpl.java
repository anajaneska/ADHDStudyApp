package mk.ukim.finki.backend.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.PomodoroSession;
import mk.ukim.finki.backend.model.PomodoroSettings;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.PomodoroSessionDoesNotExistException;
import mk.ukim.finki.backend.repository.PomodoroRepository;
import mk.ukim.finki.backend.repository.PomodoroSettingsRepository;
import mk.ukim.finki.backend.repository.UserRepository;
import mk.ukim.finki.backend.service.PomodoroService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PomodoroServiceImpl implements PomodoroService {
    private final PomodoroRepository pomodoroRepository;
    private final PomodoroSettingsRepository pomodoroSettingsRepository;
    private final UserRepository userRepository;


    @Override
    public List<PomodoroSession> getAllSessionsForUser(Long userId) {
        return pomodoroRepository.findByUserId(userId);
    }

    @Override
    public PomodoroSession saveSession(PomodoroSession session) {
        if (session.getStartTime() == null) {
            session.setStartTime(LocalDateTime.now());
        }
        if (session.getFocusDuration() > 0) {
            session.setEndTime(session.getStartTime()
                    .plusMinutes(session.getFocusDuration() + session.getBreakDuration()));
        }
        return pomodoroRepository.save(session);
    }

    @Override
    public PomodoroSession markAsCompleted(Long id) {
        PomodoroSession session = pomodoroRepository.findById(id)
                .orElseThrow(() -> new PomodoroSessionDoesNotExistException(id));

        session.setCompleted(true);
        session.setEndTime(LocalDateTime.now());
        return pomodoroRepository.save(session);
    }
    public PomodoroSettings getSettings(Long userId) {
        return pomodoroSettingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));
    }

    private PomodoroSettings createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        PomodoroSettings settings = new PomodoroSettings();
        settings.setUser(user);
        settings.setFocusDuration(25);
        settings.setBreakDuration(5);

        return pomodoroSettingsRepository.save(settings);
    }

    public PomodoroSettings updateSettings(Long userId, int focus, int brk) {
        PomodoroSettings settings = getSettings(userId);
        settings.setFocusDuration(focus);
        settings.setBreakDuration(brk);
        return pomodoroSettingsRepository.save(settings);
    }

}
