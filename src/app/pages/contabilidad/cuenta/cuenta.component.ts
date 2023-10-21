import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Cuenta } from '../../../models/contabilidad/cuenta.model';
import { CuentaService } from 'src/app/services/contabilidad/cuenta.service';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.component.html',
  styles: [
  ]
})
export class CuentaComponent implements OnInit {
  public cuentas: Cuenta[] = [];
  public cuentaSeleccionado: Cuenta;
  public formSubmitted = false;
  //public ocultarModalCrear: boolean = true;
  //public ocultarModalUpdate: boolean = true;
  public ocultarModal: boolean = true;

  cuentaForm: FormGroup;
  cuentaFormU: FormGroup;

  /*currentPage: number = 1;
  totalDatos: number;
  elementosPorPagina: number = 10; // Puedes ajustar este valor según tus necesidades
  totalPaginas: number;
  paginas: number[] = [];
  
  actualizarPaginas() {
    this.paginas = [];
    const cantidadPaginas = Math.ceil(this.totalDatos / this.elementosPorPagina);
    for (let i = 1; i <= cantidadPaginas; i++) {
      this.paginas.push(i);
    }
  }*/

  constructor(
    private fb: FormBuilder,
    private cuentaService: CuentaService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.cuentaForm = this.fb.group({
      id_cuenta: [''], // Add this line to include the 'id_cuenta' field
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      cuenta_padre: ['', [Validators.required, Validators.minLength(3)]],
    });

    this.cuentaFormU = this.fb.group({
      //id_cuenta: [''], // Add this line to include the 'id_cuenta' field
      codigo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: ['', [Validators.required, Validators.minLength(3)]],
      cuenta_padre: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  ngOnInit(): void {
    /*
    // Obtener la cantidad total de datos desde tu backend o donde sea necesario
    this.totalDatos = obtenerCantidadTotalDatos();
    // Calcular la cantidad total de páginas
    this.totalPaginas = Math.ceil(this.totalDatos / this.elementosPorPagina);

    // Generar el arreglo de páginas
    this.paginas = Array(this.totalPaginas).fill(0).map((x, i) => i);*/
    this.cargarCuentas();
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

  /*abrirModalCreate() {
    this.ocultarModalUpdate = false;
  }*/

  cargarCuentas() {
    this.cuentaService.loadCuentas()
      .subscribe(({ cuentas }) => {
        this.cuentas = cuentas;
        console.log("Test (cuenta.component.ts) - cargarCuentas()")
        console.log(cuentas)
      })
  }

  cargarCuentaPorId(id_cuenta: any) {
    //cargarCuenta(cuenta: Cuenta) {
    console.log("COMPONENT - cargarCuentaPorId(id_cuenta: any)")
    //this.cargarCuentaPorId(id_cuenta)
    console.log('id_cuenta')
    console.log(id_cuenta)
    //this.cuentaService.cargarCuentaById(cuenta.id_cuenta)
    this.cuentaService.loadCuentaById(id_cuenta)
      .subscribe(cuenta => {
        const { codigo, descripcion, cuenta_padre } = cuenta[0];
        this.cuentaSeleccionado = cuenta[0];
        console.log("cuenta")
        console.log(cuenta)
        console.log("cuenta[0]")
        console.log(cuenta[0])
        console.log("codigo")
        console.log(codigo)
        console.log("descripcion")
        console.log(descripcion)
        console.log("cuenta_padre")
        console.log(cuenta_padre)
        this.cuentaFormU.setValue({ codigo, descripcion, cuenta_padre })
        //this.cuentaFormU.setValue({ descripcion })
      })
  }

  cargarCodigo(codigo: any) {
    console.log("COMPONENT - cargarCodigo(codigo: any) { ")
    console.log("codigo entra")
    console.log(codigo)
    this.cuentaService.loadCuentaByCodigo(codigo)
      .subscribe(cuenta => {
        console.log("CUENTA by codigo")
        console.log(cuenta)
        if (Array.isArray(cuenta) && cuenta.length>0) {
          const { codigo, descripcion, cuenta_padre } = cuenta[0];
          console.log("CODIGO SALE")
          console.log(codigo)

          const parts = codigo.split(".");
          const lastPart = parseInt(parts[parts.length - 1], 10);
          const newLastPart = lastPart + 1;

          parts[parts.length - 1] = newLastPart.toString();

          const newCodigo = parts.join(".");
          console.log("NEW CODIGO");
          console.log(newCodigo);

          this.cuentaForm.controls['codigo'].setValue(newCodigo);
        } else {
          console.error("No se encontró ninguna cuenta con el código especificado.");
          this.cuentaForm.controls['codigo'].setValue(codigo+".1");
        }

      }, (err) => {
        console.error("Error al cargar la cuenta:", err);

        // En caso de error
        let errorMessage = 'Se produjo un error al cargar la cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');

      });
  }

  cargarCuentaPadre(cuentaId: any) {
    console.log("COMPONENT - cargarCuentaPadre(cuentaId: any) {")
    const value = (event.target as HTMLSelectElement).value;
    console.log("VALUE PADRE")
    console.log(value)
    this.cuentaService.loadCuentaById(value)
      .subscribe(cuenta => {
        const { codigo, descripcion, cuenta_padre } = cuenta[0];
        console.log("CUENTA_PADRE")
        console.log(cuenta_padre)
        console.log("CODIGO")
        console.log(codigo)
        console.log("DESCRIPCION_PADRE")
        console.log(descripcion)
        //this.codigoSelected = codigo
        this.cuentaForm.controls['cuenta_padre'].setValue(codigo);
        this.cargarCodigo(codigo)
      });
  }

  crearCuenta() {
    this.formSubmitted = true;
    console.log(this.cuentaForm.value)
    if (this.cuentaForm.invalid) {
      return;
    }
    // realizar posteo
    this.cuentaService.createCuenta(this.cuentaForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cuenta creado',
          text: 'Cuenta se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarCuenta() {
    console.log("Actualizar: actualizarCuenta() { ")
    //console.log(cuenta.id_cuenta)
    if (this.cuentaFormU.invalid) {
      return;
    }
    const data = {
      ...this.cuentaFormU.value,
      id_cuenta: this.cuentaSeleccionado.id_cuenta
    }

    console.log("UNO---updateCuenta()")
    console.log(data)

    // realizar posteo
    this.cuentaService.updateCuenta(data)
      .subscribe(res => {
        console.log("DOS---updateCuenta()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'Cuenta actualizado',
          text: 'Cuenta se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/cuentas`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el cuenta.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarCuenta(cuenta: Cuenta) {
    console.log("Borrar:   borrarCuenta(cuenta: Cuenta) {")
    console.log(cuenta.id_cuenta)
    Swal.fire({
      title: '¿Borrar Cuenta?',
      text: `Estas a punto de borrar a ${cuenta.descripcion}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.cuentaService.deleteCuenta(cuenta.id_cuenta)
          .subscribe(resp => {
            this.cargarCuentas();
            /*Swal.fire(
              'Cuenta borrado',
              `${cuenta.nombre} ${cuenta.apellido} ha sido borrado correctamente.`,
              'success'              
            );*/
            Swal.fire({
              icon: 'success',
              title: 'Cuenta borrado',
              text: `${cuenta.descripcion} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el cuenta.';
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
      this.router.navigate(['/dashboard/cuentas']);
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
