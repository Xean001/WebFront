import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HorariosService } from '../../../shared/services/horarios.service';

@Component({
  selector: 'app-gestionar-horarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './gestionar.component.html',
  styleUrl: './gestionar.component.css'
})
export class GestionarHorariosComponent implements OnInit {
  formularioHorario: FormGroup;
  formularioExcepcion: FormGroup;
  horarios: any[] = [];
  excepciones: any[] = [];
  cargando: boolean = false;
  cargandoExcepciones: boolean = false;
  guardando: boolean = false;
  guardandoExcepcion: boolean = false;
  idBarbero: number = 0; // Se obtendría del usuario autenticado

  constructor(
    private fb: FormBuilder,
    private horariosService: HorariosService
  ) {
    this.formularioHorario = this.fb.group({
      diaSemana: ['', Validators.required],
      horaApertura: ['', Validators.required],
      horaCierre: ['', Validators.required],
      descanso: [false]
    });

    this.formularioExcepcion = this.fb.group({
      fecha: ['', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', Validators.required],
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarHorarios();
    this.cargarExcepciones();
  }

  cargarHorarios(): void {
    this.cargando = true;
    this.horariosService.listarHorariosBarbero(this.idBarbero).subscribe({
      next: (response) => {
        if (response.success) {
          this.horarios = response.data || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        this.cargando = false;
      }
    });
  }

  cargarExcepciones(): void {
    this.cargandoExcepciones = true;
    this.horariosService.listarExcepciones(this.idBarbero).subscribe({
      next: (response) => {
        if (response.success) {
          this.excepciones = response.data || [];
        }
        this.cargandoExcepciones = false;
      },
      error: (error) => {
        console.error('Error al cargar excepciones:', error);
        this.cargandoExcepciones = false;
      }
    });
  }

  toggleDescanso(): void {
    const descanso = this.formularioHorario.get('descanso')?.value;
    if (descanso) {
      this.formularioHorario.get('horaApertura')?.clearValidators();
      this.formularioHorario.get('horaCierre')?.clearValidators();
    } else {
      this.formularioHorario.get('horaApertura')?.setValidators([Validators.required]);
      this.formularioHorario.get('horaCierre')?.setValidators([Validators.required]);
    }
    this.formularioHorario.get('horaApertura')?.updateValueAndValidity();
    this.formularioHorario.get('horaCierre')?.updateValueAndValidity();
  }

  guardarHorario(): void {
    if (!this.formularioHorario.valid) {
      return;
    }

    this.guardando = true;
    const datos = {
      diaSemana: this.formularioHorario.get('diaSemana')?.value,
      horaApertura: this.formularioHorario.get('horaApertura')?.value,
      horaCierre: this.formularioHorario.get('horaCierre')?.value,
      descanso: this.formularioHorario.get('descanso')?.value
    };

    this.horariosService.crearHorarioBarbero(datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Horario guardado exitosamente');
          this.formularioHorario.reset();
          this.cargarHorarios();
        }
        this.guardando = false;
      },
      error: (error) => {
        console.error('Error al guardar horario:', error);
        alert('Error al guardar el horario');
        this.guardando = false;
      }
    });
  }

  guardarExcepcion(): void {
    if (!this.formularioExcepcion.valid) {
      return;
    }

    this.guardandoExcepcion = true;
    const datos = {
      idBarbero: this.idBarbero,
      fecha: this.formularioExcepcion.get('fecha')?.value,
      horaInicio: this.formularioExcepcion.get('horaInicio')?.value,
      horaFin: this.formularioExcepcion.get('horaFin')?.value,
      motivo: this.formularioExcepcion.get('motivo')?.value,
      tipo: 'NO_DISPONIBLE'
    };

    this.horariosService.crearExcepcion(datos).subscribe({
      next: (response) => {
        if (response.success) {
          alert('Excepción guardada exitosamente');
          this.formularioExcepcion.reset();
          this.cargarExcepciones();
        }
        this.guardandoExcepcion = false;
      },
      error: (error) => {
        console.error('Error al guardar excepción:', error);
        alert('Error al guardar la excepción');
        this.guardandoExcepcion = false;
      }
    });
  }

  eliminarHorario(idHorario: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este horario?')) {
      this.horariosService.eliminarHorarioBarbero(idHorario).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Horario eliminado exitosamente');
            this.cargarHorarios();
          }
        },
        error: (error) => {
          console.error('Error al eliminar horario:', error);
          alert('Error al eliminar el horario');
        }
      });
    }
  }

  eliminarExcepcion(idExcepcion: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar esta excepción?')) {
      this.horariosService.eliminarExcepcion(idExcepcion).subscribe({
        next: (response) => {
          if (response.success) {
            alert('Excepción eliminada exitosamente');
            this.cargarExcepciones();
          }
        },
        error: (error) => {
          console.error('Error al eliminar excepción:', error);
          alert('Error al eliminar la excepción');
        }
      });
    }
  }
}
