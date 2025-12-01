import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HorariosService } from '../../../shared/services/horarios.service';
import { AuthService } from '../../../shared/services/auth.service';

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
  idBarbero: number = 0;
  tabActivo: number = 1; // Control de tabs

  dias = [
    { valor: 'MONDAY', nombre: 'Lunes' },
    { valor: 'TUESDAY', nombre: 'Martes' },
    { valor: 'WEDNESDAY', nombre: 'Miércoles' },
    { valor: 'THURSDAY', nombre: 'Jueves' },
    { valor: 'FRIDAY', nombre: 'Viernes' },
    { valor: 'SATURDAY', nombre: 'Sábado' },
    { valor: 'SUNDAY', nombre: 'Domingo' }
  ];

  constructor(
    private fb: FormBuilder,
    private horariosService: HorariosService,
    private authService: AuthService
  ) {
    this.formularioHorario = this.fb.group({
      diaSemana: ['', Validators.required],
      horaApertura: ['', Validators.required],
      horaCierre: ['', Validators.required],
      descanso: [false]
    });

    this.formularioExcepcion = this.fb.group({
      fecha: ['', Validators.required],
      horaInicio: [''], // Opcional - no se envía al backend
      horaFin: [''],    // Opcional - no se envía al backend
      motivo: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.cargarHorarios();
    this.cargarExcepciones();
  }

  cargarHorarios(): void {
    this.cargando = true;
    // Usar el endpoint que obtiene los horarios del barbero autenticado
    this.horariosService.listarMisHorarios().subscribe({
      next: (response) => {
        console.log('📅 Respuesta de mis horarios:', response);
        if (response.success) {
          this.horarios = Array.isArray(response.data) ? response.data : [response.data];
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

    // Obtener valores del formulario
    const horaApertura = this.formularioHorario.get('horaApertura')?.value;
    const horaCierre = this.formularioHorario.get('horaCierre')?.value;
    const descanso = this.formularioHorario.get('descanso')?.value;

    // Formato correcto esperado por el backend
    const datos = {
      diaSemana: this.formularioHorario.get('diaSemana')?.value,
      horaInicio: horaApertura || '00:00', // String en formato HH:mm
      horaFin: horaCierre || '00:00',      // String en formato HH:mm
      disponible: !descanso                 // true = disponible, false = no disponible (descanso)
    };

    console.log('📤 Enviando datos de horario:', datos);
    console.log('👤 Usuario actual:', this.authService.getCurrentUser());

    this.horariosService.crearHorarioBarbero(datos).subscribe({
      next: (response) => {
        console.log('✅ Respuesta exitosa:', response);
        if (response.success) {
          alert('Horario guardado exitosamente');
          this.formularioHorario.reset();
          this.cargarHorarios();
        }
        this.guardando = false;
      },
      error: (error) => {
        console.error('❌ Error completo:', error);
        console.error('❌ Status:', error.status);
        console.error('❌ Mensaje:', error.error);
        alert(`Error al guardar el horario: ${error.status} - ${error.error?.message || error.message}`);
        this.guardando = false;
      }
    });
  }

  guardarExcepcion(): void {
    if (!this.formularioExcepcion.valid) {
      return;
    }

    this.guardandoExcepcion = true;
    const fechaSeleccionada = this.formularioExcepcion.get('fecha')?.value;

    const datos = {
      fechaInicio: fechaSeleccionada,
      fechaFin: fechaSeleccionada, // Mismo día para excepciones de un solo día
      motivo: this.formularioExcepcion.get('motivo')?.value,
      esVacaciones: false // false = NO_DISPONIBLE, true = VACACIONES
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

  // Método para obtener el nombre del día desde el número
  getNombreDia(dia: string | number): string {
    // La API retorna un número, convertir a string
    const diaMap: { [key: number]: string } = {
      0: 'MONDAY',
      1: 'TUESDAY',
      2: 'WEDNESDAY',
      3: 'THURSDAY',
      4: 'FRIDAY',
      5: 'SATURDAY',
      6: 'SUNDAY'
    };

    const diaStr = typeof dia === 'number' ? diaMap[dia] : dia as string;
    return this.dias.find(d => d.valor === diaStr)?.nombre || diaStr || 'Desconocido';
  }

  // Método para formatear hora desde LocalTime o String
  formatearHora(hora: any): string {
    if (!hora) return '--:--';

    // Si es un string (formato "HH:mm:ss" o "HH:mm")
    if (typeof hora === 'string') {
      const partes = hora.split(':');
      if (partes.length >= 2) {
        return `${partes[0]}:${partes[1]}`; // Retorna HH:mm
      }
      return hora;
    }

    // Si es un objeto LocalTime
    if (hora.hour !== undefined && hora.minute !== undefined) {
      return `${String(hora.hour).padStart(2, '0')}:${String(hora.minute).padStart(2, '0')}`;
    }

    return '--:--';
  }

  // Método para convertir string de hora (HH:mm) a LocalTime
  convertirALocalTime(horaStr: string): any {
    if (!horaStr) {
      return { hour: 0, minute: 0, second: 0, nano: 0 };
    }

    const [hour, minute] = horaStr.split(':').map(Number);
    return {
      hour: hour || 0,
      minute: minute || 0,
      second: 0,
      nano: 0
    };
  }

  // Método para cambiar de tab
  cambiarTab(tab: number): void {
    this.tabActivo = tab;
  }
}
