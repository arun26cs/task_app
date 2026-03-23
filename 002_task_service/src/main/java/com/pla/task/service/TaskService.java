package com.pla.task.service;

import com.pla.task.dto.TaskRequestDTO;
import com.pla.task.dto.TaskResponseDTO;
import java.util.List;

public interface TaskService {

    TaskResponseDTO createTask(TaskRequestDTO request);

    List<TaskResponseDTO> getTasksByUserId(String userId);

    TaskResponseDTO markTaskComplete(Long taskId, String userId);
}
