import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerComprobante } from './ver-comprobante';

describe('VerComprobante', () => {
  let component: VerComprobante;
  let fixture: ComponentFixture<VerComprobante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerComprobante]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerComprobante);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
