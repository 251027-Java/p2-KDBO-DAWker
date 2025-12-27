package com.project.dawker.exception;

public class NonPositiveNumberException extends RuntimeException{
    public NonPositiveNumberException(String message) {
        super(message);
    }
}