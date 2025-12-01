import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, AuthResponse } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-subscription-required',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './subscription-required.component.html',
  styleUrls: ['./subscription-required.component.css']
})
export class SubscriptionRequiredComponent implements OnInit {
  currentUser$: Observable<AuthResponse | null>;
  currentUser: AuthResponse | null = null;
  verificandoEstado: boolean = false;
  mensajeVerificacion: string = '';

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
    
    // Verificar automáticamente el estado al cargar el componente
    // Por si el admin ya aprobó el pago mientras el usuario esperaba
    this.verificarEstadoSuscripcion();
  }

  irACargarComprobante(): void {
    this.router.navigate(['/auth/cargar-comprobante']);
  }

  irAlDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
  }

  /**
   * Verificar si la suscripción ya fue aprobada por el admin
   */
  verificarEstadoSuscripcion(): void {
    console.log('🔍 Verificando estado de suscripción...');
    this.verificandoEstado = true;
    this.mensajeVerificacion = 'Verificando estado de suscripción...';
    
    this.authService.verificarEstadoSuscripcion().subscribe({
      next: (response) => {
        this.verificandoEstado = false;
        
        if (response.success && response.data) {
          const nuevoEstado = response.data.estadoSuscripcion;
          console.log('✅ Estado verificado:', nuevoEstado);
          
          if (nuevoEstado === 'ACTIVA') {
            this.mensajeVerificacion = '¡Tu suscripción ha sido aprobada! Redirigiendo...';
            setTimeout(() => {
              this.router.navigate(['/dashboard']);
            }, 1500);
          } else {
            this.mensajeVerificacion = `Estado actual: ${nuevoEstado}`;
          }
        }
      },
      error: (error) => {
        this.verificandoEstado = false;
        console.error('❌ Error verificando estado:', error);
        this.mensajeVerificacion = 'Error al verificar estado';
      }
    });
  }
}
