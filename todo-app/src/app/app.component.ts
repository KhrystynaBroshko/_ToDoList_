import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface Task {
  id?: number;
  title: string;
  completed: boolean;
  priority: string;
  userId?: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  template: `
    <div class="container">
      <h1>Task List</h1>
      
      <div class="input-group mb-3">
        <input
           type="text"
           class="form-control"
           placeholder="Add a new task"
           [(ngModel)]="newTask"
          (keyup.enter)="addTask()"
        >
        <select [(ngModel)]="newPriority" class="form-select" [disabled]="!newTask.trim()">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button
           class="btn btn-primary"
           (click)="addTask()"
          [disabled]="!newTask.trim()"
        >
          Add
        </button>
      </div>

      <div class="mb-3">
        <label>Filter by status:</label>
        <select [(ngModel)]="filterStatus" class="form-select">
          <option value="all">All</option>
          <option value="completed">Completed</option>
          <option value="incomplete">Incomplete</option>
        </select>
      </div>

      <div *ngIf="loading" class="alert alert-info">Loading tasks...</div>

      <ul class="list-group">
        <li *ngFor="let task of filteredTasks()" class="list-group-item d-flex justify-content-between align-items-center">
          <div>
            <input
               type="checkbox"
               class="form-check-input me-2"
               [checked]="task.completed"
              (change)="toggleTask(task)"
            >
            <span [class.text-decoration-line-through]="task.completed">
              {{ task.title }} - {{ task.priority | uppercase }}
            </span>
          </div>
          <div>
            <button class="btn btn-warning btn-sm me-2" (click)="editTask(task)">Edit</button>
            <button class="btn btn-danger btn-sm" (click)="deleteTask(task)">Delete</button>
          </div>
        </li>
      </ul>
    </div>
  `,
  styleUrls: ['./app.component.css']  
})
export class AppComponent implements OnInit {
  tasks: Task[] = [];
  newTask = '';
  newPriority = 'low';
  filterStatus: string = 'all';
  loading = false;
  
  apiUrl = 'http://localhost:3000/api/todos';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading = true;
    this.http.get<Task[]>(this.apiUrl)
      .subscribe({
        next: (data) => {
          this.tasks = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading tasks:', err);
          this.loading = false;
          this.loadDemoTasks();
        }
      });
  }

  loadDemoTasks() {
    this.tasks = [
      { id: 1, title: 'Buy groceries', completed: false, priority: 'medium' },
      { id: 2, title: 'Clean the house', completed: true, priority: 'high' },
      { id: 3, title: 'Pay bills', completed: false, priority: 'low' },
    ];
  }

  addTask() {
    if (!this.newTask.trim()) return;

    const newTask: Task = {
      title: this.newTask,
      completed: false,
      priority: this.newPriority,
      userId: 1
    };

    this.loading = true;
    this.http.post<Task>(this.apiUrl, newTask)
      .subscribe({
        next: (response) => {
          console.log('Task added:', response);
          this.tasks.unshift(response);
          this.newTask = '';
          this.newPriority = 'low';
          this.loading = false;
        },
        error: (err) => {
          console.error('Error adding task:', err);
          this.loading = false;
        }
      });
  }

  toggleTask(task: Task) {
    const updatedTask = { ...task, completed: !task.completed };
    
    this.http.put<Task>(`${this.apiUrl}/${task.id}`, updatedTask)
      .subscribe({
        next: (response) => {
          console.log('Task updated:', response);
          task.completed = !task.completed;
        },
        error: (err) => {
          console.error('Error updating task:', err);
        }
      });
  }

  deleteTask(task: Task) {
    if (!task.id) return;

    this.http.delete(`${this.apiUrl}/${task.id}`)
      .subscribe({
        next: () => {
          console.log('Task deleted');
          this.tasks = this.tasks.filter(t => t.id !== task.id);
        },
        error: (err) => {
          console.error('Error deleting task:', err);
        }
      });
  }

  editTask(task: Task) {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle === null || newTitle === task.title) return;

    const updatedTask = { ...task, title: newTitle };

    this.http.put<Task>(`${this.apiUrl}/${task.id}`, updatedTask)
      .subscribe({
        next: (response) => {
          console.log('Task updated:', response);
          task.title = newTitle;
        },
        error: (err) => {
          console.error('Error updating task:', err);
        }
      });
  }

  filteredTasks() {
    if (this.filterStatus === 'all') {
      return this.tasks;
    }
    if (this.filterStatus === 'completed') {
      return this.tasks.filter(task => task.completed);
    }
    if (this.filterStatus === 'incomplete') {
      return this.tasks.filter(task => !task.completed);
    }
    return this.tasks;
  }
}