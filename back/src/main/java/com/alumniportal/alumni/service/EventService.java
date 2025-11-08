package com.alumniportal.alumni.service;

import com.alumniportal.alumni.entity.Event;
import java.util.List;
import java.util.Optional;

public interface EventService {
    Event saveEvent(Event event);
    List<Event> getAllEvents();
    Optional<Event> getEventById(Long id);
    void deleteEvent(Long id);
}
