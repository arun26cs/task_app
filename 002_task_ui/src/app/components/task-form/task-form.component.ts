import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent {
  @Input() userId = '';
  @Output() taskAdded = new EventEmitter<void>();

  taskForm: FormGroup;
  submitting = false;

  constructor(private fb: FormBuilder, private taskService: TaskService) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: ['']
    });
  }

  onSubmit(): void {
    if (this.taskForm.invalid || !this.userId.trim()) return;

    this.submitting = true;

    this.taskService.addTask({
      title: this.taskForm.value.title,
      description: this.taskForm.value.description || '',
      userId: this.userId
    }).subscribe({
      next: () => {
        this.taskForm.reset();
        this.submitting = false;
        this.taskAdded.emit();
      },
      error: () => {
        this.submitting = false;
      }
    });
  }
}
