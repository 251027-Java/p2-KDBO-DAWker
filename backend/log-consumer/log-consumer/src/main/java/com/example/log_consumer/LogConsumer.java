package com.example.log_consumer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class LogConsumer {
    private static final Logger logger = LoggerFactory.getLogger(LogConsumer.class);

    @KafkaListener(topics = "api-calls")
    public void consumeAPICall(Map<String, String> logMap) {
        consume(logMap);
    }

    private void consume(Map<String, String> logMap) {
        String service = logMap.getOrDefault("service", "unknown-service");
        String level = logMap.getOrDefault("level", "INFO");
        String message = logMap.getOrDefault("message", "");
        String method = logMap.getOrDefault("method", "unknown-method");
        String exception = logMap.get("exception"); // optional

        StringBuilder logBuilder = new StringBuilder();
        logBuilder.append("[").append(service).append(".").append(method).append("] ");
        logBuilder.append(message);
        if (exception != null) logBuilder.append(" (").append(exception).append(")");

        // Write to SLF4J based on level
        switch (level) {
            case "ERROR" -> logger.error(logBuilder.toString());
            case "WARN" -> logger.warn(logBuilder.toString());
            case "DEBUG" -> logger.debug(logBuilder.toString());
            case "TRACE" -> logger.trace(logBuilder.toString());
            default -> logger.info(logBuilder.toString());
        }
    }
}
