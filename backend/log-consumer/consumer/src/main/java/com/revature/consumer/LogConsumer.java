// thanks to P2-feedback.fm-deployed for helping

package com.revature.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
public class LogConsumer {
    private static final Path LOG_DIR = Paths.get("logs");
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private static final List<String> logLevels = new ArrayList<>(List.of("TRACE", "DEBUG", "INFO", "WARN", "ERROR"));

    public LogConsumer() {
        try {
            if (Files.exists(LOG_DIR)) {
                clearDirectory(LOG_DIR);
            } else {
                Files.createDirectories(LOG_DIR);
            }
        } catch (IOException e) {
            System.err.println("WARNING: Could not initialize logs folder: " + e.getMessage());
        }
    }

    @KafkaListener(topics = "errors")
    public void consumeError(Map<String, String> logMap) {
        consume(logMap);
    }

    @KafkaListener(topics = "api-calls")
    public void consumeAPICall(Map<String, String> logMap) {
        consume(logMap);
    }

    @KafkaListener(topics = "service-calls")
    public void consumeServiceCall(Map<String, String> logMap) {
        consume(logMap);
    }

    private void consume(Map<String, String> logMap) {
        String service = logMap.getOrDefault("service", "unknown-service");
        String level = logMap.getOrDefault("level", "INFO");
        String message = logMap.getOrDefault("message", "");
        String method = logMap.getOrDefault("method", "unknown-method");
        String exception = logMap.get("exception"); // optional

        String timestamp = LocalDateTime.now().format(formatter);
        String formattedLevel = String.format("%-5s", level);
        StringBuilder logBuilder = new StringBuilder();
        logBuilder.append("[").append(service).append(".").append(method).append("] ");
        logBuilder.append(message);
        if (exception != null) logBuilder.append(" (").append(exception).append(")");

        String logLine = String.format("{%s} %s - %s%n", timestamp, formattedLevel, logBuilder);

        System.out.printf("kafka consume %s%n", logLine);
        write(level, logLine);
    }

    private synchronized void write(String logLevel, String message) {
        int logIndex = logLevels.indexOf(logLevel);
        if (logIndex == -1) logIndex = logLevels.indexOf("INFO");
        int i = 0;

        try {
            for (i = 0; i <= logIndex; i++) {
                Path logFile = LOG_DIR.resolve(logLevels.get(i) + ".log");
                Files.writeString(
                    logFile,
                    message,
                    StandardOpenOption.CREATE,
                    StandardOpenOption.APPEND
                );
            }
        } catch (IOException e) {
            System.out.printf("Error while trying to write %s to %s.log.%n", message, logLevels.get(i));
            e.printStackTrace();
        }
    }

    private void clearDirectory(Path dir) throws IOException {
        if (!Files.isDirectory(dir)) return;

        try (var entries = Files.list(dir)) {
            for (Path entry : entries.toList()) {
                try {
                    if (Files.isDirectory(entry)) {
                        clearDirectory(entry);
                        Files.delete(entry);
                    } else {
                        Files.delete(entry);
                    }
                } catch (IOException ex) {
                    System.err.println("WARNING: Could not delete " + entry + ": " + ex.getMessage());
                }
            }
        }
    }
}
