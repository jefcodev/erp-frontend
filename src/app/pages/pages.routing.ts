import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { AuthGuard } from '../guards/auth.guard';

import { PagesComponent } from './pages.component';
import { PromesasComponent } from './promesas/promesas.component';
import { RxjsComponent } from './rxjs/rxjs.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { PerfilComponent } from './perfil/perfil.component';

import { RolesComponent } from './usuarios/roles/roles.component';
import { UsersComponent } from './usuarios/users/users.component';
import { UserComponent } from './usuarios/users/user.component';

import { CategoriesComponent } from './inventory/categories/categories.component';
import { ProductsComponent } from './inventory/products/products.component';
import { UnitsComponent } from './inventory/units/units.component';
import { IvaComponent } from './purchases/iva/iva.component';
import { ProvidersComponent } from './purchases/providers/providers.component';
import { ClientsComponent } from './quotations/clients/clients.component';
import { GroupsClientsComponent } from './quotations/groups-clients/groups-clients.component';
import { ImportClientsComponent } from './quotations/import-clients/import-clients.component';
import { ImportProvidersComponent } from './purchases/import-providers/import-providers.component';
import { ImportInventoryComponent } from './inventory/import-inventory/import-inventory.component';
import { PurchasesComponent } from './purchases/purchases/purchases.component';
import { QuotationsComponent } from './quotations/quotations/quotations.component';
import { ProductComponent } from './inventory/products/product.component';
import { PurchaseComponent } from './purchases/purchases/purchase.component';
import { QuotationComponent } from './quotations/quotations/quotation.component';
import { ApusComponent } from './apu/apus/apus.component';
import { ApuComponent } from './apu/apus/apu.component';

// Compras
import { ProveedorComponent } from './compras/proveedor/proveedor.component';
import { FacturaComponent } from './compras/factura/factura.component';

// Venta
import { ClienteComponent } from './venta/cliente/cliente.component';
import { FacturaVentaComponent } from './venta/factura/factura.component';

// Inventario
import { ProductoComponent } from './inventario/producto/producto.component'; 

// Contabilidad
import { CuentaComponent } from './contabilidad/cuenta/cuenta.component';
import { FormaPagoComponent } from './contabilidad/forma-pago/forma-pago.component';
import { TarifaIVAComponent } from './contabilidad/tarifa-iva/tarifa-iva.component';
import { AsientoComponent } from './contabilidad/asiento/asiento.component';
import { DetalleAsientoComponent } from './contabilidad/detalle-asiento/detalle-asiento.component';
import { LibroDiarioComponent } from './contabilidad/libro-diario/libro-diario.component';
import { LibroMayorComponent } from './contabilidad/libro-mayor/libro-mayor.component';
import { BalanceGeneralComponent } from './contabilidad/balance-general/balance-general.component';
import { EstadoResultadoComponent } from './contabilidad/estado-resultado/estado-resultado.component';
import { AdminGuard } from '../guards/admin.guard';
import { BodegueroGuard } from '../guards/bodeguero.guard';

const routes: Routes = [
    {
        path: 'dashboard',
        component: PagesComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: DashboardComponent, data: { titulo: 'Dashboard' } },
            { path: 'rxjs', component: RxjsComponent, data: { titulo: 'Rxjs' } },
            { path: 'promesas', component: PromesasComponent, data: { titulo: 'Promesas' } },

            /* Perfil */
            { path: 'account-settings', component: AccountSettingsComponent, data: { titulo: 'Configuración Ususario' } },
            { path: 'perfil', component: PerfilComponent, data: { titulo: 'Perfil Usuario' } },

            /* Users */
            { path: 'roles', component: RolesComponent, data: { titulo: 'Roles' } },
            { path: 'users', canActivate:[AdminGuard],  component: UsersComponent, data: { titulo: 'Usuarios' } },
            { path: 'user/:id', component: UserComponent, data: { titulo: 'Usuarios' } },

            /* Inventory */
            { path: 'inventory/categories', component: CategoriesComponent, data: { titulo: 'Categorías' } },
            { path: 'inventory/products', canActivate:[BodegueroGuard], component: ProductsComponent, data: { titulo: 'Productos' } },
            { path: 'inventory/product', component: ProductComponent, data: { titulo: 'Nuevo Producto' } },
            { path: 'inventory/units', component: UnitsComponent, data: { titulo: 'Unidades' } },
            { path: 'inventory/import-products', component: ImportInventoryComponent, data: { titulo: 'Importar Productos' } },

            /* Purchases */
            { path: 'purchase/iva', component: IvaComponent, data: { titulo: 'Iva' } },
            { path: 'providers', component: ProvidersComponent, data: { titulo: 'Proveedores' } },
            { path: 'providers/import', component: ImportProvidersComponent, data: { titulo: 'Importar Proveedores' } },
            { path: 'purchases', component: PurchasesComponent, data: { titulo: 'Compras' } },
            { path: 'purchase', component: PurchaseComponent, data: { titulo: 'Nueva Compra' } },

            // Compras
            { path: 'proveedores', component: ProveedorComponent, data: { titulo: 'Proveedores' } },
            { path: 'facturas', component: FacturaComponent, data: { titulo: 'Facturas Compra' } },

            // Venta
            { path: 'clientes', component: ClienteComponent, data: { titulo: 'Clientes' } },
            { path: 'facturas-ventas', component: FacturaVentaComponent, data: { titulo: 'Facturas Ventas' } },

            // Inventario
            { path: 'productos', canActivate: [BodegueroGuard], component: ProductoComponent, data: { titulo: 'Productos' } },

            /* Quotations */
            { path: 'quotations', component: QuotationsComponent, data: { titulo: 'Proformas' } },
            { path: 'quotation', component: QuotationComponent, data: { titulo: 'Nueva Proforma' } },
            { path: 'clients', component: ClientsComponent, data: { titulo: 'Clientes' } },
            { path: 'clients/groups', component: GroupsClientsComponent, data: { titulo: 'Grupo de Clientes' } },
            { path: 'clients/import', component: ImportClientsComponent, data: { titulo: 'Importar Clientes' } },

            /* APUS */
            { path: 'apus', component: ApusComponent, data: { titulo: 'APUs' } },
            { path: 'apu', component: ApuComponent, data: { titulo: 'Generar APU' } },

            // Contabilidad
            { path: 'cuentas', component: CuentaComponent, data: { titulo: 'Cuentas' } },
            { path: 'formas-pago', component: FormaPagoComponent, data: { titulo: 'Formas de Pago' } },
            { path: 'tarifas-iva', component: TarifaIVAComponent, data: { titulo: 'Tarifas IVA' } },
            { path: 'asientos', component: AsientoComponent, data: { titulo: 'Asientos' } },
            { path: 'detalle-asientos', component: DetalleAsientoComponent, data: { titulo: 'Detalle Asientos' } },
            { path: 'libro-diario', component: LibroDiarioComponent, data: { titulo: 'Libro Diario' } },
            { path: 'libro-mayor', component: LibroMayorComponent, data: { titulo: 'Libro Mayor' } },
            { path: 'estado-resultado', component: EstadoResultadoComponent, data: { titulo: 'Estado Resultado' } },
            { path: 'balance-general', component: BalanceGeneralComponent, data: { titulo: 'Balance General' } },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})

export class PagesRoutingModule { }


