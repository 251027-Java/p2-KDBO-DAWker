package com.project.dawker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// For now, the spring application is not using Eureka, so we don't have to think on it.
@SpringBootApplication()
public class DawkerApplication {

    public static void main(String[] args) {
        SpringApplication.run(DawkerApplication.class, args);
    }

}
