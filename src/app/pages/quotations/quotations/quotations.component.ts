import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Model
import { Proforma } from 'src/app/models/quotations/quotation.model'; 
import { Cliente } from 'src/app/models/venta/cliente.model';


//Service 
import { QuotationService } from 'src/app/services/quotations/quotation.service';
import { ClienteService } from 'src/app/services/venta/cliente.service';


@Component({
  selector: 'app-quotations',
  templateUrl: './quotations.component.html',
  styles: [
  ]
})
export class QuotationsComponent implements OnInit{

  
  public proformas: Proforma[]=[];
  public clientes : Cliente []=[];


  public cargando: boolean = true;
  constructor(
    private quotationService: QuotationService,
    private clienteServive : ClienteService,
    private router: Router
  ){

  }

  ngOnInit(): void {
    this.cargarQuotations();
    this.cargarClientes();
  }

  cargarQuotations() {
    this.cargando = true;
      this.quotationService.cargarQuotations()
        .subscribe(quotations => {
          this.proformas = quotations;
          console.log(quotations);
        });
    }

    cargarClientes(){
      this.clienteServive.loadClientesAll()
      .subscribe(({clientes})=>{
        this.clientes = clientes;
      })
    }

}
