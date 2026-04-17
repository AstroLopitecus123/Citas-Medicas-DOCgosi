import { Component } from '@angular/core';
import { RestablecerController } from '../../controller/restablecer.controller';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-restablecer',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './restablecer.html',
  styleUrls: ['./restablecer.css']
})
export class RestablecerComponent {
  ctrl = new RestablecerController();
}
