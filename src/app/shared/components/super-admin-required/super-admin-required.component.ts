import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-super-admin-required',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './super-admin-required.component.html',
  styleUrls: ['./super-admin-required.component.css']
})
export class SuperAdminRequiredComponent implements OnInit {
  currentUser$: Observable<AuthResponse | null>;
  currentUser: AuthResponse | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  irAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }
}
