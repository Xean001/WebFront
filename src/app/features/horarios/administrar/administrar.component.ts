import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HorariosService, HorarioBarberiaRequest, LocalTime } from '../../../shared/services/horarios.service';
import { BarberiaService } from '../../../shared/services/barberias.service';

@Component({
  selector: 'app-administrar-horarios',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './administrar.component.html',
  styleUrl: './administrar.component.css'
})
export class AdministrarHorariosComponent implements OnInit {
  barberias: any[] = [];
  horarios: any[] = [];
  horariosFiltrados: any[] = [];
  formulario: FormGroup;
  editandoId: number | null = null;
  cargando: boolean = false;
  mostrarFormulario: boolean = false;
  barberiaSeleccionada: number | null = null;
  busqueda: string = '';

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
    private horariosService: HorariosService,
    private barberiaService: BarberiaService,
    private fb: FormBuilder
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarBarberias();
  }

  crearFormulario(): FormGroup {
    return this.fb.group({
      diaSemana: ['', Validators.required],
      horaApertura: ['', Validators.required],
      horaCierre: ['', Validators.required],
      cerrado: [false]
    });
  }

  cargarBarberias(): void {
    this.cargando = true;
    this.barberiaService.obtenerBarberiasActivas().subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.barberias = Array.isArray(response.data) ? response.data : response.data.content || [];
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar barberías:', error);
        this.cargando = false;
      }
    });
  }

  onBarberiaChange(): void {
    if (!this.barberiaSeleccionada) {
      this.horarios = [];
      this.horariosFiltrados = [];
      return;
    }
    this.cargarHorarios();
  }

  cargarHorarios(): void {
    if (!this.barberiaSeleccionada) return;

    this.cargando = true;
    this.horariosService.listarHorariosBarberia(this.barberiaSeleccionada).subscribe({
      next: (response) => {
        if (response.success || response.data) {
          this.horarios = Array.isArray(response.data) ? response.data : response.data || [];
          this.aplicarFiltros();
        }
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar horarios:', error);
        alert('Error al cargar horarios');
        this.cargando = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = this.horarios;

    if (this.busqueda.trim()) {
      const search = this.busqueda.toLowerCase();
      resultado = resultado.filter(h => {
        const dia = this.dias.find(d => d.valor === h.diaSemana)?.nombre || '';
        return dia.toLowerCase().includes(search);
      });
    }

    this.horariosFiltrados = resultado;
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
    if (!this.mostrarFormulario) {
      this.editandoId = null;
      this.formulario.reset({ cerrado: false });
    }
  }

  guardarHorario(): void {
    if (!this.barberiaSeleccionada) {
      alert('Selecciona una barbería');
      return;
    }

    if (this.formulario.invalid) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.cargando = true;
    const datos = this.formulario.value;

    // Convertir horas de string (HH:mm) a objeto LocalTime
    const [hAper, mAper] = datos.horaApertura.split(':');
    const [hCierre, mCierre] = datos.horaCierre.split(':');

    const horarioRequest: HorarioBarberiaRequest = {
      diaSemana: datos.diaSemana,
      horaApertura: { hour: parseInt(hAper), minute: parseInt(mAper), second: 0, nano: 0 },
      horaCierre: { hour: parseInt(hCierre), minute: parseInt(mCierre), second: 0, nano: 0 },
      cerrado: datos.cerrado
    };

    if (this.editandoId) {
      // Actualizar
      this.horariosService.actualizarHorarioBarberia(this.editandoId, horarioRequest).subscribe({
        next: () => {
          alert('Horario actualizado exitosamente');
          this.cargarHorarios();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al actualizar horario:', error);
          alert('Error al actualizar el horario');
          this.cargando = false;
        }
      });
    } else {
      // Crear
      this.horariosService.crearHorarioBarberia(this.barberiaSeleccionada, horarioRequest).subscribe({
        next: () => {
          alert('Horario creado exitosamente');
          this.cargarHorarios();
          this.toggleFormulario();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al crear horario:', error);
          alert('Error al crear el horario');
          this.cargando = false;
        }
      });
    }
  }

  editarHorario(horario: any): void {
    this.editandoId = horario.idHorario;
    const horaAper = `${String(horario.horaInicio?.hour || 0).padStart(2, '0')}:${String(horario.horaInicio?.minute || 0).padStart(2, '0')}`;
    const horaCierre = `${String(horario.horaFin?.hour || 0).padStart(2, '0')}:${String(horario.horaFin?.minute || 0).padStart(2, '0')}`;

    this.formulario.patchValue({
      diaSemana: horario.diaSemana,
      horaApertura: horaAper,
      horaCierre: horaCierre,
      cerrado: horario.cerrado
    });
    this.mostrarFormulario = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.formulario.reset({ cerrado: false });
    this.mostrarFormulario = false;
  }

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

  get campoDia() {
    return this.formulario.get('diaSemana');
  }

  get campoHoraApertura() {
    return this.formulario.get('horaApertura');
  }

  get campoHoraCierre() {
    return this.formulario.get('horaCierre');
  }

  // Método para formatear hora desde LocalTime
  formatearHora(hora: any): string {
    if (!hora) return '--:--';
    return `${String(hora.hour || 0).padStart(2, '0')}:${String(hora.minute || 0).padStart(2, '0')}`;
  }
}
