import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { LibroMayor, SumaDebeHaber } from '../../../models/contabilidad/libro-mayor.model';
import { LibroMayorService } from 'src/app/services/contabilidad/libro-mayor.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-libro-mayor',
  templateUrl: './libro-mayor.component.html',
  styles: [
  ]
})
export class LibroMayorComponent implements OnInit {
  public libro_mayor: LibroMayor[] = [];
  //public suma_debe_haber: SumaDebeHaber;
  public suma_debe_haber: SumaDebeHaber[] = [];
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  libroMayorForm: FormGroup;

  totalDebe: number = 0;
  totalHaber: number = 0;

  constructor(
    private fb: FormBuilder,
    private libroMayorService: LibroMayorService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.cargarLibroMayor();
    this.cargarSumaDebeHaber();
  }

  cargarLibroMayor() {
    this.libroMayorService.loadLibroMayor()
      .subscribe(({ libro_mayor }) => {
        this.libro_mayor = libro_mayor;
        console.log("Test (asiento.component.ts) - cargarLibroMayor()")
        console.log(libro_mayor)
      })
  }

  cargarSumaDebeHaber() {
    this.libroMayorService.loadSumaDebeHaber()
      .subscribe(({ suma_debe_haber }) => {
        this.suma_debe_haber = suma_debe_haber;
        console.log("Suma debe y haber")
        console.log(suma_debe_haber)
      })
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/libro-mayor']);
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
