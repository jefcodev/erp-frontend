import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DetalleAsiento } from '../../../models/contabilidad/detalle-asiento.model';
import { DetalleAsientoU } from '../../../models/contabilidad/detalle-asiento.model';
import { DetalleAsientoService } from 'src/app/services/contabilidad/detalle-asiento.service';

@Component({
  selector: 'app-detalle-asiento',
  templateUrl: './detalle-asiento.component.html',
  styles: [
  ]
})
export class DetalleAsientoComponent implements OnInit {
  public detalle_asientos: DetalleAsiento[] = [];
  public detalleAsientoSeleccionado: DetalleAsientoU;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  detalleAsientoForm: FormGroup;
  detalleAsientoFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private detalleAsientoService: DetalleAsientoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.detalleAsientoForm = this.fb.group({
      id_detalle_asiento: [''], // Add this line to include the 'id_detalle_asiento' field
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.detalleAsientoFormU = this.fb.group({
      //id_detalle_asiento: [''], // Add this line to include the 'id_detalle_asiento' field
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.cargarDetalleAsientos();
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
    })

  }

  cargarDetalleAsientos() {
    this.detalleAsientoService.loadDetalleAsientos()
      .subscribe(({ detalle_asientos }) => {
        this.detalle_asientos = detalle_asientos;
      })
  }

  cargarDetalleAsientoPorId(id_detalle_asiento: any) {
    this.detalleAsientoService.loadDetalleAsientoById(id_detalle_asiento)
      .subscribe(detalle_asiento => {
        const { codigo, descripcion} = detalle_asiento[0];
        this.detalleAsientoSeleccionado = detalle_asiento[0];
        this.detalleAsientoFormU.setValue({ codigo, descripcion })
        //this.detalleAsientoFormU.setValue({ descripcion })
      })
  }

  crearDetalleAsiento() {
    this.formSubmitted = true;
    if (this.detalleAsientoForm.invalid) {
      return;
    }
    // realizar posteo
    this.detalleAsientoService.createDetalleAsiento(this.detalleAsientoForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'DetalleAsiento creado',
          text: 'DetalleAsiento se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el detalleAsiento.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarDetalleAsiento() {
    if (this.detalleAsientoFormU.invalid) {
      return;
    }
    const data = {
      ...this.detalleAsientoFormU.value,
      id_detalle_asiento: this.detalleAsientoSeleccionado.id_detalle_asiento
    }

    // realizar posteo
    this.detalleAsientoService.updateDetalleAsiento(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'DetalleAsiento actualizado',
          text: 'DetalleAsiento se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/detalle-asientos`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el detalle asiento.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/detalle-asientos']);
    });

  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

}
