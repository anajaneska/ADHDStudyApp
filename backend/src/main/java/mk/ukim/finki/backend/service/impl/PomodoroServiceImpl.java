package mk.ukim.finki.backend.service.impl;

import lombok.RequiredArgsConstructor;
import mk.ukim.finki.backend.model.PomodoroSettings;
import mk.ukim.finki.backend.model.User;
import mk.ukim.finki.backend.model.exeptions.UserDoesNotExistException;
import mk.ukim.finki.backend.repository.PomodoroSettingsRepository;
import mk.ukim.finki.backend.repository.UserRepository;
import mk.ukim.finki.backend.service.PomodoroService;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class PomodoroServiceImpl implements PomodoroService {
    private final PomodoroSettingsRepository pomodoroSettingsRepository;
    private final UserRepository userRepository;


    @Override
    public PomodoroSettings getSettings(Long userId) {
        return pomodoroSettingsRepository.findByUserId(userId).orElseGet(() -> createDefaultSettings(userId));
    }

    private PomodoroSettings createDefaultSettings(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserDoesNotExistException(userId));

        PomodoroSettings settings = new PomodoroSettings();
        settings.setUser(user);
        settings.setFocusDuration(25);
        settings.setBreakDuration(5);

        return pomodoroSettingsRepository.save(settings);
    }

    @Override
    public PomodoroSettings updateSettings(Long userId, int focus, int brk) {
        PomodoroSettings settings = getSettings(userId);
        settings.setFocusDuration(focus);
        settings.setBreakDuration(brk);
        return pomodoroSettingsRepository.save(settings);
    }

}
