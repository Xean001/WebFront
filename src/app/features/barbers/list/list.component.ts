import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-list-barbers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.component.html',
  styleUrl: './list.component.css'
})
export class ListBarbersComponent implements OnInit {
  barberos: any[] = [];
  cargando: boolean = false;
  busqueda: string = '';

  constructor() { }

  ngOnInit(): void {
    this.cargarBarberos();
  }

  cargarBarberos(): void {
    this.cargando = true;
    // Datos de prueba
    setTimeout(() => {
      this.barberos = [
        {
          id: 1,
          nombre: 'Juan García',
          especialidad: 'Barbería Clásica',
          experiencia: 5,
          calificacion: 4.8,
          imagen: 'assets/barber1.jpg'
        },
        {
          id: 2,
          nombre: 'Carlos López',
          especialidad: 'Cortes Modernos',
          experiencia: 3,
          calificacion: 4.5,
          imagen: 'assets/barber2.jpg'
        },
        {
          id: 3,
          nombre: 'Miguel Rodríguez',
          especialidad: 'Diseño y Barba',
          experiencia: 7,
          calificacion: 4.9,
          imagen: 'assets/barber3.jpg'
        }
      ];
      this.cargando = false;
    }, 500);
  }

  buscarBarberos(): void {
    if (!this.busqueda.trim()) {
      this.cargarBarberos();
      return;
    }

    this.cargando = true;
    setTimeout(() => {
      this.barberos = this.barberos.filter(b => 
        b.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        b.especialidad.toLowerCase().includes(this.busqueda.toLowerCase())
      );
      this.cargando = false;
    }, 300);
  }
}
