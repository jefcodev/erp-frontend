import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClienteComponent } from './cliente/cliente.component';
import { FacturaVentaComponent } from './factura/factura.component';
//import { DetalleFacturaVentaComponent } from './detalle-factura/detalle-factura.component';


@NgModule({
  declarations: [
    ClienteComponent,
    FacturaVentaComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ClienteComponent
  ]
})
export class VentaModule { }
