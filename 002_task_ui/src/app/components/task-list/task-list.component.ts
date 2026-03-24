import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent implements OnInit, OnChanges {
  @Input() userId = '';
  @Input() refreshTrigger = 0;

  tasks: Task[] = [];
  loading = false;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange) {
      this.loadTasks();
    }
    if (changes['userId'] && !changes['userId'].firstChange) {
      this.loadTasks();
    }
  }

  loadTasks(): void {
    if (!this.userId.trim()) {
      this.tasks = [];
      return;
    }

    this.loading = true;
    this.taskService.getTasks(this.userId).subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  markComplete(task: Task): void {
    this.taskService.completeTask(task.id, this.userId).subscribe({
      next: (updated) => {
        const index = this.tasks.findIndex(t => t.id === updated.id);
        if (index !== -1) {
          this.tasks[index] = updated;
        }
      }
    });
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'PENDING');
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(t => t.status === 'COMPLETED');
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
