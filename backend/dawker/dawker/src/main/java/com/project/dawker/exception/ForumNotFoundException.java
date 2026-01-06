package com.project.dawker.exception;

public class ForumNotFoundException extends RuntimeException {
    public ForumNotFoundException(String message) {
        super(message);
    }
}
