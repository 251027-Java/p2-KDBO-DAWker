package com.project.dawker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// For now, the spring application is not using Eureka, so we don't have to think on it.
@SpringBootApplication(exclude = {
        org.springframework.cloud.netflix.eureka.EurekaClientAutoConfiguration.class,
        org.springframework.cloud.netflix.eureka.EurekaDiscoveryClientConfiguration.class
})
public class DawkerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DawkerApplication.class, args);
	}

}
