import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Proveedor } from '../../../models/compra/proveedor.model';
import { ProveedorService } from 'src/app/services/compra/proveedor.service';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styles: []
})

export class ProveedorComponent implements OnInit {

  public formSubmitted = false;
  public mostrarModal = false;

  public proveedorForm: FormGroup;
  public proveedorFormU: FormGroup;
  public proveedores: Proveedor[] = [];
  public proveedorSeleccionado: Proveedor;

  // Paginación
  public totalProveedores: number = 0;
  public itemsPorPagina = 10;
  public paginaActual = 1;
  public paginas: number[] = [];
  public mostrarPaginacion: boolean = false;
  public maximoPaginasVisibles = 5;

  // Búsqueda
  public buscarTexto: string = '';
  public proveedores_aux: Proveedor[] = [];
  public allProveedores: Proveedor[] = [];


  constructor(
    private fb: FormBuilder,
    private router: Router,
    private renderer: Renderer2,

    private proveedorService: ProveedorService,
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
    this.cargarProveedores();
    this.cargarProveedoresAll();
  }

  cargarProveedores() {
    const desde = (this.paginaActual - 1) * this.itemsPorPagina;
    this.proveedorService.loadProveedores(desde, this.itemsPorPagina)
      .subscribe(({ proveedores, total }) => {
        this.proveedores = proveedores;
        this.totalProveedores = total;
        this.calcularNumeroPaginas();
        this.mostrarPaginacion = this.totalProveedores > this.itemsPorPagina;
      });
  }

  cargarProveedoresAll() {
    this.proveedorService.loadProveedoresAll()
      .subscribe(({ proveedores }) => {
        this.allProveedores = proveedores;
      });
  }

  cargarProveedorPorId(id_proveedor: any) {
    this.proveedorService.loadProveedorById(id_proveedor)
      .subscribe(proveedor => {
        const { identificacion, razon_social, nombre_comercial, direccion, telefono, email } = proveedor[0];
        this.proveedorSeleccionado = proveedor[0];
        this.proveedorFormU.setValue({ identificacion, razon_social, nombre_comercial, direccion, telefono, email })
      })
  }

  crearProveedor() {
    this.formSubmitted = true;
    if (this.proveedorForm.invalid) {
      return;
    }
    this.proveedorService.createProveedor(this.proveedorForm.value).subscribe(
      () => {
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
        const errorMessage = err.error?.msg || 'Se produjo un error al crear el proveedor.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  actualizarProveedor() {
    this.formSubmitted = true;
    if (this.proveedorFormU.invalid) {
      return;
    }
    const data = {
      ...this.proveedorFormU.value,
      id_proveedor: this.proveedorSeleccionado.id_proveedor
    }
    this.proveedorService.updateProveedor(data).subscribe(
      () => {
        Swal.fire({
          icon: 'success',
          title: 'Proveedor actualizado',
          text: 'Proveedor se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        const errorMessage = err.error?.msg || 'Se produjo un error al actualizar el proveedor.';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }

  borrarProveedor(proveedor: Proveedor) {
    Swal.fire({
      title: '¿Borrar Proveedor?',
      text: `Estas a punto de borrar a ${proveedor.razon_social}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.proveedorService.deleteProveedor(proveedor.id_proveedor).subscribe(
          () => {
            this.cargarProveedores();
            Swal.fire({
              icon: 'success',
              title: 'Proveedor borrado',
              text: `${proveedor.razon_social} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            const errorMessage = err.error?.msg || 'Se produjo un error al borrar el proveedor.';
            Swal.fire('Error', errorMessage, 'error');
          }
        );
      }
    });
  }

  filtrarProveedores() {
    if (this.proveedores_aux && this.proveedores_aux.length > 0) {
    } else {
      this.proveedores_aux = this.proveedores;
      console.log("this.proveedores_aux: ", this.proveedores_aux)
    }
    if (this.buscarTexto.trim() === '') {
      console.log("ELSE this.proveedores_aux: ", this.proveedores_aux)
      this.proveedores = this.proveedores_aux;
    } else {
      this.proveedores = this.allProveedores.filter(proveedor => {
        const regex = new RegExp(this.buscarTexto, 'i'); // 'i' para que sea insensible a mayúsculas/minúsculas
        return (
          proveedor.razon_social.toLowerCase().includes(this.buscarTexto.toLowerCase()) ||
          proveedor.identificacion.includes(this.buscarTexto) ||
          proveedor.direccion.match(regex) !== null ||
          proveedor.telefono.includes(this.buscarTexto) ||
          proveedor.email.includes(this.buscarTexto)
        );
      });
      console.log("ENCONTRADOS this.proveedores: ", this.proveedores)
    }
  }

  get totalPaginas(): number {
    return Math.ceil(this.totalProveedores / this.itemsPorPagina);
  }

  calcularNumeroPaginas() {
    if (this.totalProveedores === 0 || this.itemsPorPagina <= 0) {
      this.paginas = [];
      return;
    }
    const totalPaginas = Math.ceil(this.totalProveedores / this.itemsPorPagina);
    const halfVisible = Math.floor(this.maximoPaginasVisibles / 2);
    let startPage = Math.max(1, this.paginaActual - halfVisible);
    let endPage = Math.min(totalPaginas, startPage + this.maximoPaginasVisibles - 1);
    if (endPage - startPage + 1 < this.maximoPaginasVisibles) {
      startPage = Math.max(1, endPage - this.maximoPaginasVisibles + 1);
    }
    this.paginas = Array(endPage - startPage + 1).fill(0).map((_, i) => startPage + i);
  }

  changeItemsPorPagina() {
    this.cargarProveedores();
    this.paginaActual = 1;
  }

  cambiarPagina(page: number): void {
    if (page >= 1 && page <= this.totalPaginas) {
      this.paginaActual = page;
      this.cargarProveedores();
    }
  }

  getMinValue(): number {
    const minValue = (this.paginaActual - 1) * this.itemsPorPagina + 1;
    return minValue;
  }

  getMaxValue(): number {
    const maxValue = this.paginaActual * this.itemsPorPagina;
    return maxValue;
  }

  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/proveedores']);
    });
  }

  cerrarModal() {
    this.mostrarModal = true;
    const body = document.querySelector('body');
    if (body) {
      body.classList.remove('modal-open');
    }
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      this.renderer.removeChild(document.body, modalBackdrop);
    }
  }

}
