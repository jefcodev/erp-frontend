import { Component, OnInit } from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { TarifaIVA } from '../../../models/contabilidad/tarifa-iva.model';
import { TarifaIVAService } from 'src/app/services/contabilidad/tarifa-iva.service';

@Component({
  selector: 'app-tarifa-iva',
  templateUrl: './tarifa-iva.component.html',
  styles: [
  ]
})

export class TarifaIVAComponent implements OnInit {

  @Output() tarifaIVACreado = new EventEmitter<any>();

  public tarifas_iva: TarifaIVA[] = [];
  public tarifaIVASeleccionado: TarifaIVA;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  tarifaIVAForm: FormGroup;
  tarifaIVAFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private tarifaIVAService: TarifaIVAService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.tarifaIVAForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(0)]],
      descripcion: ['', [Validators.required, Validators.minLength(0)]],
      porcentaje: ['', [Validators.required, Validators.minLength(0)]],
    });

    this.tarifaIVAFormU = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(0)]],
      descripcion: ['', [Validators.required, Validators.minLength(0)]],
      porcentaje: ['', [Validators.required, Validators.minLength(0)]],
    });
  }

  ngOnInit(): void {
    this.cargarTarifasIVA();
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
    })

  }

  cargarTarifasIVA() {
    this.tarifaIVAService.loadTarifasIVA()
      .subscribe(({ tarifas_iva }) => {
        this.tarifas_iva = tarifas_iva;
      })
  }

  cargarTarifaIVAPorId(id_tarifa_iva: any) {
    this.tarifaIVAService.loadTarifaIVAById(id_tarifa_iva)
      .subscribe(tarifa_iva => {
        const { codigo, descripcion, porcentaje } = tarifa_iva[0];
        this.tarifaIVASeleccionado = tarifa_iva[0];
        this.tarifaIVAFormU.setValue({ codigo, descripcion, porcentaje })
      })
  }

  crearTarifaIVA() {
    this.formSubmitted = true;
    if (this.tarifaIVAForm.invalid) {
      return;
    }
    // realizar posteo
    this.tarifaIVAService.createTarifaIVA(this.tarifaIVAForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Tarifa IVA creado',
          text: 'Tarifa IVA se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el tarifa IVA.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarTarifaIVA() {
    if (this.tarifaIVAFormU.invalid) {
      return;
    }
    const data = {
      ...this.tarifaIVAFormU.value,
      id_tarifa_iva: this.tarifaIVASeleccionado.id_tarifa_iva
    }

    // realizar posteo
    this.tarifaIVAService.updateTarifaIVA(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Tarifa IVA actualizado',
          text: 'Tarifa IVA se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/tarifas_iva`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el tarifa IVA.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarTarifaIVA(tarifa_iva: TarifaIVA) {
    Swal.fire({
      title: '¿Borrar Tarifa IVA?',
      text: `Estas a punto de borrar a ${tarifa_iva.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.tarifaIVAService.deleteTarifaIVA(tarifa_iva.id_tarifa_iva)
          .subscribe(resp => {
            this.cargarTarifasIVA();
            /*Swal.fire(
              'TarifaIVA borrado',
              `${tarifa_iva.nombre} ha sido borrado correctamente.`,
              'success'              
            );*/
            Swal.fire({
              icon: 'success',
              title: 'Tarifa IVA borrado',
              text: `${tarifa_iva.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el tarifa IVA.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/tarifas-iva']);
    });

  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  agregarTarifaIVA(tarifa_iva: any) {
    this.tarifas_iva.push(tarifa_iva);
  }

}
