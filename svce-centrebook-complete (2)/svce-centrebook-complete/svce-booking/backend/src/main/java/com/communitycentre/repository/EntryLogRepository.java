package com.communitycentre.repository;

import com.communitycentre.model.EntryLog;
import com.communitycentre.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntryLogRepository extends JpaRepository<EntryLog, Long> {

    // All active entries
    List<EntryLog> findByActiveTrue();

    // Active entries for a specific room
    List<EntryLog> findByRoomAndActiveTrue(Room room);

    // Count active people in a room
    @Query("SELECT COALESCE(SUM(e.peopleCount), 0) FROM EntryLog e WHERE e.room = :room AND e.active = true")
    int sumActivePeopleCountByRoom(Room room);

    // Full history for a room
    List<EntryLog> findByRoomOrderByEntryTimeDesc(Room room);
    
    @Query("SELECT e FROM EntryLog e WHERE e.usnOrDept = :usn AND e.room.name = :cabin AND e.active = true")
    EntryLog findActiveEntry(@Param("usn") String usn, @Param("cabin") String cabin);
    
    @Query("SELECT e FROM EntryLog e WHERE e.userName = :name AND e.room.name = :cabin AND e.active = true")
    EntryLog findActiveEntryByName(@Param("name") String name, @Param("cabin") String cabin);
}
