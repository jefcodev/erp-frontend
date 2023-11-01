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
  public ocultarModal: boolean = true;
  public mostrarModal = false;

  public proveedorForm: FormGroup;
  public proveedorFormU: FormGroup;
  public proveedores: Proveedor[] = [];
  public proveedorSeleccionado: Proveedor;
  public totalProveedores: number = 0;

  // Paginación
  itemsPorPagina = 10;
  paginaActual = 1;
  paginas: number[] = [];
  mostrarPaginacion: boolean = false;
  maximoPaginasVisibles = 5;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private proveedorService: ProveedorService,
    private renderer: Renderer2,
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

  get totalPaginas(): number {
    return Math.ceil(this.totalProveedores / this.itemsPorPagina);
  }

  calcularNumeroPaginas() {
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

  convertirAMayusculas(event: any) {
    const inputValue = event.target.value;
    const upperCaseValue = inputValue.toUpperCase();
    event.target.value = upperCaseValue;
  }

  cerrarModal() {
    this.mostrarModal = true;
    // Elimina la clase 'modal-open' del body para evitar que la pantalla quede congelada
    const body = document.querySelector('body');
    if (body) {
      body.classList.remove('modal-open');
    }
    // Cierra el modal de Bootstrap programáticamente
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
      this.renderer.removeChild(document.body, modalBackdrop);
    }
  }

}
