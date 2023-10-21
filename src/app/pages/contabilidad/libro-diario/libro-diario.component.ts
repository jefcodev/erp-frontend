import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LibroDiario, SumaDebeHaber } from '../../../models/contabilidad/libro-diario.model';
import { LibroDiarioService } from 'src/app/services/contabilidad/libro-diario.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-libro-diario',
  templateUrl: './libro-diario.component.html',
  styles: [
  ]
})
export class LibroDiarioComponent implements OnInit {
  public libro_diario: LibroDiario[] = [];
  //public suma_debe_haber: SumaDebeHaber;
  public suma_debe_haber: SumaDebeHaber[] = [];
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  libroDiarioForm: FormGroup;

  totalDebe: number = 0;
  totalHaber: number = 0;

  constructor(
    private fb: FormBuilder,
    private libroDiarioService: LibroDiarioService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.cargarLibroDiario();
    this.cargarSumaDebeHaber();
  }

  cargarLibroDiario() {
    this.libroDiarioService.loadLibroDiario()
      .subscribe(({ libro_diario }) => {
        this.libro_diario = libro_diario;
        console.log("Test (asiento.component.ts) - cargarLibroDiario()")
        console.log(libro_diario)
      })
  }

  cargarSumaDebeHaber() {
    this.libroDiarioService.loadSumaDebeHaber()
      .subscribe(({ suma_debe_haber }) => {
        this.suma_debe_haber = suma_debe_haber;
        console.log("Suma debe y haber")
        console.log(suma_debe_haber)
      })
  }

  //forma directa de sacar los valores de deb y haber
  /*cargarSumaDebeHaber2() {
    this.libroDiarioService.loadSumaDebeHaber()
      .subscribe(response => {
        for (const suma of response.suma_debe_haber) {
          console.log("----------------------------SUMAAAAA");
          console.log("Total debe:", suma.total_debe);
          console.log("Total haber:", suma.total_haber);
        }
      });
  }*/

  /*
    calcularSumaDebe(): number {
      let sumaDebe = 0;
      for (let libro of this.libro_diario) {
        sumaDebe += libro.debe;
      }
      return 67.67;
    }
  
    calcularSumaHaber(): number {
      let sumaHaber = 0;
      for (let libro of this.libro_diario) {
        sumaHaber += libro.haber;
      }
      return 89.90;
    }
  */

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/libro-diario']);
    });

  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
    })
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

}
