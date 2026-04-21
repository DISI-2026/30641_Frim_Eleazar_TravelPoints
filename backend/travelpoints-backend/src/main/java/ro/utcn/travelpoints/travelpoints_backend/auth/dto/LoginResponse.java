package ro.utcn.travelpoints.travelpoints_backend.auth.dto;

public record LoginResponse(
        boolean success,
        String error
) {
    public static LoginResponse ok() {
        return new LoginResponse(true, null);
    }

    public static LoginResponse fail(String errorMessage) {
        return new LoginResponse(false, errorMessage);
    }
}