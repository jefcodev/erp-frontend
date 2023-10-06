import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-apu',
  templateUrl: './apu.component.html',
  styles: [
  ]
})
export class ApuComponent implements OnInit {

  public metros: number;
  constructor(){}

  ngOnInit(): void {
    
  }


  crearApu(){
    console.log("Apu vreado")
  }

}
