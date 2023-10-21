import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { BalanceGeneral, SumaAPP } from 'src/app/models/contabilidad/balance-general';
import { BalanceGeneralService } from 'src/app/services/contabilidad/balance-general.service';
import { EstadoResultadoService } from 'src/app/services/contabilidad/estado-resultado.service';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-balance-general',
  templateUrl: './balance-general.component.html',
  styles: [
  ]
})
export class BalanceGeneralComponent implements OnInit {
  public balance_general: BalanceGeneral[] = [];
  public suma_app: SumaAPP[] = [];
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  balanceGeneralForm: FormGroup;
  total_activo: number;
  total_pasivo: number;
  patrimonio: number;
  resultado_ejercicio: number;
  total_patrimonio: number;
  pasivo_patrimonio: number;

  //estado de resultado
  total_ingreso: number;
  total_egreso: number;
  total_gasto: number;
  utilidad_bruta: number;
  utilidad_neta: number;

  constructor(
    private fb: FormBuilder,
    private balanceGeneralService: BalanceGeneralService,
    private estadoResultadoService: EstadoResultadoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.cargarBalanceGeneral();
    this.cargarSumaIEG();
    this.cargarSumaAPP();
  }

  cargarBalanceGeneral() {
    this.balanceGeneralService.loadBalanceGeneral()
      .subscribe(({ balance_general }) => {
        this.balance_general = balance_general;
        console.log("Test (asiento.component.ts) - cargarLibroDiario()")
        console.log(balance_general)
      })
  }

  /*cargarSumaAPP() {
    this.balanceGeneralService.loadSumaAPP()
      .subscribe(({ suma_app }) => {
        this.suma_app = suma_app;
        console.log("Suma Activo, Pasivo, Patrimonio")
        console.log(suma_app)
        this.activo = suma_app[0];
        this.pasivo = suma_app[1];
        this.patrimonio = suma_app[2];
      })
  }*/

  cargarSumaAPP() {
    this.balanceGeneralService.loadSumaAPP()
      .subscribe(({ suma_app }) => {
        console.log("Suma Activo, Pasivo, Patrimonio");
        console.log(suma_app);
        const suma = suma_app[0];
        this.total_activo = parseFloat(suma.activo);
        this.total_pasivo = parseFloat(suma.pasivo);
        this.patrimonio = parseFloat(suma.patrimonio);
        this.total_patrimonio =  this.patrimonio + this.resultado_ejercicio;
        this.pasivo_patrimonio = this.total_pasivo + this.total_patrimonio;
        console.log("Total Activo", this.total_activo);
        console.log("Total Pasivo", this.total_pasivo);
        console.log("Patrimonio", this.patrimonio);
        console.log("Resultado Ejercicio", this.resultado_ejercicio);
        console.log("Total Patrimonio", this.total_patrimonio);
        console.log("Pasivo + Patrimonio", this.pasivo_patrimonio);
      });
  }
  cargarSumaIEG() {
    this.estadoResultadoService.loadSumaIEG()
      .subscribe(({ suma_ieg }) => {
        console.log("Suma Ingreso, Egreso, Gasto");
        console.log(suma_ieg);
        const suma = suma_ieg[0];
        this.total_ingreso = parseFloat(suma.ingreso);
        this.total_egreso = parseFloat(suma.egreso);
        this.total_gasto = parseFloat(suma.gasto);
        this.utilidad_bruta = this.total_ingreso + this.total_egreso;
        this.utilidad_neta = this.utilidad_bruta + this.total_gasto;
        console.log("Ingreso", this.total_ingreso);
        console.log("Egreso", this.total_egreso);
        console.log("Gasto", this.total_gasto);
        console.log("Utilidad Bruta", this.utilidad_bruta);
        console.log("Utilidad neta", this.utilidad_neta);
        this.resultado_ejercicio = this.utilidad_neta;
      });
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/balance-general']);
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
