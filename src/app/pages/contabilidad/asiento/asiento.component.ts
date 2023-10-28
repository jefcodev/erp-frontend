import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Asiento } from '../../../models/contabilidad/asiento.model';
import { AsientoService } from 'src/app/services/contabilidad/asiento.service';
import { DetalleAsientoService } from 'src/app/services/contabilidad/detalle-asiento.service';
import { DetalleAsiento } from '../../../models/contabilidad/detalle-asiento.model';
import { formatDate } from '@angular/common';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';
import { Cuenta } from 'src/app/models/contabilidad/cuenta.model';

// Agrega la interfaz o clase para el detalle del asiento
interface DetalleAsiento2 {
  cuenta: number;
  descripcion: string;
  documentod: string;
  debe: number;
  haber: number;
}

@Component({
  selector: 'app-asiento',
  templateUrl: './asiento.component.html',
  styles: [
  ]
})

export class AsientoComponent implements OnInit {
  public asientos: Asiento[] = [];
  public id_asiento: number = 1;
  public cuentas: Cuenta[] = [];
  public asientoSeleccionado: Asiento;
  public formSubmitted = false;
  public ocultarModal: boolean = true;
  public detalleAsiento: DetalleAsiento;
  asientoForm: FormGroup;
  detalleForm: FormGroup;
  asientoFormU: FormGroup;
  ultimoId: number;
  fechaActual: string;
  numeroAsiento: number;
  // Agrega una matriz para almacenar los detalles del asiento
  detalleAsiento2: DetalleAsiento2[] = [];

  totalDebe: number = 0;
  totalHaber: number = 0;

  constructor(
    private fb: FormBuilder,
    private asientoService: AsientoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private cuentaService: CuentaService,
    private detalleAsientoService: DetalleAsientoService,
  ) {
    this.asientoForm = this.fb.group({
      //id_asiento: [''], // Add this line to include the 'id_asiento' field
      //id_asiento: this.id_asiento, // Add this line to include the 'id_asiento' field
      //fecha: ['', [Validators.required, Validators.minLength(3)]],
      referencia: ['PAGO A PROVEEDORES', [Validators.required, Validators.minLength(1)]],
      documento: ['01-05-2023-00003', [Validators.required, Validators.minLength(1)]],
      observacion: ['NINGUNA', [Validators.required, Validators.minLength(1)]],
    });

    this.detalleForm = this.fb.group({
      detalles: this.fb.array([])
    });

    this.asientoFormU = this.fb.group({
      id_asiento: ['1'], // Add this line to include the 'id_asiento' field
      //fecha: ['', [Validators.required, Validators.minLength(3)]],
      referencia: ['', [Validators.required, Validators.minLength(1)]],
      documento: ['', [Validators.required, Validators.minLength(1)]],
      observacion: ['', [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.cargarAsientos();
    this.cargarCuentas();
    const fechaActual = new Date();
    this.fechaActual = formatDate(fechaActual, 'd-M-yyyy', 'en-US', 'UTC-5');
    //console.log("fechaActual");
    //console.log(fechaActual);
  }

  cargarAsientos() {
    this.asientoService.loadAsientos()
      .subscribe(({ asientos }) => {
        this.asientos = asientos;
        console.log("Test (asiento.component.ts) - cargarAsientos()")
        console.log(asientos)
      })
  }

  cargarCuentas() {
    this.cuentaService.loadCuentas()
      .subscribe(({ cuentas }) => {
        this.cuentas = cuentas;
        console.log("Test (cuenta.component.ts) - cargarCuentas()")
        console.log(cuentas)
      })
  }

  cargarAsientoPorId(id_asiento: any) {
    this.asientoService.loadAsientoById(id_asiento)
      .subscribe(asiento => {
        const { referencia, documento, observacion } = asiento[0];
        this.asientoSeleccionado = asiento[0];
        this.asientoFormU.setValue({ referencia, documento, observacion })
      })
  }

  /*crearAsiento() {
    this.formSubmitted = true;
    console.log(this.asientoForm.value)
    if (this.asientoForm.invalid) {
      return;
    }

    // realizar posteo
    this.asientoService.createAsiento(this.asientoForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Asiento creado',
          text: 'Asiento se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el asiento.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }
*/

  crearAsiento2() {
    this.formSubmitted = true;
    console.log('CREAR ASIENTO 2');
    console.log(this.asientoForm.value);
    if (this.asientoForm.invalid) {
      return;
    }

    console.log('LLEGA');
    this.crearAsiento2_aux()
    console.log('SALE');

    // Realizar posteo del asiento principal
    this.asientoService.createAsiento(this.asientoForm.value).subscribe(
      (res: any) => {
        const asientoId = res.id_asiento; // Obtener el ID del asiento guardado
        console.log('ASIENTOID')
        console.log(asientoId)
        console.log('DETALLES ASIENTO 222222')
        console.log(this.detalleAsiento2)
        // Crear los detalles y asociarlos al asiento
        const detalles = [];
        for (const detalle2 of this.detalleAsiento2) {
          const nuevoDetalle: DetalleAsiento = {
            id_asiento: asientoId,
            id_cuenta: detalle2.cuenta,
            descripcion: detalle2.descripcion,
            documentod: detalle2.documentod,
            debe: detalle2.debe,
            haber: detalle2.haber
          };
          detalles.push(nuevoDetalle);
        }
        console.log('DETALLES CON ID_ASIENTO')
        console.log(detalles)
        this.detalleAsientoService.createDetalleAsiento2(detalles).subscribe(
          () => {
            Swal.fire({
              icon: 'success',
              title: 'Asiento y detalles creados',
              text: 'El asiento y los detalles se han creado correctamente.',
              showConfirmButton: false,
              timer: 1500
            });
            this.recargarComponente();
            this.cerrarModal();
          },
          (err) => {
            // En caso de error en la creación del asiento principal
            let errorMessage = 'Se produjo un error al crear el asiento.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
        );

        this.recargarComponente();
      })
  }
  
  crearAsiento2_aux() {

    // Obtener los valores del formulario de detalles
    const formValues = this.detalleForm.getRawValue();
    console.log('formValues -----------');
    console.log(formValues);

    // Obtener el número de detalles
    const numDetalles2 = Object.keys(formValues).filter(key => key.startsWith('cuenta_')).length;
    console.log('numDetalles 2 -----------');
    console.log(numDetalles2);

    // Reiniciar el arreglo detalleAsiento2
    this.detalleAsiento2 = [];

    for (let i = 0; i < numDetalles2; i++) {
      const nuevoDetalle: DetalleAsiento2 = {
        cuenta: formValues[`cuenta_${i}`],
        descripcion: formValues[`descripcion_${i}`],
        documentod: formValues[`documentod_${i}`],
        debe: formValues[`debe_${i}`],
        haber: formValues[`haber_${i}`]
      };

      this.detalleAsiento2.push(nuevoDetalle);
    }

    console.log('detalleAsiento2 -----------');
    console.log(this.detalleAsiento2);
    // Limpiar el formulario de detalles
    //this.detalleForm.reset();
  }

  agregarDetalleAsiento2(): void {
    if (this.detalleForm.invalid) {
      console.log('RETURN')
      return;
    }

    const nuevoDetalle2: DetalleAsiento2 = {
      cuenta: null,
      descripcion: '',
      documentod: '',
      debe: null,
      haber: null
    };

    // Crear instancias de FormControl para cada propiedad del detalle
    const cuentaControl = new FormControl(nuevoDetalle2.cuenta);
    const descripcionControl = new FormControl(nuevoDetalle2.descripcion);
    const documentodControl = new FormControl(nuevoDetalle2.documentod);
    const debeControl = new FormControl(nuevoDetalle2.debe);
    const haberControl = new FormControl(nuevoDetalle2.haber);

    // Agregar los controles al formulario
    this.detalleForm.addControl('cuenta_' + this.detalleAsiento2.length, cuentaControl);
    this.detalleForm.addControl('descripcion_' + this.detalleAsiento2.length, descripcionControl);
    this.detalleForm.addControl('documentod_' + this.detalleAsiento2.length, documentodControl);
    this.detalleForm.addControl('debe_' + this.detalleAsiento2.length, debeControl);
    this.detalleForm.addControl('haber_' + this.detalleAsiento2.length, haberControl);

    nuevoDetalle2.cuenta = cuentaControl.value;
    nuevoDetalle2.descripcion = descripcionControl.value;
    nuevoDetalle2.documentod = documentodControl.value;
    nuevoDetalle2.debe = debeControl.value;
    nuevoDetalle2.haber = haberControl.value;
    // Agregar el detalle al arreglo
    this.detalleAsiento2.push(nuevoDetalle2);
    console.log('DETALLE ----------- detalleAsiento2')
    console.log(this.detalleAsiento2)
    // Calcular los totales
    this.calcularTotales();
  }

  // Método para eliminar un detalle del asiento
  eliminarDetalle(index: number): void {
    this.detalleAsiento2.splice(index, 1);
    // Calcular los totales
    this.calcularTotales();
  }

  actualizarAsiento() {
    if (this.asientoFormU.invalid) {
      return;
    }
    const data = {
      ...this.asientoFormU.value,
      id_asiento: this.asientoSeleccionado.id_asiento
    }

    // realizar posteo
    this.asientoService.updateAsiento(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Asiento actualizado',
          text: 'Asiento se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/asientos`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el asiento.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarAsiento(asiento: Asiento) {
    Swal.fire({
      title: '¿Borrar Asiento?',
      text: `Estas a punto de borrar a ${asiento.referencia}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.asientoService.deleteAsiento(asiento.id_asiento)
          .subscribe(resp => {
            this.cargarAsientos();
            Swal.fire({
              icon: 'success',
              title: 'Asiento borrado',
              text: `${asiento.referencia} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el asiento.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  obtenerUltimoId(): number {
    if (this.asientos.length > 0) {
      return (this.asientos[this.asientos.length - 1].id_asiento) + 1;
    }
    return 0; // o cualquier valor predeterminado
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/asientos']);
    });

  }

  abrirModal() {
    this.ocultarModal = false;
    this.activatedRoute.params.subscribe(params => {
    })
  }

  cerrarModal() {
    this.ocultarModal = true;
  }

  calcularTotales(): void {
    this.totalDebe = 0;
    this.totalHaber = 0;

    for (const detalle of this.detalleAsiento2) {
      this.totalDebe += detalle.debe;
      this.totalHaber += detalle.haber;
    }
    console.log('this.totalDebe')
    console.log(this.totalDebe)
    console.log('this.totalHaber')
    console.log(this.totalHaber)
  }

  public detalle_asientos: DetalleAsiento[] = [];


  cargarDetalleAsientos(id_asiento: any) {
    this.detalleAsientoService.loadDetalleAsientoByAsiento(id_asiento)
      .subscribe(({ detalle_asientos }) => {
        this.detalle_asientos = detalle_asientos;
      })
  }



}
