package mk.ukim.finki.backend.service.impl;

import mk.ukim.finki.backend.model.PomodoroSession;
import mk.ukim.finki.backend.model.exeptions.PomodoroSessionDoesNotExistException;
import mk.ukim.finki.backend.repository.PomodoroRepository;
import mk.ukim.finki.backend.service.PomodoroService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PomodoroServiceImpl implements PomodoroService {
    private final PomodoroRepository pomodoroRepository;

    public PomodoroServiceImpl(PomodoroRepository pomodoroRepository) {
        this.pomodoroRepository = pomodoroRepository;
    }

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
    public Optional<PomodoroSession> getSessionById(Long id) {
        return pomodoroRepository.findById(id);
    }

    @Override
    public void deleteSession(Long id) {
        PomodoroSession session = pomodoroRepository.findById(id)
                .orElseThrow(() -> new PomodoroSessionDoesNotExistException(id));
        pomodoroRepository.delete(session);
    }

    @Override
    public PomodoroSession markAsCompleted(Long id) {
        PomodoroSession session = pomodoroRepository.findById(id)
                .orElseThrow(() -> new PomodoroSessionDoesNotExistException(id));

        session.setCompleted(true);
        session.setEndTime(LocalDateTime.now());
        return pomodoroRepository.save(session);
    }
}
