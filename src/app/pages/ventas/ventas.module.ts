import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ClienteComponent } from './cliente/cliente.component';
import { VentaComponent } from './venta/venta.component'; 

@NgModule({
  declarations: [
    ClienteComponent,
    VentaComponent
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