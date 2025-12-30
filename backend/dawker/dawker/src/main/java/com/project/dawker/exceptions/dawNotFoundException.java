package com.project.dawker.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;


@ResponseStatus(HttpStatus.NOT_FOUND)
public class dawNotFoundException extends RuntimeException {
    public dawNotFoundException(String message) {
        super(message);
    }
}
