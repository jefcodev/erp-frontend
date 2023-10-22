import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from "@angular/common/http";

import { NgChartsModule } from 'ng2-charts';

// Components
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { PerfilComponent } from './perfil/perfil.component';
import { ApuModule } from './apu/apu.module';

// Módulos
import { ComponentsModule } from '../components/components.module';
import { ShareModule } from '../shared/share.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InventoryModule } from './inventory/inventory.module';
import { PurchaseModule } from './purchases/purchase.module';
import { ComprasModule } from './compras/compras.module';
import { QuotationModule } from './quotations/quotation.module';

import { ContabilidadModule } from './contabilidad/contabilidad.module';

@NgModule({
  declarations: [
    DashboardComponent,
    PagesComponent,
    AccountSettingsComponent,
    PromesasComponent,
    RxjsComponent,
    PerfilComponent,
  ],
  exports:[
    DashboardComponent,
    PagesComponent,
    AccountSettingsComponent,
    UsuariosModule,
    ComprasModule,
    ContabilidadModule
  ],
  imports: [
    CommonModule,
    RouterModule,
    ShareModule,
    InventoryModule,
    PurchaseModule,
    QuotationModule,
    FormsModule,
    ApuModule,
    ReactiveFormsModule,
    ComponentsModule,
    HttpClientModule,
    NgChartsModule,
  ]
})

export class PagesModule { }
