package com.pla.task.service;

import com.pla.task.dto.TaskRequestDTO;
import com.pla.task.dto.TaskResponseDTO;
import com.pla.task.enums.TaskStatus;
import com.pla.task.exception.TaskNotFoundException;
import com.pla.task.model.Task;
import com.pla.task.repository.TaskRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;

    public TaskServiceImpl(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    @Transactional
    public TaskResponseDTO createTask(TaskRequestDTO request) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(TaskStatus.PENDING);
        task.setUserId(request.getUserId());
        task.setCreatedBy(request.getUserId());
        task.setUpdatedBy(request.getUserId());

        Task saved = taskRepository.save(task);
        return mapToResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TaskResponseDTO> getTasksByUserId(String userId) {
        return taskRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponseDTO markTaskComplete(Long taskId, String userId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new TaskNotFoundException("Task not found with id: " + taskId));

        if (!task.getUserId().equals(userId)) {
            throw new TaskNotFoundException("Task not found with id: " + taskId + " for user: " + userId);
        }

        task.setStatus(TaskStatus.COMPLETED);
        task.setUpdatedBy(userId);

        Task updated = taskRepository.save(task);
        return mapToResponseDTO(updated);
    }

    private TaskResponseDTO mapToResponseDTO(Task task) {
        TaskResponseDTO dto = new TaskResponseDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setUserId(task.getUserId());
        dto.setCreatedBy(task.getCreatedBy());
        dto.setUpdatedBy(task.getUpdatedBy());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        return dto;
    }
}
