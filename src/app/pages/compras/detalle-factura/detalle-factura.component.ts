import { Component, OnInit } from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { DetalleFactura } from 'src/app/models/compra/detalle-factura.model';
import { DetalleFacturaService } from 'src/app/services/compras/detalle-factura.service';

@Component({
  selector: 'app-detalle-factura',
  templateUrl: './detalle-factura.component.html',
  styles: [
  ]
})
export class DetalleFacturaComponent implements OnInit {

  public detalle_facturas: DetalleFactura[] = [];
  public detalleFacturaSeleccionado: DetalleFactura;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  detalleFacturaForm: FormGroup;
  detalleFacturaFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private detalleFacturaService: DetalleFacturaService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.detalleFacturaForm = this.fb.group({
      identificacion: ['1727671628', [Validators.required, Validators.minLength(3)]],
      nombre: ['Edison', [Validators.required, Validators.minLength(3)]],
      apellido: ['Pinanjota', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['Systemcode', [Validators.required, Validators.minLength(3)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['eepinanjotac@utn.edu.ec', [Validators.required, Validators.email]],
    });

    this.detalleFacturaFormU = this.fb.group({
      identificacion: ['', [Validators.required, Validators.minLength(3)]],
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      apellido: ['', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.cargarDetalleFacturas();
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

  cargarDetalleFacturas() {
    this.detalleFacturaService.loadDetalleFacturas()
      .subscribe(({ detalle_facturas }) => {
        this.detalle_facturas = detalle_facturas;
        console.log("Test (detalle_factura.component.ts) - cargarDetalleFacturas()")
        console.log(detalle_facturas)
      })
  }

  /*
  cargarDetalleFacturaPorId(id_detalle_factura_compra: any) {
    this.detalleFacturaService.loadDetalleFacturaById(id_detalle_factura_compra)
      .subscribe(detalle_factura => {
        const { identificacion, nombre, apellido, nombre_comercial, direccion, telefono, email } = detalle_factura[0];
        this.detalleFacturaSeleccionado = detalle_factura[0];
        console.log("detalle_factura")
        console.log(detalle_factura)
        console.log("detalle_factura[0]")
        console.log(detalle_factura[0])
        console.log("identficacion")
        console.log(identificacion)
        console.log("nombre")
        console.log(nombre)
        this.detalleFacturaFormU.setValue({ identificacion, nombre, apellido, nombre_comercial, direccion, telefono, email })
      })
  }
  */

  /*
    crearDetalleFactura() {
      this.formSubmitted = true;
      console.log(this.detalleFacturaForm.value)
      if (this.detalleFacturaForm.invalid) {
        return;
      }
      // realizar posteo
      this.detalleFacturaService.createDetalleFactura(this.detalleFacturaForm.value)
        .subscribe(res => {
          Swal.fire({
            icon: 'success',
            title: 'DetalleFactura creado',
            text: 'DetalleFactura se ha creado correctamente.',
            showConfirmButton: false,
            timer: 1500
          });
          this.recargarComponente();
          this.cerrarModal();
        }, (err) => {
          // En caso de error
          let errorMessage = 'Se produjo un error al crear el detalle_factura.';
          if (err.error && err.error.msg) {
            errorMessage = err.error.msg;
          }
          Swal.fire('Error', err.error.msg, 'error');
        });
      this.recargarComponente();
    }
  */
  /*
  actualizarDetalleFactura() {
    console.log("Actualizar: actualizarDetalleFactura() { ")
    //console.log(detalle_factura.id_detalle_factura_compra)
    if (this.detalleFacturaFormU.invalid) {
      return;
    }
    const data = {
      ...this.detalleFacturaFormU.value,
      id_detalle_factura_compra: this.detalleFacturaSeleccionado.id_detalle_factura_compra
    }

    console.log("UNO---updateDetalleFactura()")
    console.log(data)

    // realizar posteo
    this.detalleFacturaService.updateDetalleFactura(data)
      .subscribe(res => {
        console.log("DOS---updateDetalleFactura()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'DetalleFactura actualizado',
          text: 'DetalleFactura se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/detalle-facturas`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el detalle_factura.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }
  */
  /*
  borrarDetalleFactura(detalle_factura: DetalleFactura) {
    console.log("Borrar:   borrarDetalleFactura(detalle_factura: DetalleFactura) {")
    console.log(detalle_factura.id_detalle_factura_compra)
    Swal.fire({
      title: '¿Borrar DetalleFactura?',
      text: `Estas a punto de borrar a ${detalle_factura.nombre} ${detalle_factura.apellido}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.detalleFacturaService.deleteDetalleFactura(detalle_factura.id_detalle_factura_compra)
          .subscribe(resp => {
            this.cargarDetalleFacturas();
            
            Swal.fire({
              icon: 'success',
              title: 'DetalleFactura borrado',
              text: `${detalle_factura.nombre} ${detalle_factura.apellido} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el detalle_factura.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }
  */

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/detalle-facturas']);
    });

  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }
  
    agregarDetalleFactura(detalle_factura: any) {
      console.log('XD--------')
      console.log(detalle_factura.identficacion)
      this.detalle_facturas.push(detalle_factura);
    }

}
