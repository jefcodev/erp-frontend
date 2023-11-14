import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { Apu } from 'src/app/models/apus/apu.model';

import { ApuDetalle } from 'src/app/models/apus/apuDetalle.model';

import { ApuService } from 'src/app/services/apus/apu.service';


@Component({
  selector: 'app-apus',
  templateUrl: './apus.component.html',
  styles: [
  ]
})
export class ApusComponent implements OnInit{

  public id_apu : number = 1;
  public apus : ApuDetalle [] = [];
  public cargando: boolean = false;

  constructor(
    private apuService: ApuService
  ){

  }
  ngOnInit(): void {
      this.cargarApus();
      console.log(this.cargarApus());
  }
  /* cargarApus() {
    const id: number = 1;
    this.apuService.cargarDetalleApus(id).subscribe((capitulo) => {
      console.log('Data'+capitulo.codigo);
      this.apus = [capitulo]; // Coloca el objeto ApuDetalle en un arreglo
    });
  }; */


  cargarApus() {
    this.apuService.cargarDetalleApus(this.id_apu)
      .subscribe(capitulo => {
        this.apus = capitulo;
        console.log('APU', this.apus); 
      })
  }
  


}
