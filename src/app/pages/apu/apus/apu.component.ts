import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApuService } from 'src/app/services/apus/apu.service';
import { Apu } from 'src/app/models/apus/apu.model';
import Swal from 'sweetalert2';
import { UnitService } from 'src/app/services/inventory/unit.service';
import { Unit } from 'src/app/models/inventory/unit.model';
import { ProductoService } from 'src/app/services/inventario/producto.service';
import { Producto } from 'src/app/models/inventario/producto.model';
import { Puesto } from 'src/app/models/apus/puestos.model';


@Component({
  selector: 'app-apu',
  templateUrl: './apu.component.html',
  styles: [
  ]
})
export class ApuComponent implements OnInit {

  /* Llenar dattos */
  filasMateriales: any[] = [];
  filasEquipos: any[] = [];
  filasManoObra: any[] = [];
  filasTransporte: any[] = [];

  /* Cargar dartos */
  unidades: Unit[] = [];
  productos: Producto[] = [];
  herramientas: Producto[] = [];
  puestos: Puesto[] = [];
  transporte: Producto[] = [];


  /* Variables del capítulo apu */
  codigoC: string = 'APU-001';
  nombreC: string;
  descripcionC: string;
  rendimientoC: number;
  unidadC: string;

  /* Variables costos indirectos APU */
  prestacionesSociales: number = 0.0945;



  /* Variables de totales unitarios */

  totalMateriales: number = 0;

  totalEquipos: number = 0;
  unitarioEquipos: number = 0;

  totalTransporte: number = 0;
  unitarioTransporte: number = 0;

  subTotalManoObra: number = 0.00;
  totalPrestaciones: number = 0;
  totalManoyPrestaciones: number = 0;
  totalManoObra: number = 0;
  unitarioManoObra: number = 0;

  costosDirectos: number = 0;

  administracion: number = 0;
  subTotalUnitario: number = 0;
  utilidad: number = 0;
  precioUnitario: number = 0;





  constructor(private apuService: ApuService,
    private unidadesService: UnitService,
    private productoService: ProductoService,
    private router: Router
  ) { }


  ngOnInit(): void {

    this.cargarUnidades();
    this.cargarProductos();
    this.cargarProductosHerramientas();
    this.cargarPuestos();
    this.cargarProductosTransporte();


    console.log('Puestos' + this.puestos)


  }

  /* Add & Delete Filas Materiales */
  addFilaMateriales() {
    this.filasMateriales.push({ codigo: '', descripcion: '', cantidad: null, unidad: '', desperdicio: null, precio: null, total: null });
    console.log(this.filasMateriales);
    console.log('uNIDAD C:' + this.unidadC);
  }
  deleteFilaMateriales(index: number) {

    if (this.filasMateriales.length >= 1) {
      this.filasMateriales.splice(index, 1);
    }
  }

  /* Add & Delete Filas Equipos */
  addFilaEquipos() {
    this.filasEquipos.push({ codige: '', descripcione: '', cantidade: null, depreciacion: 0.05 , unidade: '', precioe: null, totale: null });
  }
  deleteFilaEquipos(index: number) {
    if (this.filasEquipos.length >= 1) {
      this.filasEquipos.splice(index, 1);
    }
  }

  /* Add & Delete Filas Mano de Obra */
  addFilaManoObra() {
    console.log(this.filasManoObra);
    this.filasManoObra.push({ codigom: '', descripcionm: '', cantidadm: null, unidadm: 'Jornada', preciom: null, totalm: null });
  }
  deleteFilaManoObra(index: number) {
    if (this.filasManoObra.length >= 1) {
      this.filasManoObra.splice(index, 1);
    }
  }
  /* Add & Delete Filas Transporte */
  addFilaTransporte() {
    this.filasTransporte.push({ codigot: '', descripciont: '', cantidadt: null, unidadt: '', preciot: null, totalt: null });
  }
  deleteFilaTransporte(index: number) {
    if (this.filasTransporte.length >= 1) {
      this.filasTransporte.splice(index, 1);
    }
  }




  /* Métodos para cambiar datos Materiales */

  actualizarDatosMateriales(productoSeleccionado: any, indice: number) {

    if (productoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasMateriales[indice].precio = productoSeleccionado.precio_compra;
      this.filasMateriales[indice].descripcion = productoSeleccionado.descripcion;
      this.filasMateriales[indice].codigo = productoSeleccionado.codigo_principal;

      // Asignar valaor cuando esta un id
      const unidadSeleccionada = this.unidades.find(u => u.id_unidad_medida === productoSeleccionado.id_unidad_medida);
      this.filasMateriales[indice].unidad = unidadSeleccionada ? unidadSeleccionada.descripcion : '';


    }
  }

  calcularSubTotalMateriales(indice: number) {
    const fila = this.filasMateriales[indice];
    if (fila.cantidad !== null && fila.precio !== null) {
      fila.total = ((fila.cantidad * fila.desperdicio) + fila.cantidad) * fila.precio;
      fila.total = parseFloat(fila.total.toFixed(2));

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
      //this.filasEquipos[indice].precioe =  productoSeleccionado.precio;
      this.filasEquipos[indice].precioe = productoSeleccionado.precio_compra;
      this.filasEquipos[indice].descripcione = productoSeleccionado.descripcion;
      this.filasEquipos[indice].codige = productoSeleccionado.codigo_principal;

    }
  }

  calcularSubTotalEquipos(indice: number) {
    const fila = this.filasEquipos[indice];
    if (fila.cantidade !== null && fila.precioe !== null) {
      fila.totale = fila.cantidade * fila.precioe * fila.depreciacion ;
    }
    fila.totale = parseFloat(fila.totale.toFixed(2));
  }

  calcularTotalEquipos() {
    this.totalEquipos = this.filasEquipos.reduce((total, fila) => {
      return total + (fila.totale || 0); // Se utiliza "totale" en lugar de "total"
    }, 0);

    // Redondear el total a 2 decimales
    this.totalEquipos = parseFloat(this.totalEquipos.toFixed(2));
  }

  calcularRendimiento() {
    this.unitarioEquipos = this.totalEquipos / this.rendimientoC
    this.unitarioEquipos = parseFloat(this.unitarioEquipos.toFixed(2))
    return this.unitarioEquipos;
  }





  /* Métodos para cambiar datos Mano de Obra */

  actualizarDatosManoObra(trabajoSeleccionado: any, indice: number) {

    if (trabajoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasManoObra[indice].preciom = trabajoSeleccionado.salario;
      this.filasManoObra[indice].descripcionm = trabajoSeleccionado.cargo;

    }
  }

  calcularSubTotalManoObra(indice: number) {
    const fila = this.filasManoObra[indice];
    if (fila.cantidadm !== null && fila.preciom !== null) {
      fila.totalm = fila.cantidadm * fila.preciom;
    }
    fila.totalm = parseFloat(fila.totalm.toFixed(2));
  }

  calcularSubTotalManoObra2() {
    console.log('Subtotal');
    this.subTotalManoObra = this.filasManoObra.reduce((total, fila) => {
      return total + (fila.totalm || 0); // Se utiliza "totale" en lugar de "total"
    }, 0);

    this.subTotalManoObra = parseFloat(this.subTotalManoObra.toFixed(2));

    this.totalPrestaciones = this.subTotalManoObra * this.prestacionesSociales;
    this.totalPrestaciones = parseFloat(this.totalPrestaciones.toFixed(2));

    this.totalManoyPrestaciones = this.subTotalManoObra + this.totalPrestaciones;
    this.totalManoyPrestaciones = parseFloat(this.totalManoyPrestaciones.toFixed(2));

    this.unitarioManoObra = this.totalManoyPrestaciones / this.rendimientoC;
    this.unitarioManoObra = parseFloat(this.unitarioManoObra.toFixed(2));

  }


  /*  calcularPrestaciones() {
     console.log('Prestacioens');
     this.totalPrestaciones = this.subTotalManoObra * this.prestacionesSociales;
 
     this.totalPrestaciones = parseFloat(this.totalPrestaciones.toFixed(2))
     return this.totalPrestaciones;
   } */

  calcularRendimientoManoObra() {
    this.unitarioManoObra = this.totalManoObra / this.rendimientoC
    this.unitarioEquipos = parseFloat(this.unitarioEquipos.toFixed(2));
    return this.unitarioEquipos;
  }

  /* 
  
    subTotalManoObra : number = 0.00;
    totalPrestaciones : number = 0;
    totalManoyPrestaciones: number =0;
    totalManoObra: number = 0;
    unitarioManoObra: number = 0;*/



  /* Metodos actualización de datos Transporte */


  actualizarDatosTransporte(trabajoSeleccionado: any, indice: number) {

    if (trabajoSeleccionado) {
      // Si se ha seleccionado un producto, actualiza el campo de "precio" en la fila correspondiente
      this.filasTransporte[indice].preciot = trabajoSeleccionado.precio_compra;
      this.filasTransporte[indice].descripciont = trabajoSeleccionado.descripcion;
      this.filasTransporte[indice].descripciont = trabajoSeleccionado.descripcion;


    }
  }

  calcularSubTotalTransporte(indice: number) {
    const fila = this.filasTransporte[indice];
    if (fila.cantidadt !== null && fila.preciot !== null) {
      fila.totalt = fila.cantidadt * fila.preciot;
    }
  }

  calcularTotalTransporte() {
    this.totalTransporte = this.filasTransporte.reduce((total, fila) => {
      return total + (fila.totalt || 0); // Se utiliza "totale" en lugar de "total"
    }, 0);
    // Redondear el total a 2 decimales
    this.totalTransporte = parseFloat(this.totalTransporte.toFixed(2));
  }


  /* 
  administracion: number = 0;
  subTotalUnitario : number = 0;
  utilidad: number = 0 ;
  precioUnitario : number = 0;
  */



  calcularCostosDirectos() {
    this.costosDirectos = this.totalMateriales + this.unitarioEquipos + this.totalTransporte + this.unitarioManoObra;
    this.costosDirectos = parseFloat(this.costosDirectos.toFixed(2));
    this.administracion = this.costosDirectos * 0.12;
    this.administracion = parseFloat(this.administracion.toFixed(2));
    this.subTotalUnitario = this.costosDirectos + this.administracion;
    this.subTotalUnitario = parseFloat(this.subTotalUnitario.toFixed(2));
    this.utilidad = this.subTotalUnitario * 0.08;
    this.utilidad = parseFloat(this.utilidad.toFixed(2));
    this.precioUnitario = this.subTotalUnitario + this.utilidad;
    this.precioUnitario = parseFloat(this.precioUnitario.toFixed(2));
  };



  /* Cargar datos */

  cargarProductos() {
    this.productoService.loadProductosMateriales()
      .subscribe(({ productos }) => {
        this.productos = productos;
      })
  }
  cargarPuestos() {
    this.productoService.loadPuestos().subscribe(
      ({ puestos }) => {
        this.puestos = puestos;
      },
      (error) => {
        console.error("Error al cargar puestos:", error);
      }
    );
  }

  cargarProductosHerramientas() {
    this.productoService.loadProductosHerramientas()
      .subscribe(({ productos }) => {
        this.herramientas = productos;
      })
    console.log('Puestos')
  }
  cargarProductosTransporte() {
    this.productoService.loadProductosMateriales()
      .subscribe(({ productos }) => {
        this.transporte = productos;
      })
    console.log('Puestos')
  }
  cargarUnidades() {
    this.unidadesService.cargarUnits()
      .subscribe((unidades: Unit[]) => {
        this.unidades = unidades;
      });

  }


  recargarComponente() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/apus']);
    });
  }

  /* Métodos Crear */

  crearApu() {


    const apu: Apu = {
      codigo: this.codigoC,
      nombre: this.nombreC,
      descripcion: this.descripcionC,
      rendimiento: this.rendimientoC,
      unidad: this.unidadC,
      total: this.precioUnitario,
      materiales: this.filasMateriales,
      equipos: this.filasEquipos,
      mano_obra: this.filasManoObra,
      transporte: this.filasTransporte
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
        this.recargarComponente();
      },
      (error) => {
        Swal.fire('Error', error, 'error');
      }
    );
  }

}
