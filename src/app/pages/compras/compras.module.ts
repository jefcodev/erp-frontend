import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProveedorComponent } from './proveedor/proveedor.component';
import { CompraComponent } from './compra/compra.component';

@NgModule({
  declarations: [
    ProveedorComponent,
    CompraComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ProveedorComponent
  ]
})

export class ComprasModule { }