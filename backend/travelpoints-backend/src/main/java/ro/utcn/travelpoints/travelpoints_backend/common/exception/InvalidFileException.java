package ro.utcn.travelpoints.travelpoints_backend.common.exception;

public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }
}