package com.communitycentre.controller;

import com.communitycentre.model.EntryLog;
import com.communitycentre.service.EntryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/entries")
@CrossOrigin(origins = "*")
public class EntryController {

    @Autowired
    private EntryService entryService;

    // -------------------------------------------------------
    // Request DTO
    // -------------------------------------------------------
    public static class EntryRequest {
        @NotNull(message = "Room ID is required")
        public Long roomId;

        @NotBlank(message = "Name is required")
        public String userName;

        @NotBlank(message = "Role is required")
        @Pattern(regexp = "Student|Professor", message = "Role must be Student or Professor")
        public String role;

        @NotBlank(message = "USN or Department is required")
        public String usnOrDept;

        public String teamMembers;

        @NotBlank(message = "Purpose is required")
        public String purpose;

        @Min(value = 1, message = "At least 1 person required")
        @Max(value = 50, message = "Maximum 50 people per entry")
        public int peopleCount = 1;
    }

    // -------------------------------------------------------
    // Response DTO (avoids lazy-load issues)
    // -------------------------------------------------------
    private Map<String, Object> toDto(EntryLog e) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", e.getId());
        m.put("roomId", e.getRoom().getId());
        m.put("roomName", e.getRoom().getName());
        m.put("userName", e.getUserName());
        m.put("role", e.getRole());
        m.put("usnOrDept", e.getUsnOrDept());
        m.put("teamMembers", e.getTeamMembers());
        m.put("purpose", e.getPurpose());
        m.put("peopleCount", e.getPeopleCount());
        m.put("entryTime", e.getEntryTime());
        m.put("exitTime", e.getExitTime());
        m.put("active", e.isActive());
        return m;
    }

    // POST /api/entries  - new booking
    @PostMapping
    public ResponseEntity<?> createEntry(@Valid @RequestBody EntryRequest req) {
        try {
            EntryLog entry = entryService.createEntry(
                    req.roomId, req.userName, req.role,
                    req.usnOrDept, req.teamMembers, req.purpose, req.peopleCount
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(toDto(entry));
        } catch (IllegalStateException e) {
            // Room is full
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage(), "error", "ROOM_FULL"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // PUT /api/entries/{id}/exit  - checkout
    @PutMapping("/{id}/exit")
    public ResponseEntity<?> exitEntry(@PathVariable Long id) {
        try {
            EntryLog entry = entryService.recordExit(id);
            return ResponseEntity.ok(toDto(entry));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // GET /api/entries/active  - all active bookings (admin)
    @GetMapping("/active")
    public ResponseEntity<?> getActiveEntries() {
        List<Map<String, Object>> dtos = entryService.getAllActiveEntries()
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET /api/entries/room/{roomId}  - history for a room
    @GetMapping("/room/{roomId}")
    public ResponseEntity<?> getEntriesByRoom(@PathVariable Long roomId) {
        List<Map<String, Object>> dtos = entryService.getEntriesByRoom(roomId)
                .stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // GET /api/entries/{id}
    @GetMapping("/{id}")
    public ResponseEntity<?> getEntry(@PathVariable Long id) {
        return entryService.getEntryById(id)
                .map(e -> ResponseEntity.ok(toDto(e)))
                .orElse(ResponseEntity.notFound().build());
    }
    @PutMapping("/exit")
    public ResponseEntity<?> logoutByUsn(@RequestBody Map<String, String> body) {

    String usn = body.get("usn");
    String cabin = body.get("cabin");

    EntryLog entry = entryService.findActiveByUsnAndRoom(usn, cabin);

    if (entry == null) {
        return ResponseEntity.badRequest()
                .body(Map.of("message", "User not found or already logged out ❌"));
    }

    EntryLog updated = entryService.recordExit(entry.getId());

    return ResponseEntity.ok(Map.of("message", "Logged out successfully ✅"));
}
}
