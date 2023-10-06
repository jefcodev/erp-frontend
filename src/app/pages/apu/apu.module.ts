import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApusComponent } from './apus/apus.component';
import { ApuComponent } from './apus/apu.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ApusComponent,
    ApuComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class ApuModule { }
