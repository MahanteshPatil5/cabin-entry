package com.communitycentre.config;

import com.communitycentre.model.Room;
import com.communitycentre.repository.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class AppConfig implements WebMvcConfigurer, CommandLineRunner {

    @Autowired
    private RoomRepository roomRepository;

    // -------------------------------------------------------
    // CORS – allow frontend (any origin during development)
    // -------------------------------------------------------
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }

    // -------------------------------------------------------
    // Seed rooms on first run (only if table is empty)
    // -------------------------------------------------------
    @Override
    public void run(String... args) {
        if (roomRepository.count() == 0) {
            roomRepository.save(new Room("Cabin 1",              "Small Cabin",          6));
            roomRepository.save(new Room("Cabin 2",              "Small Cabin",          6));
            roomRepository.save(new Room("Cabin 3",              "Small Cabin",          6));
            roomRepository.save(new Room("Cabin 4",              "Small Cabin",          6));
            roomRepository.save(new Room("Project Room A",       "Project Room",        12));
            roomRepository.save(new Room("Project Room B",       "Project Room",        12));
            roomRepository.save(new Room("Top Floor Open Space", "Open Space",          40));
            roomRepository.save(new Room("Main Hall",            "Ground Floor Hall",   80));
            roomRepository.save(new Room("Seminar Room",         "Seminar",             30));
            roomRepository.save(new Room("Discussion Room",      "Meeting",             10));
            System.out.println("✅ 10 rooms seeded into database.");
        }
    }
}
