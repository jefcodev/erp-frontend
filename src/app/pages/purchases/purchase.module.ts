import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import { IvaComponent } from './iva/iva.component';
import { ProvidersComponent } from './providers/providers.component';
import { PurchasesComponent } from './purchases/purchases.component';
import { PurchaseComponent } from './purchases/purchase.component';
import { ImportProvidersComponent } from './import-providers/import-providers.component';



@NgModule({
  declarations: [
    IvaComponent,
    ProvidersComponent,
    PurchasesComponent,
    PurchaseComponent,
    ImportProvidersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class PurchaseModule { }
