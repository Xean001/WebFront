import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { BarberiaService } from '../../../shared/services/barberias.service';
import { ServiciosService } from '../../../shared/services/servicios.service';
import { BarberoPerfilService } from '../../../shared/services/barbero-perfil.service';

@Component({
  selector: 'app-detalle-barberia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetalleBarberiasComponent implements OnInit {
  barberia: any = null;
  servicios: any[] = [];
  barberos: any[] = [];
  cargando: boolean = false;
  idBarberia: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private barberiaService: BarberiaService,
    private serviciosService: ServiciosService,
    private barberoPerfilService: BarberoPerfilService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idBarberia = params['id'];
      this.cargarDetalles();
    });
  }

  cargarDetalles(): void {
    this.cargando = true;
    this.barberiaService.obtenerBarberiaPorId(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.barberia = response.data;
          this.cargarServicios();
          this.cargarBarberos();
        }
      },
      error: (error) => {
        console.error('Error al cargar barbería:', error);
        this.cargando = false;
      }
    });
  }

  cargarServicios(): void {
    this.serviciosService.obtenerPorBarberia(this.idBarberia).subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });
  }

  cargarBarberos(): void {
    // Este endpoint necesitaría ser creado en el backend
    // Por ahora dejamos un array vacío
    this.cargando = false;
    this.barberos = [];
  }

  irAReservar(): void {
    this.router.navigate(['/citas/crear'], { queryParams: { barberia: this.idBarberia } });
  }
}
