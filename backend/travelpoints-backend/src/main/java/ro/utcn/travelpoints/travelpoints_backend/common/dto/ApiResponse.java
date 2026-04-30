package ro.utcn.travelpoints.travelpoints_backend.common.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    @JsonProperty("success")
    private boolean success;

    @JsonProperty("data")
    private T data;
}

