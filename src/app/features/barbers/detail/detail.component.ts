import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { BarberoPerfilService } from '../../../shared/services/barbero-perfil.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {
  perfil: any = null;
  servicios: any[] = [];
  galeria: any[] = [];
  fotoSeleccionada: any = null;
  cargando: boolean = false;
  idBarbero: number = 0;

  constructor(
    private route: ActivatedRoute,
    private barberoPerfilService: BarberoPerfilService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idBarbero = params['id'];
      this.cargarDatos();
    });
  }

  cargarDatos(): void {
    this.cargando = true;
    
    // Cargar perfil
    this.barberoPerfilService.obtenerPerfilPublico(this.idBarbero).subscribe({
      next: (response) => {
        if (response.success) {
          this.perfil = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar perfil:', error);
      }
    });

    // Cargar servicios
    this.barberoPerfilService.listarServiciosBarbero(this.idBarbero).subscribe({
      next: (response) => {
        if (response.success) {
          this.servicios = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar servicios:', error);
      }
    });

    // Cargar galería
    this.barberoPerfilService.listarGaleriaBarbero(this.idBarbero).subscribe({
      next: (response) => {
        if (response.success) {
          this.galeria = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar galería:', error);
        this.cargando = false;
      }
    });
  }

  abrirFoto(foto: any): void {
    this.fotoSeleccionada = foto;
  }
}

