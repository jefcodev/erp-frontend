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

  public id_apu : number = 4;
  public apus : ApuDetalle [] = [];
  public cargando: boolean = false;
  public capitulo : Apu[]=[];

  constructor(
    private apuService: ApuService
  ){

  }
  ngOnInit(): void {

      this.cargarApus();
      console.log(this.cargarApus());
  }
 


  cargarApus(){
    this.apuService.cargarApus().subscribe
      (apu =>{
        this.capitulo = apu;
      })
  }

  cargarApuId() {
    this.apuService.cargarDetalleApu(this.id_apu)
      .subscribe(capitulo => {
        this.apus = capitulo;
        console.log('APU', this.apus); 
      })
  };
  


}
