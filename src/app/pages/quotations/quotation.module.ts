import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationsComponent } from './quotations/quotations.component';
import { ClientsComponent } from './clients/clients.component';
import { GroupsClientsComponent } from './groups-clients/groups-clients.component';
import { ImportClientsComponent } from './import-clients/import-clients.component';
import { QuotationComponent } from './quotations/quotation.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';




@NgModule({
  declarations: [
    QuotationsComponent,
    ClientsComponent,
    GroupsClientsComponent,
    ImportClientsComponent,
    QuotationComponent
  ],
  providers: [DatePipe],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule
  ]
})
export class QuotationModule { }
