package com.project.dawker.kafka;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class KafkaLogProducer {

    private final KafkaTemplate<String, Map<String, String>> kafkaTemplate;

    public KafkaLogProducer(KafkaTemplate<String, Map<String, String>> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void trace(String topic, String message, String service, String method) {
        send(topic, "TRACE", message, service, method, null);
    }

    public void debug(String topic, String message, String service, String method) {
        send(topic, "DEBUG", message, service, method, null);
    }

    public void info(String topic, String message, String service, String method) {
        send(topic, "INFO", message, service, method, null);
    }

    public void warn(String topic, String message, String service, String method) {
        send(topic, "WARN", message, service, method, null);
    }

    public void error(String topic, String message, String service, String method, Throwable ex) {
        send(topic, "ERROR", message, service, method, ex);
    }

    private void send(String topic, String level, String message, String service, String method, Throwable ex) {
        try {
            Map<String, String> logMap = new HashMap<>();

            logMap.put("service", service);
            logMap.put("method", method);
            logMap.put("level", level);
            logMap.put("message", message);

            // exception info if error
            if (ex != null) {
                logMap.put("exception", ExceptionUtils.getStackTrace(ex));
            }

            kafkaTemplate.send(topic, logMap);

        } catch (Exception e) {
            System.err.println("Failed to send log to Kafka: " + e.getMessage());
        }
    }
}
