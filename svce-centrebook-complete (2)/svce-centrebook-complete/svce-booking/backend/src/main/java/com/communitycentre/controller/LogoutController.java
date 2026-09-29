package com.communitycentre.controller;

import com.communitycentre.model.EntryLog;
import com.communitycentre.service.EntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/logout")
@CrossOrigin(origins = "*")
public class LogoutController {

    @Autowired
    private EntryService entryService;

    // STUDENT LOGOUT
    @PostMapping("/student")
    public ResponseEntity<?> logoutStudent(@RequestParam String usn,
                                           @RequestParam String cabin) {

        EntryLog entry = entryService.findActiveByUsnAndRoom(usn, cabin);

        if (entry == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Student not found ❌"));
        }

        entryService.recordExit(entry.getId());

        return ResponseEntity.ok(Map.of("message", "Student logged out ✅"));
    }

    // PROFESSOR LOGOUT
    @PostMapping("/professor")
    public ResponseEntity<?> logoutProfessor(@RequestParam String name,
                                             @RequestParam String cabin) {

        EntryLog entry = entryService.findActiveByNameAndRoom(name, cabin);

        if (entry == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Professor not found ❌"));
        }

        entryService.recordExit(entry.getId());

        return ResponseEntity.ok(Map.of("message", "Professor logged out ✅"));
    }
}