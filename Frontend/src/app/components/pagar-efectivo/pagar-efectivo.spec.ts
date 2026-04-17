import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagarEfectivo } from './pagar-efectivo';

describe('PagarEfectivo', () => {
  let component: PagarEfectivo;
  let fixture: ComponentFixture<PagarEfectivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagarEfectivo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagarEfectivo);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
