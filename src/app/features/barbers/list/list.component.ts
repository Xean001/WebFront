import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PersonalService } from '../../../shared/services/personal.service';
import { BarberiaService } from '../../../shared/services/barberias.service';

@Component({
  selector: 'app-list-barbers',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListBarbersComponent implements OnInit {
  barberos: any[] = [];
  barberosFiltrados: any[] = [];
  barberias: any[] = [];
  cargando: boolean = false;
  busqueda: string = '';
  barberiaFiltro: string = '';

  constructor(
    private personalService: PersonalService,
    private barberiaService: BarberiaService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarBarberias();
    this.cargarBarberos();
  }

  cargarBarberias(): void {
    this.barberiaService.obtenerBarberiasDisponibles().subscribe({
      next: (response) => {
        if (response.success) {
          this.barberias = response.data || [];
        }
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
      }
    });
  }

  cargarBarberos(): void {
    this.cargando = true;
    this.personalService.obtenerTodosBarberos().subscribe({
      next: (response) => {
        console.log('Barberos recibidos:', response);
        if (response.success) {
          this.barberos = response.data || [];
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberos:', error);
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.barberos];

    // Filtro por búsqueda de texto
    if (this.busqueda.trim()) {
      resultado = resultado.filter(b => 
        b.usuario?.nombre?.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        b.especialidad?.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    }

    // Filtro por barbería
    if (this.barberiaFiltro) {
      resultado = resultado.filter(b => b.idBarberia?.toString() === this.barberiaFiltro);
    }

    this.barberosFiltrados = resultado;
  }

  buscarBarberos(): void {
    this.aplicarFiltros();
  }

  filtrarPorBarberia(): void {
    this.aplicarFiltros();
  }

  verPerfil(idBarbero: number): void {
    this.router.navigate(['/barbers/detail', idBarbero]);
  }

  getNombreBarberia(idBarberia: number): string {
    const barberia = this.barberias.find(b => b.idBarberia === idBarberia);
    return barberia?.nombre || 'Barbería';
  }
}
