import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Model
import { Quotation } from 'src/app/models/quotations/quotation.model';

//Service 

import { QuotationService } from 'src/app/services/quotations/quotation.service';


@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styles: [
  ]
})
export class QuotationsComponent implements OnInit{

  public quotations: Quotation[]=[];
  public cargando: boolean = true;
  constructor(
    private quotationService: QuotationService,
    private router: Router
  ){

  }

  ngOnInit(): void {
    this.cargarQuotations();
  }

  cargarQuotations() {
    this.cargando = true;
      this.quotationService.cargarQuotations()
        .subscribe(quotations => {
          this.quotations = quotations;
          console.log(quotations)
          this.cargando = false;
        });
    }

}
