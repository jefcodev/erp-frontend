import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  menu: any[] = [
    {
      titulo: 'Seguridad',
      icono: 'mdi mdi-security',
      submenu: [
        { titulo: 'Usuarios', url: ('users') },
        { titulo: 'Roles', url: ('roles') },
        { titulo: 'Permisos', url: ('') },
      ]
    },
    {
      titulo: 'Contactos',
      icono: 'mdi mdi-account-box',
      submenu: [
        { titulo: 'Clientes', url: ('clientes') },
        { titulo: 'Grupos de Clientes', url: ('') },
        { titulo: 'Proveedores', url: ('proveedores') },
      ]
    },
    {
      titulo: 'Compras',
      icono: 'mdi mdi-arrow-down-bold-circle-outline',
      submenu: [
        { titulo: 'Proveedores', url: ('proveedores') },
        { titulo: 'Facturas Compra', url: ('facturas') },
        { titulo: 'Detalle Facturas Compra', url: ('detalle-facturas') },
        { titulo: 'Orden de Compras', url: ('') },
        { titulo: 'Egresos', url: ('') },
      ]
    },
    {
      titulo: 'Ventas',
      icono: 'mdi mdi-arrow-up-bold-circle-outline',
      submenu: [
        { titulo: 'Clientes', url: ('clientes') },
        { titulo: 'Facturas Venta', url: ('facturas-venta') },
        { titulo: 'Detalle Facturas Venta', url: ('detalle-facturas-ventas') },
        { titulo: 'Facturación Electrónica', url: ('facturacion') },
        { titulo: 'Proformas', url: ('quotation') },
        { titulo: 'Punto de Venta', url: ('') },
        { titulo: 'Ingresos', url: ('') },
      ]
    },
    {
      titulo: 'Inventario',
      icono: 'mdi mdi-dropbox',
      submenu: [
        { titulo: 'Productos', url: ('productos') },
        { titulo: 'configuración', url: ('') },
        { titulo: 'Tipos de Productos', url: ('') },
        { titulo: 'Lista de Precios', url: ('') },
        { titulo: 'Inventarios', url: ('') },
        { titulo: 'Unidades Medidad', url: ('inventory/units') },
        { titulo: 'Marcas', url: ('inventory/units') },
        { titulo: 'Categorías', url: ('inventory/categories') },
        { titulo: 'Sub Categorías', url: ('') },
        { titulo: 'Clasificaciones', url: ('') },
      ]
    },
    {
      titulo: 'APU',
      icono: 'mdi mdi-file-document-box',
      submenu: [
        { titulo: 'APU', url: ('apu') },
        { titulo: 'Configuración', url: ('') },
      ]
    },
    {
      titulo: 'Contabilidad',
      icono: 'mdi mdi-calculator',
      submenu: [
        { titulo: 'Asientos', url: ('asientos') },
        { titulo: 'Plan de Cuentas', url: ('cuentas') },
        { titulo: 'Formas de Pago', url: ('formas-pago') },
        { titulo: 'Tarifas IVA', url: ('') },
        { titulo: 'Tarifas ICE', url: ('') },
        { titulo: 'Cuentas por Pagar', url: ('') },
        { titulo: 'Cuentas por Cobrar', url: ('') },
        { titulo: 'Libro Diario', url: ('libro-diario') },
        { titulo: 'Libro Mayor', url: ('libro-mayor') },
        { titulo: 'Estado de Resultado', url: ('estado-resultado') },
        { titulo: 'Balance General', url: ('balance-general') },
        { titulo: 'Impuestos', url: ('') },
      ]
    },
    {
      titulo: 'Empleados',
      icono: 'mdi mdi-account-multiple',
      submenu: [
        { titulo: 'Lista', url: ('') },
        { titulo: 'Nómina', url: ('') },
      ]
    },
    {
      titulo: 'Reportes',
      icono: 'mdi mdi-file-pdf',
      submenu: [
        { titulo: 'Compras', url: ('') },
        { titulo: 'Ventas', url: ('') },
        { titulo: 'Productos', url: ('productos') },
        { titulo: 'APUs', url: ('') },
        { titulo: 'Estado de Resultado', url: ('estado-resultado') },
        { titulo: 'Balance General', url: ('balance-general') },
      ]
    },
    {
      titulo: 'Configuración',
      icono: 'mdi mdi-settings',
      submenu: [
        { titulo: 'Información Tributaria', url: ('') },
        { titulo: 'Temas', url: ('') },
        { titulo: 'Idioma', url: ('') },
        { titulo: 'Notificación', url: ('') },
        { titulo: 'Privacidad', url: ('') },
        { titulo: '', url: ('') },

      ]
    }
  ]
  constructor() { }
}
