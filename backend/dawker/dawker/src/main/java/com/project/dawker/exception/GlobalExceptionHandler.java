package com.project.dawker.exception;

import com.project.dawker.exceptions.dawNotFoundException;
import com.project.dawker.kafka.KafkaLogProducer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    private final KafkaLogProducer logger;

    public GlobalExceptionHandler(KafkaLogProducer logProducer){
        logger = logProducer;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentTypeMismatchException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(CategoryNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCategoryNotFound(CategoryNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(CategoryTypeNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleCategoryTypeNotFound(CategoryTypeNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GearTypeNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleGearTypeNotFound(GearTypeNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(GearItemNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleGearItemModelNameNotFound(GearItemNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PresetNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePresetNotFound(PresetNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PresetCategoryNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePresetCategoryNotFound(PresetCategoryNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(PresetGearNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handlePresetGearNotFound(PresetGearNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NonPositiveNumberException.class)
    public ResponseEntity<Map<String, Object>> handleNonPositiveNumber(NonPositiveNumberException ex) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(dawNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleDawNotFound(dawNotFoundException ex) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND);
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(Exception ex, HttpStatus status) {
        logger.error("errors", ex.getMessage(), ex.getStackTrace()[0].getClassName(), ex.getStackTrace()[0].getMethodName(), ex);

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, status);
    }
}
