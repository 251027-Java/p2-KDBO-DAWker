package com.example.log_consumer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@SpringBootApplication
@RestController
public class LogConsumerApplication {

    public static void main(String[] args) {
        System.out.println("before spring runs");
        SpringApplication.run(LogConsumerApplication.class, args);
        System.out.println("after spring runs");
    }

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of("status", "UP", "service", "log-consumer");
    }
}