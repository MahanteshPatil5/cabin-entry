package com.communitycentre.admin.controller;

import com.communitycentre.admin.model.AdminHistoryDTO;
import com.communitycentre.admin.service.AdminHistoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/history")
@CrossOrigin(origins = "*")
public class AdminHistoryController {

    @Autowired
    private AdminHistoryService adminHistoryService;

    @GetMapping
    public ResponseEntity<List<AdminHistoryDTO>> getHistory() {

        return ResponseEntity.ok(
                adminHistoryService.getAllHistory()
        );
    }
}