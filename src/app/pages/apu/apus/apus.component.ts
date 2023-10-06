import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


import { Apu } from 'src/app/models/apus/apu.model';

import { ApuService } from 'src/app/services/apus/apu.service';


@Component({
  selector: 'app-apus',
  templateUrl: './apus.component.html',
  styles: [
  ]
})
export class ApusComponent implements OnInit{

  public apus : Apu[]=[];
  public cargando: boolean = true;

  constructor(
    private apuService: ApuService
  ){

  }
  ngOnInit(): void {
      this.cargarApus();
  }
  cargarApus(){
    this.cargando = true;
    this.apuService.cargarApus()
    .subscribe(resp=>{
      this.apus = resp;
    this.cargando = false;

    })

  }


}
