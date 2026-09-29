package com.communitycentre.admin.service;

import com.communitycentre.model.Room;
import com.communitycentre.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AdminCabinService {

    @Autowired
    private RoomRepository roomRepository;

    // Get all cabins
    public List<Room> getAllCabins() {
        return roomRepository.findAll();
    }

    // Get cabin by ID
    public Optional<Room> getCabinById(Long id) {
        return roomRepository.findById(id);
    }

    // Add new cabin
    public Room addCabin(Room room) {

        // New cabin should start with zero occupancy
        room.setOccupied(0);

        return roomRepository.save(room);
    }

    // Update cabin
    public Optional<Room> updateCabin(Long id, Room updatedRoom) {

        return roomRepository.findById(id).map(existingRoom -> {

            existingRoom.setName(updatedRoom.getName());
            existingRoom.setType(updatedRoom.getType());
            existingRoom.setCapacity(updatedRoom.getCapacity());

            return roomRepository.save(existingRoom);
        });
    }

    // Delete cabin
    public boolean deleteCabin(Long id) {

        Optional<Room> room = roomRepository.findById(id);

        if (room.isPresent()) {

            roomRepository.deleteById(id);

            return true;
        }

        return false;
    }
}