package mk.ukim.finki.backend.service;

import mk.ukim.finki.backend.model.PomodoroSettings;



public interface PomodoroService {
    PomodoroSettings updateSettings(Long userId, int focus, int brk);
    PomodoroSettings getSettings(Long userId);
}
