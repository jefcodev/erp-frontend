import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CuentaComponent } from './cuenta/cuenta.component';
import { FormaPagoComponent } from './forma-pago/forma-pago.component';
import { TarifaIVAComponent } from './tarifa-iva/tarifa-iva.component';
import { AsientoComponent } from './asiento/asiento.component';
import { DetalleAsientoComponent } from './detalle-asiento/detalle-asiento.component';
import { LibroDiarioComponent } from './libro-diario/libro-diario.component';
import { LibroMayorComponent } from './libro-mayor/libro-mayor.component';
import { BalanceGeneralComponent } from './balance-general/balance-general.component';
import { EstadoResultadoComponent } from './estado-resultado/estado-resultado.component';

@NgModule({
  declarations: [
    CuentaComponent,
    FormaPagoComponent,
    TarifaIVAComponent,
    AsientoComponent,
    DetalleAsientoComponent,
    LibroDiarioComponent,
    LibroMayorComponent,
    BalanceGeneralComponent,
    EstadoResultadoComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    CuentaComponent,
    FormaPagoComponent
  ]
})
export class ContabilidadModule { }
