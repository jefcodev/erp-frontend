import { Component, OnInit } from '@angular/core';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { Cliente } from '../../../models/venta/cliente.model';
import { ClienteService } from 'src/app/services/venta/cliente.service';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styles: [
  ]
})
export class ClienteComponent implements OnInit {

  public clientes: Cliente[] = [];
  public totalClientes: number = 0;
  public desde: number = 0;
  public clienteSeleccionado: Cliente;
  public formSubmitted = false;
  public ocultarModal: boolean = true;

  clienteForm: FormGroup;
  clienteFormU: FormGroup;

  constructor(
    private fb: FormBuilder,
    private clienteService: ClienteService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {
    this.clienteForm = this.fb.group({
      identificacion: ['1727671628', [Validators.required, Validators.minLength(3)]],
      razon_social: ['Edison Pinanjota', [Validators.required, Validators.minLength(3)]],
      direccion: ['Cayambe', [Validators.required, Validators.minLength(3)]],
      telefono: ['0978812129', [Validators.required, Validators.minLength(3)]],
      email: ['eepinanjotac@utn.edu.ec', [Validators.required, Validators.email]],
    });

    this.clienteFormU = this.fb.group({
      identificacion: ['', [Validators.required, Validators.minLength(3)]],
      razon_social: ['', [Validators.required, Validators.minLength(3)]],
      direccion: ['', [Validators.required, Validators.minLength(3)]],
      telefono: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  ngOnInit(): void {
    this.cargarClientes();
  }

  cargarClientes() {
    this.clienteService.loadClientes(this.desde)
      .subscribe(({ clientes, total }) => {
        this.clientes = clientes;
        this.totalClientes = total;
      })
  }

  cargarClientePorId(id_cliente: any) {
    this.clienteService.loadClienteById(id_cliente)
      .subscribe(cliente => {
        const { identificacion, razon_social, direccion, telefono, email } = cliente[0];
        this.clienteSeleccionado = cliente[0];
        this.clienteFormU.setValue({ identificacion, razon_social, direccion, telefono, email })
      })
  }

  crearCliente() {
    this.formSubmitted = true;
    console.log(this.clienteForm.value)
    if (this.clienteForm.invalid) {
      return;
    }
    this.clienteService.createCliente(this.clienteForm.value)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente creado',
          text: 'Cliente se ha creado correctamente.',
          showConfirmButton: false,
          timer: 1500
        });
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al crear el cliente.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  actualizarCliente() {
    if (this.clienteFormU.invalid) {
      return;
    }
    const data = {
      ...this.clienteFormU.value,
      id_cliente: this.clienteSeleccionado.id_cliente
    }
    this.clienteService.updateCliente(data)
      .subscribe(res => {
        Swal.fire({
          icon: 'success',
          title: 'Cliente actualizado',
          text: 'Cliente se ha actualizado correctamente',
          showConfirmButton: false,
          timer: 1500
        });
        //this.router.navigateByUrl(`/dashboard/clientes`)
        this.recargarComponente();
        this.cerrarModal();
      }, (err) => {
        let errorMessage = 'Se produjo un error al actualizar el cliente.';
        if (err.error && err.error.msg) {
          errorMessage = err.error.msg;
        }
        Swal.fire('Error', err.error.msg, 'error');
      });
    this.recargarComponente();
  }

  borrarCliente(cliente: Cliente) {
    Swal.fire({
      title: '¿Borrar Cliente?',
      text: `Estas a punto de borrar a ${cliente.razon_social}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.value) {
        this.clienteService.deleteCliente(cliente.id_cliente)
          .subscribe(resp => {
            this.cargarClientes();
            Swal.fire({
              icon: 'success',
              title: 'Cliente borrado',
              text: `${cliente.razon_social} ha sido borrado correctamente.`,
              showConfirmButton: false,
              timer: 1500
            });
          }, (err) => {
            let errorMessage = 'Se produjo un error al borrar el cliente.';
            if (err.error && err.error.msg) {
              errorMessage = err.error.msg;
            }
            Swal.fire('Error', errorMessage, 'error');
          }
          );
      }
    });
  }

  cambiarPagina(valor: number) {
    this.desde += valor;
    if (this.desde < 0) {
      this.desde = 0;
    } else if (this.desde > this.totalClientes) {
      this.desde -= valor;
    }
    this.cargarClientes();
  }

  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/clientes']);
    });
  }

  campoNoValido(campo: string, form: FormGroup): boolean {
    if (form.get(campo)?.invalid && this.formSubmitted) {
      return true;
    } else {
      return false;
    }
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

}
