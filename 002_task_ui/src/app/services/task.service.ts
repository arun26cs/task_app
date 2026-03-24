import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskRequest } from '../models/task.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  private readonly apiUrl = `${environment.apiUrl}/api/v1/tasks`;

  constructor(private http: HttpClient) {}

  addTask(request: TaskRequest): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, request);
  }

  getTasks(userId: string): Observable<Task[]> {
    return this.http.get<Task[]>(this.apiUrl, {
      params: { userId }
    });
  }

  completeTask(taskId: number, userId: string): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${taskId}/complete`, { userId });
  }
}
