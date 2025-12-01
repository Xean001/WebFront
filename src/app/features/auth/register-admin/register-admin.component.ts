import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../shared/services/auth.service';
import { PlanSuscripcionService, PlanSuscripcion } from '../../../shared/services/plan-suscripcion.service';
import { SuscripcionService } from '../../../shared/services/suscripcion.service';

@Component({
  selector: 'app-register-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register-admin.component.html',
  styleUrls: ['./register-admin.component.css']
})
export class RegisterAdminComponent implements OnInit {
  formulario!: FormGroup;
  cargando: boolean = false;
  generosDisponibles: string[] = ['MASCULINO', 'FEMENINO', 'OTRO'];
  planes: PlanSuscripcion[] = [];
  planesLoading: boolean = false;
  errores: { [key: string]: string } = {};
  planSeleccionado: PlanSuscripcion | null = null;
  paso: number = 1; // Paso 1: Datos, Paso 2: Seleccionar plan
  yaAutenticado: boolean = false; // Si ya está logueado
  usuarioActual: any = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private planService: PlanSuscripcionService,
    private suscripcionService: SuscripcionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar si ya está autenticado
    this.authService.currentUser$.subscribe(user => {
      this.usuarioActual = user;
      this.yaAutenticado = !!user;
      
      if (this.yaAutenticado && user) {
        console.log('✅ Usuario ya autenticado:', user.nombre);
        console.log('📊 Estado actual:', user.estadoSuscripcion);
        
        // Si ya está logueado, ir directo al paso 2
        this.paso = 2;
        
        // Recuperar plan seleccionado previamente si existe
        const tipoPlanGuardado = sessionStorage.getItem('tipoPlanSeleccionado');
        if (tipoPlanGuardado && this.planes.length > 0) {
          const plan = this.planes.find(p => p.tipoPlan === tipoPlanGuardado);
          if (plan) {
            this.planSeleccionado = plan;
            console.log('🔄 Plan recuperado:', plan.nombre);
          }
        }
      }
    });
    
    this.inicializarFormulario();
    this.cargarPlanes();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      apellido: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(/^[0-9]{7,15}$/)]],
      contrasena: ['', [Validators.required, Validators.minLength(8)]],
      confirmarContrasena: ['', Validators.required],
      fechaNacimiento: ['', Validators.required],
      genero: ['MASCULINO', Validators.required],
      fotoPerfilUrl: ['']
    }, { validators: this.contraseñasCoincidan });
  }

  contraseñasCoincidan(group: FormGroup): { [key: string]: any } | null {
    const contrasena = group.get('contrasena')?.value;
    const confirmar = group.get('confirmarContrasena')?.value;
    
    if (contrasena && confirmar && contrasena !== confirmar) {
      return { contraseñasNoCoinciden: true };
    }
    return null;
  }

  cargarPlanes(): void {
    this.planesLoading = true;
    this.planService.obtenerPlanes().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          this.planes = response.data;
        }
        this.planesLoading = false;
      },
      error: (error: any) => {
        console.error('Error al cargar planes:', error);
        this.planesLoading = false;
        this.errores['planes'] = 'Error al cargar los planes de suscripción';
      }
    });
  }

  seleccionarPlan(plan: PlanSuscripcion): void {
    this.planSeleccionado = plan;
    // Guardar en sessionStorage para persistir entre navegaciones
    sessionStorage.setItem('tipoPlanSeleccionado', plan.tipoPlan);
    console.log('💾 Plan guardado en sessionStorage:', plan.tipoPlan);
  }

  siguientePaso(): void {
    if (this.formulario.invalid) {
      this.marcarCamposComoTocados();
      return;
    }
    this.paso = 2;
  }

  pasoAnterior(): void {
    // Si ya está autenticado, no volver al paso 1
    if (this.yaAutenticado) {
      // Cancelar proceso y limpiar
      this.cancelarCambioSuscripcion();
    } else {
      this.paso = 1;
    }
  }

  /**
   * Cancelar cambio de suscripción (para usuarios ya autenticados)
   */
  cancelarCambioSuscripcion(): void {
    if (confirm('¿Estás seguro de cancelar el cambio de suscripción?')) {
      // Limpiar sessionStorage
      sessionStorage.removeItem('tipoPlanSeleccionado');
      sessionStorage.removeItem('idSuscripcion');
      sessionStorage.removeItem('montoAPagar');
      sessionStorage.removeItem('tipoPlan');
      
      // Redirigir al dashboard
      this.router.navigate(['/dashboard']);
    }
  }

  registrar(): void {
    console.log('🚀 Iniciando proceso...');
    console.log('👤 Ya autenticado?', this.yaAutenticado);
    console.log('📋 Plan seleccionado:', this.planSeleccionado);
    
    if (!this.planSeleccionado) {
      console.error('❌ No hay plan seleccionado');
      this.errores['plan'] = 'Debes seleccionar un plan de suscripción';
      return;
    }

    // Si ya está autenticado, solo cambiar plan
    if (this.yaAutenticado) {
      this.cambiarPlan();
      return;
    }

    // Si no está autenticado, hacer registro normal
    if (this.formulario.invalid) {
      console.error('❌ Formulario inválido');
      this.marcarCamposComoTocados();
      return;
    }

    this.cargando = true;
    this.errores = {};

    // Enviar EXACTAMENTE los campos que espera el backend
    const datos = {
      nombre: this.formulario.get('nombre')?.value?.trim(),
      apellido: this.formulario.get('apellido')?.value?.trim() || undefined,
      correo: this.formulario.get('correo')?.value?.trim(),
      telefono: this.formulario.get('telefono')?.value?.trim() || undefined,
      contrasena: this.formulario.get('contrasena')?.value,
      fechaNacimiento: this.formulario.get('fechaNacimiento')?.value || undefined,
      tipoPlan: this.planSeleccionado.tipoPlan // PRUEBA, MENSUAL, SEMESTRAL, ANUAL
    };

    // Limpiar campos undefined
    Object.keys(datos).forEach(key => {
      if (datos[key as keyof typeof datos] === undefined) {
        delete datos[key as keyof typeof datos];
      }
    });

    console.log('📝 Datos a enviar al backend:');
    console.log(JSON.stringify(datos, null, 2));
    console.log('Plan seleccionado:', this.planSeleccionado);

    this.authService.registrarAdmin(datos as any).subscribe({
      next: (response: any) => {
        this.cargando = false;
        console.log('✅ Respuesta del servidor:', response);
        
        if (response.success && response.data) {
          console.log('✅ Registro exitoso');
          console.log('📦 Respuesta completa:', JSON.stringify(response.data, null, 2));
          console.log('📦 Token recibido:', response.data.token ? 'SÍ ✓' : 'NO ✗');
          console.log('📦 idSuscripcion:', response.data.idSuscripcion);
          console.log('📦 idUsuario:', response.data.idUsuario);
          console.log('📦 Todas las propiedades:', Object.keys(response.data));
          
          // Esperar 500ms para asegurar que el token se guarde
          setTimeout(() => {
            // Si es plan prueba, ir directo al onboarding
            if (this.planSeleccionado && this.planSeleccionado.tipoPlan === 'PRUEBA') {
              console.log('🎯 Plan PRUEBA - Redirigiendo a onboarding...');
              this.router.navigate(['/auth/onboarding']);
            } else if (this.planSeleccionado) {
              // Si es plan de pago, guardar datos para la pantalla de comprobante
              console.log('💳 Plan PAGO - Preparando redireccionamiento a cargar comprobante...');
              
              // Guardar en sessionStorage para la siguiente página
              // Usar idSuscripcion si existe, sino usar idUsuario
              const idSuscripcion = response.data.idSuscripcion || response.data.idUsuario;
              sessionStorage.setItem('idSuscripcion', idSuscripcion?.toString() || '');
              sessionStorage.setItem('montoAPagar', this.planSeleccionado.precio.toString());
              sessionStorage.setItem('tipoPlan', this.planSeleccionado.tipoPlan || '');
              
              console.log('📊 Datos guardados en sessionStorage:');
              console.log('   - idSuscripcion:', idSuscripcion);
              console.log('   - montoAPagar:', this.planSeleccionado.precio);
              console.log('   - tipoPlan:', this.planSeleccionado.tipoPlan);
              
              console.log('🔄 Navegando a /auth/cargar-comprobante...');
              this.router.navigate(['/auth/cargar-comprobante']).then(
                (exito) => {
                  console.log('✅ Navegación exitosa:', exito);
                },
                (error) => {
                  console.error('❌ Error en navegación:', error);
                }
              );
            }
          }, 500);
        } else {
          this.errores['general'] = response.message || 'Error en el registro';
        }
      },
      error: (error: any) => {
        this.cargando = false;
        console.error('❌ Error en registro');
        console.error('Status:', error.status);
        console.error('Respuesta:', error.error);
        
        // Manejar errores específicos
        switch(error.status) {
          case 400:
            if (error.error?.message) {
              this.errores['general'] = `❌ ${error.error.message}`;
            } else if (error.error?.errors) {
              // Si hay errores de validación específicos
              const errores = Object.values(error.error.errors).join(', ');
              this.errores['general'] = `❌ ${errores}`;
            } else {
              this.errores['general'] = '❌ Los datos ingresados no son válidos';
            }
            break;
          case 409:
            this.errores['general'] = '❌ Este correo ya está registrado';
            break;
          case 422:
            this.errores['general'] = '❌ Datos inválidos. Verifica todos los campos.';
            break;
          case 500:
            this.errores['general'] = '❌ Error del servidor. Por favor intenta más tarde.';
            break;
          default:
            this.errores['general'] = error.error?.message || 'Error al registrarse. Por favor intenta de nuevo.';
        }
      }
    });
  }

  /**
   * Cambiar plan para usuario ya autenticado
   */
  cambiarPlan(): void {
    if (!this.planSeleccionado || !this.usuarioActual) return;

    console.log('🔄 Buscando o creando suscripción para usuario autenticado...');
    console.log('📦 Plan seleccionado:', this.planSeleccionado.tipoPlan);
    
    this.cargando = true;
    this.errores = {};
    
    // Primero intentar obtener suscripciones existentes
    this.suscripcionService.obtenerMisSuscripciones().subscribe({
      next: (response) => {
        console.log('✅ Respuesta de suscripciones:', response);
        
        if (response.success && response.data && response.data.length > 0) {
          // Ya tiene suscripciones, usar la primera (más reciente)
          const suscripcion = response.data[0];
          
          console.log('✅ Suscripción existente encontrada:', suscripcion);
          
          if (!this.planSeleccionado) return;
          
          // Guardar datos en sessionStorage
          sessionStorage.setItem('idSuscripcion', suscripcion.idSuscripcion.toString());
          sessionStorage.setItem('montoAPagar', this.planSeleccionado.precio.toString());
          sessionStorage.setItem('tipoPlan', this.planSeleccionado.tipoPlan);
          sessionStorage.setItem('emailUsuario', this.usuarioActual?.correo || '');
          
          console.log('💾 Datos guardados (suscripción existente):');
          console.log('   - idSuscripcion:', suscripcion.idSuscripcion);
          console.log('   - monto:', this.planSeleccionado.precio);
          console.log('   - plan:', this.planSeleccionado.tipoPlan);
          
          this.cargando = false;
          this.router.navigate(['/auth/cargar-comprobante']);
          
        } else {
          // No tiene suscripciones, intentar crear una
          console.log('⚠️ No hay suscripciones, intentando crear...');
          this.crearNuevaSuscripcion();
        }
      },
      error: (error) => {
        console.error('❌ Error obteniendo suscripciones:', error);
        console.log('⚠️ Intentando crear suscripción de todos modos...');
        // Si falla obtener, intentar crear
        this.crearNuevaSuscripcion();
      }
    });
  }

  /**
   * Crear nueva suscripción
   */
  private crearNuevaSuscripcion(): void {
    if (!this.planSeleccionado) return;
    
    console.log('🆕 Creando nueva suscripción...');
    
    this.suscripcionService.crearSuscripcion(this.planSeleccionado.tipoPlan as any).subscribe({
      next: (response) => {
        console.log('✅ Suscripción creada:', response);
        
        if (response.success && response.data) {
          const suscripcion = response.data;
          
          // Guardar datos en sessionStorage
          sessionStorage.setItem('idSuscripcion', suscripcion.idSuscripcion.toString());
          sessionStorage.setItem('montoAPagar', suscripcion.precio.toString());
          sessionStorage.setItem('tipoPlan', suscripcion.tipoPlan);
          sessionStorage.setItem('emailUsuario', this.usuarioActual.correo || '');
          
          console.log('💾 Datos guardados (suscripción nueva):');
          console.log('   - idSuscripcion:', suscripcion.idSuscripcion);
          console.log('   - monto:', suscripcion.precio);
          console.log('   - plan:', suscripcion.tipoPlan);
          
          this.cargando = false;
          this.router.navigate(['/auth/cargar-comprobante']);
        }
      },
      error: (error) => {
        console.error('❌ Error creando suscripción:', error);
        this.cargando = false;
        
        // Si falla crear, mostrar error detallado
        const mensaje = error.error?.message || error.message || 'Error al crear la suscripción';
        this.errores['general'] = `❌ ${mensaje}\n\nPosibles causas:\n- Debes completar el registro de tu barbería primero\n- Ya tienes una suscripción activa\n- Error del servidor`;
        
        console.error('Detalles del error:', {
          status: error.status,
          message: error.error?.message,
          url: error.url
        });
      }
    });
  }

  marcarCamposComoTocados(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      this.formulario.get(key)?.markAsTouched();
    });
  }
}

