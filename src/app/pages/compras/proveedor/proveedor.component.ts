import { Component, OnInit } from '@angular/core';

import { EventEmitter, Output } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Proveedor } from '../../../models/compra/proveedor.model';
import { ProveedorService } from 'src/app/services/compras/proveedor.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styles: []
})

export class ProveedorComponent implements OnInit {

  @Output() proveedorCreado = new EventEmitter<any>();


  public proveedores: Proveedor[] = [];
  public proveedorSeleccionado: Proveedor;
  public formSubmitted = false;
  //public ocultarModalCrear: boolean = true;
  //public ocultarModalUpdate: boolean = true;
  public ocultarModal: boolean = true;

  proveedorForm: FormGroup;
  proveedorFormU: FormGroup;

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
    private proveedorService: ProveedorService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.proveedorForm = this.fb.group({
      identificacion: ['1727671628', [Validators.required, Validators.minLength(3)]],
      razon_social: ['PINANJOTA EDISON', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['Systemcode', [Validators.required, Validators.minLength(3)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['eepinanjotac@utn.edu.ec', [Validators.required, Validators.email]],
    });

    this.proveedorFormU = this.fb.group({
      identificacion: ['', [Validators.required, Validators.minLength(3)]],
      razon_social: ['', [Validators.required, Validators.minLength(3)]],
      nombre_comercial: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
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
    this.cargarProveedores();
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

  cargarProveedores() {
    this.proveedorService.loadProveedores()
      .subscribe(({ proveedores }) => {
        this.proveedores = proveedores;
        console.log("Test (proveedor.component.ts) - cargarProveedores()")
        console.log(proveedores)
      })
  }

  cargarProveedorPorId(id_proveedor: any) {
    //cargarProveedor(proveedor: Proveedor) {
    //console.log(proveedor)
    console.log("cargarProveedorPorId(id_proveedor: any)")
    console.log(id_proveedor)
    //this.proveedorService.cargarProveedorById(proveedor.id_proveedor)
    this.proveedorService.loadProveedorById(id_proveedor)
      .subscribe(proveedor => {
        const { identificacion, razon_social, nombre_comercial, direccion, telefono, email } = proveedor[0];
        this.proveedorSeleccionado = proveedor[0];
        console.log("proveedor")
        console.log(proveedor)
        console.log("proveedor[0]")
        console.log(proveedor[0])
        console.log("identficacion")
        console.log(identificacion)
        console.log("razon_social")
        console.log(razon_social)
        this.proveedorFormU.setValue({ identificacion, razon_social, nombre_comercial, direccion, telefono, email })
      })
  }

  crearProveedor() {
    this.formSubmitted = true;
    console.log(this.proveedorForm.value)
    if (this.proveedorForm.invalid) {
      return;
    }
    // realizar posteo
    this.proveedorService.createProveedor(this.proveedorForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor creado',
          text: 'Proveedor se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al crear el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarProveedor() {
    console.log("Actualizar: actualizarProveedor() { ")
    //console.log(proveedor.id_proveedor)
    if (this.proveedorFormU.invalid) {
      return;
    }
    const data = {
      ...this.proveedorFormU.value,
      id_proveedor: this.proveedorSeleccionado.id_proveedor
    }

    console.log("UNO---updateProveedor()")
    console.log(data)

    // realizar posteo
    this.proveedorService.updateProveedor(data)
      .subscribe(res => {
        console.log("DOS---updateProveedor()")
        console.log(data)

        Swal.fire({
          icon: 'success',
          title: 'Proveedor actualizado',
          text: 'Proveedor se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/proveedores`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        // En caso de error
        let errorMessage = 'Se produjo un error al actualizar el proveedor.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarProveedor(proveedor: Proveedor) {
    console.log("Borrar:   borrarProveedor(proveedor: Proveedor) {")
    console.log(proveedor.id_proveedor)
    Swal.fire({
      title: '¿Borrar Proveedor?',
      text: `Estas a punto de borrar a ${proveedor.razon_social}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.proveedorService.deleteProveedor(proveedor.id_proveedor)
          .subscribe(resp => {
            this.cargarProveedores();
            /*Swal.fire(
              'Proveedor borrado',
              `${proveedor.nombre} ha sido borrado correctamente.`,
              'success'              
            );*/
            Swal.fire({
              icon: 'success',
              title: 'Proveedor borrado',
              text: `${proveedor.razon_social} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el proveedor.';
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
      this.router.navigate(['/dashboard/proveedores']);
    });

  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  agregarProveedor(proveedor: any) {
    console.log('XD--------')
    console.log(proveedor.identficacion)
    this.proveedores.push(proveedor);
  }

}
