package com.communitycentre.service;

import com.communitycentre.model.EntryLog;
import com.communitycentre.model.Room;
import com.communitycentre.repository.EntryLogRepository;
import com.communitycentre.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class EntryService {

    @Autowired
    private EntryLogRepository entryLogRepository;

    @Autowired
    private RoomRepository roomRepository;

    /**
     * Create a new entry after validating capacity.
     * Throws IllegalStateException if room is full.
     */
    @Transactional
    public EntryLog createEntry(Long roomId, String userName, String role,
                                 String usnOrDept, String teamMembers,
                                 String purpose, int peopleCount) {

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomId));

        // ---- CAPACITY CHECK ----
        int currentOccupied = entryLogRepository.sumActivePeopleCountByRoom(room);
        if (currentOccupied + peopleCount > room.getCapacity()) {
            throw new IllegalStateException("Room is full. Available seats: "
                    + (room.getCapacity() - currentOccupied));
        }

        EntryLog entry = new EntryLog(room, userName, role, usnOrDept,
                teamMembers, purpose, peopleCount);
        EntryLog saved = entryLogRepository.save(entry);

        // Update room's occupied count
        room.setOccupied(currentOccupied + peopleCount);
        roomRepository.save(room);

        return saved;
    }

    /**
     * Mark exit – records exit time, decrements room occupancy.
     */
    @Transactional
    public EntryLog recordExit(Long entryId) {
        EntryLog entry = entryLogRepository.findById(entryId)
                .orElseThrow(() -> new IllegalArgumentException("Entry not found: " + entryId));

        if (!entry.isActive()) {
            throw new IllegalStateException("Entry already checked out.");
        }

        entry.setActive(false);
        entry.setExitTime(LocalDateTime.now());
        EntryLog saved = entryLogRepository.save(entry);

        // Update room occupancy
        Room room = entry.getRoom();
        int newOccupied = Math.max(0, room.getOccupied() - entry.getPeopleCount());
        room.setOccupied(newOccupied);
        roomRepository.save(room);

        return saved;
    }

    public List<EntryLog> getAllActiveEntries() {
        return entryLogRepository.findByActiveTrue();
    }

    public List<EntryLog> getEntriesByRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("Room not found"));
        return entryLogRepository.findByRoomOrderByEntryTimeDesc(room);
    }

    public Optional<EntryLog> getEntryById(Long id) {
        return entryLogRepository.findById(id);
    }
    public EntryLog findActiveByUsnAndRoom(String usn, String cabin) {
        return entryLogRepository.findActiveEntry(usn, cabin);
    }
    public EntryLog findActiveByNameAndRoom(String name, String cabin) {
        return entryLogRepository.findActiveEntryByName(name, cabin);
    }
}
