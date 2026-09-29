package com.communitycentre.admin.service;

import com.communitycentre.admin.model.AdminHistoryDTO;
import com.communitycentre.model.EntryLog;
import com.communitycentre.repository.EntryLogRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminHistoryService {

    @Autowired
    private EntryLogRepository entryLogRepository;

    public List<AdminHistoryDTO> getAllHistory() {

        List<EntryLog> entries =
                entryLogRepository.findAll();

        return entries.stream()
                .sorted((a, b) ->
                        b.getEntryTime()
                                .compareTo(a.getEntryTime()))
                .map(entry -> new AdminHistoryDTO(
                        entry.getUserName(),
                        entry.getRole(),
                        entry.getUsnOrDept(),
                        entry.getPeopleCount(),
                        entry.getRoomName(),
                        entry.getEntryTime(),
                        entry.getExitTime()
                ))
                .collect(Collectors.toList());
    }
}