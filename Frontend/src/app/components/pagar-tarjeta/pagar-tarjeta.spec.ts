import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagarTarjeta } from './pagar-tarjeta';

describe('PagarTarjeta', () => {
  let component: PagarTarjeta;
  let fixture: ComponentFixture<PagarTarjeta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarTarjeta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagarTarjeta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
