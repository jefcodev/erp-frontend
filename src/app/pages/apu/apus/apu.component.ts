import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApuService } from 'src/app/services/apus/apu.service';
import { Apu } from 'src/app/models/apus/apu.model';
import Swal from 'sweetalert2';
import { UnitService } from 'src/app/services/inventory/unit.service';
import { Unit } from 'src/app/models/inventory/unit.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { Producto } from 'src/app/models/inventario/producto.model';


@Component({
  selector: 'app-apu',
  templateUrl: './apu.component.html',
  styles: [
  ]
})
export class ApuComponent implements OnInit {

  /* Llenar dattos */
  filasMateriales: any [] = [];
  filasEquipos: any[] = [];
  filasManoObra: any[] = [];

  /* Cargar dartos */
  unidades: Unit[] = [];
  productos: Producto[]=[];
  herramientas : Producto []=[];
  mano_obras: Producto []=[];



  /* Variables del capítulo apu */
  codigoC: string;
  nombreC: string;
  descripcionC: string;
  rendimientoC: number;
  unidadC: string;


  /* Variables de totales unitarios */

  totalMateriales: number = 0;

  totalEquipos: number = 0;
  unitarioEquipos: number = 0;

  totalManoObra: number = 0;
  unitarioManoObra: number =0;
  
  constructor(private apuService: ApuService,
    private unidadesService: UnitService,
    private productoService: ProductoService
   ) { }

  ngOnInit(): void {
     this.cargarUnidades();
     this.cargarProductos();
     this.cargarProductosHerramientas();
     

  }

  /* Add & Delete Filas Materiales */
  addFilaMateriales() {
    this.filasMateriales.push({ codigo:'', descripcion: '', cantidad: null, unidad: '', desperdicio: null, precio: null, total: null });
    console.log(this.filasMateriales);
  }
  deleteFilaMateriales(index: number) {
    if (this.filasMateriales.length >= 1) {
      this.filasMateriales.splice(index, 1);
    }
  }

  /* Add & Delete Filas Equipos */
  addFilaEquipos() {
    this.filasEquipos.push({ descripcione: '', cantidade: null, unidade: '', precioe: null, totale: null });
  }
  deleteFilaEquipos(index: number) {
    if (this.filasEquipos.length >= 1) {
      this.filasEquipos.splice(index, 1);
    }
  }

  /* Add & Delete Filas Mano de Obra */
  addFilaManoObra() {
    this.filasManoObra.push({ descripcionm: '', cantidadm: null, unidadm: '', preciom: null, totalm: null });
  }
  deleteFilaManoObra(index: number) {
    if (this.filasManoObra.length >= 1) {
      this.filasManoObra.splice(index, 1);
    }
  }




/* Métodos para cambiar datos Materiales */

  actualizarDatosMateriales(productoSeleccionado: any, indice: number) {
    
    if (productoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasMateriales[indice].precio = productoSeleccionado.precio_compra;
      this.filasMateriales[indice].descripcion = productoSeleccionado.descripcion;
      this.filasMateriales[indice].codigo = productoSeleccionado.codigo_principal;
    }
  }

  calcularSubTotalMateriales(indice: number) {
    const fila = this.filasMateriales[indice];
    if (fila.cantidad !== null && fila.precio !== null) {
      fila.total = fila.cantidad * fila.precio;
    }
  }

  calcularTotalMateriales() {
    this.totalMateriales = this.filasMateriales.reduce((total, fila) => {
      return total + (fila.total || 0); 
    }, 0);
    // Redondear el total a 2 decimales
  this.totalMateriales = parseFloat(this.totalMateriales.toFixed(2));
  }


/* Métodos para cambiar datos Equipo Herramientas y Maquinaria */

actualizarDatosEquipos(productoSeleccionado: any, indice: number) {
    
  if (productoSeleccionado) {
    // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
    this.filasEquipos[indice].precioe = productoSeleccionado.precio_compra;
    this.filasEquipos[indice].descripcione = productoSeleccionado.descripcion;
    
  }
}

calcularSubTotalEquipos(indice: number) {
  const fila = this.filasEquipos[indice];
  if (fila.cantidade !== null && fila.precioe !== null) {
    fila.totale = fila.cantidade * fila.precioe;
  }
}

calcularTotalEquipos() {
  this.totalEquipos = this.filasEquipos.reduce((total, fila) => {
    return total + (fila.totale || 0); // Se utiliza "totale" en lugar de "total"
  }, 0);

  // Redondear el total a 2 decimales
  this.totalEquipos = parseFloat(this.totalEquipos.toFixed(2));
}

calcularRendimiento(){
  this.unitarioEquipos =  this.totalEquipos/ this.rendimientoC
  this.unitarioEquipos = parseFloat(this.unitarioEquipos.toFixed(2))
  return this.unitarioEquipos;
  
  
}



  /* Cargar datos */

  cargarProductos() {
    this.productoService.loadProductosMateriales()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }
  cargarProductosHerramientas() {
    this.productoService.loadProductosHerramientas()
      .subscribe(({ productos }) => {
        this.herramientas = productos;
      })
  }
  cargarUnidades() {
    this.unidadesService.cargarUnits()
      .subscribe((unidades: Unit[]) => {
        this.unidades = unidades;
      });
  }



  /* 
  
  Fecha:
  Rendimiento:
  Unidad:
  
  */

  /* Métodos Crear */

  crearApu() {
    

    const apu: Apu = {
      codigo: this.codigoC,
      nombre: this.nombreC,
      descripcion: this.descripcionC,
      rendimiento: this.rendimientoC,
      unidad: this.unidadC,
      materiales: this.filasMateriales,
      equipos: this.filasEquipos,
      mano_obra: this.filasManoObra,
    };

    console.log('APU' + apu);

    this.apuService.createApu(apu).subscribe(
      (response) => {

        Swal.fire({
          icon: 'success',
          title: 'Creado correctamente',
          text: `Analisis de Precios Unitarios creado correctamente.`,
          showConfirmButton: false,
          timer: 1500
        });
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      }
    );
  }

}
