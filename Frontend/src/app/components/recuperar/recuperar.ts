import { Component } from '@angular/core';
import { RecuperarController } from '../../controller/recuperar.controller';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-recuperar',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './recuperar.html',
  styleUrls: ['./recuperar.css']
})
export class RecuperarComponent {
  ctrl = new RecuperarController();
}
