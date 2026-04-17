import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionarDisponibilidad } from './gestionar-disponibilidad';

describe('GestionarDisponibilidad', () => {
  let component: GestionarDisponibilidad;
  let fixture: ComponentFixture<GestionarDisponibilidad>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionarDisponibilidad]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GestionarDisponibilidad);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
