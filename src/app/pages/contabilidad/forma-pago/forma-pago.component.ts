import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { FormaPago } from '../../../models/contabilidad/forma-pago.model';
import { FormaPagoService } from 'src/app/services/contabilidad/forma-pago.service';

@Component({
  selector: 'app-forma-pago',
  templateUrl: './forma-pago.component.html',
  styles: [
  ]
})
export class FormaPagoComponent implements OnInit {
  public formas_pago: FormaPago[] = [];
  public formaPagoSeleccionado: FormaPago;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  formaPagoForm: FormGroup;
  formaPagoFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private formaPagoService: FormaPagoService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.formaPagoForm = this.fb.group({
      codigo: ['12', [Validators.required, Validators.minLength(2)]],
      descripcion: ['Edison', [Validators.required, Validators.minLength(3)]],
    });

    this.formaPagoFormU = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(2)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    this.cargarFormasPago();
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
      console.log(params)
    })

  }

  cargarFormasPago() {
    this.formaPagoService.loadFormasPago()
      .subscribe(({ formas_pago }) => {
        this.formas_pago = formas_pago;
        console.log("Test (forma_pago.component.ts) - cargarFormasPago()")
        console.log(formas_pago)
      })
  }

  cargarFormaPagoPorId(id_forma_pago: any) {
    console.log("cargarFormaPagoPorId(id_forma_pago: any)")
    console.log(id_forma_pago)
    this.formaPagoService.loadFormaPagoById(id_forma_pago)
      .subscribe(forma_pago => {
        const { codigo, descripcion } = forma_pago[0];
        this.formaPagoSeleccionado = forma_pago[0];
        console.log("forma_pago")
        console.log(forma_pago)
        console.log("forma_pago[0]")
        console.log(forma_pago[0])
        console.log("codigo")
        console.log(codigo)
        console.log("descripcion")
        console.log(descripcion)
        this.formaPagoFormU.setValue({ codigo, descripcion })
      })
  }

  crearFormaPago() {
    this.formSubmitted = true;
    console.log("crearFormaPago() {")
    console.log(this.formaPagoForm.value)
    if (this.formaPagoForm.invalid) {
      console.log("entras")
      return;
    }
    // realizar posteo
    this.formaPagoService.createFormaPago(this.formaPagoForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago creado',
          text: 'Forma de Pago se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear la forma de pago.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarFormaPago() {
    console.log("Actualizar: actualizarFormaPago() { ")
    if (this.formaPagoFormU.invalid) {
      return;
    }
    const data = {
      ...this.formaPagoFormU.value,
      id_forma_pago: this.formaPagoSeleccionado.id_forma_pago
    }

    console.log("UNO---updateFormaPago()")
    console.log(data)

    // realizar posteo
    this.formaPagoService.updateFormaPago(data)
      .subscribe(res => {
        console.log("DOS---updateFormaPago()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'Forma de Pago actualizado',
          text: 'Forma de Pago se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar la forma de pago.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarFormaPago(forma_pago: FormaPago) {
    console.log("Borrar:   borrarFormaPago(forma_pago: FormaPago) {")
    console.log(forma_pago.id_forma_pago)
    Swal.fire({
      title: '¿Borrar Forma de Pago?',
      text: `Estas a punto de borrar a ${forma_pago.codigo} ${forma_pago.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.formaPagoService.deleteFormaPago(forma_pago.id_forma_pago)
          .subscribe(resp => {
            this.cargarFormasPago();
            Swal.fire({
              icon: 'success',
              title: 'Forma de Pago borrado',
              text: `${forma_pago.codigo} ${forma_pago.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar la forma de pago.';
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
      this.router.navigate(['/dashboard/formas-pago']);
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
