package ro.utcn.travelpoints.travelpoints_backend.auth.dto;

public record RegisterResponse(
        boolean success,
        String error
) {
    public static RegisterResponse ok() {
        return new RegisterResponse(true, null);
    }

    public static RegisterResponse fail(String errorMessage) {
        return new RegisterResponse(false, errorMessage);
    }
}