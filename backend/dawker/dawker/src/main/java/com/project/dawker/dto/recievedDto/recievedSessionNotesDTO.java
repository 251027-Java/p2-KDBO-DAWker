
package com.project.dawker.dto.recievedDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class recievedSessionNotesDTO {

    private Long id;
    private Long userId;
    private String title;
    private String content;

}
