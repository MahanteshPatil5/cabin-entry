package com.communitycentre.service;

import com.communitycentre.model.Room;
import com.communitycentre.repository.EntryLogRepository;
import com.communitycentre.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private EntryLogRepository entryLogRepository;

    public List<Room> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        // Sync occupied count from live entry logs
        for (Room room : rooms) {
            int activeCount = entryLogRepository.sumActivePeopleCountByRoom(room);
            room.setOccupied(activeCount);
        }
        return rooms;
    }

    public Optional<Room> getRoomById(Long id) {
        Optional<Room> opt = roomRepository.findById(id);
        opt.ifPresent(room -> {
            int activeCount = entryLogRepository.sumActivePeopleCountByRoom(room);
            room.setOccupied(activeCount);
        });
        return opt;
    }

    public Room save(Room room) {
        return roomRepository.save(room);
    }
}
