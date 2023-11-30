import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ProductoComponent } from './producto/producto.component';
import { MarcasComponent } from './marcas/marcas.component';
import { TiposComponent } from './tipos/tipos.component';

@NgModule({
  declarations: [
    ProductoComponent,
    MarcasComponent,
    TiposComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    ProductoComponent
  ]
})
export class InventarioModule { }
