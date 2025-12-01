import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Plan {
  nombre: string;
  tipo: 'PRUEBA' | 'MENSUAL' | 'SEMESTRAL' | 'ANUAL';
  descripcion: string;
  precio: number;
  duracionDias: number;
  limiteBarberos: number;
  limiteServicios: number | null;
}

@Component({
  selector: 'app-planes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planes.component.html',
  styleUrls: ['./planes.component.css']
})
export class PlanesComponent implements OnInit {
  planes: Plan[] = [
    {
      nombre: 'Prueba Gratis',
      tipo: 'PRUEBA',
      descripcion: 'Prueba gratis por 7 días',
      precio: 0.00,
      duracionDias: 7,
      limiteBarberos: 10,
      limiteServicios: 25
    },
    {
      nombre: 'Plan Mensual',
      tipo: 'MENSUAL',
      descripcion: 'Suscripción mensual',
      precio: 29.00,
      duracionDias: 30,
      limiteBarberos: 150,
      limiteServicios: 200
    },
    {
      nombre: 'Plan Semestral',
      tipo: 'SEMESTRAL',
      descripcion: 'Suscripción semestral (15% descuento)',
      precio: 149.00,
      duracionDias: 180,
      limiteBarberos: 150,
      limiteServicios: 200
    },
    {
      nombre: 'Plan Anual',
      tipo: 'ANUAL',
      descripcion: 'Suscripción anual (25% descuento)',
      precio: 249.00,
      duracionDias: 365,
      limiteBarberos: 150,
      limiteServicios: 200
    }
  ];

  mejorPlan = 'SEMESTRAL';

  ngOnInit(): void {
    // Componente listo
  }

  contratarPlan(plan: Plan): void {
    console.log('Contratar plan:', plan);
    // Aquí iría la lógica de compra
  }

  calcularPrecioDiario(plan: Plan): number {
    return plan.precio / plan.duracionDias;
  }

  getPriceColor(plan: Plan): string {
    if (plan.tipo === 'PRUEBA') return '#34d399'; // Verde
    if (plan.tipo === 'SEMESTRAL') return '#ffd700'; // Dorado (mejor plan)
    return '#ffffff'; // Blanco
  }
}
