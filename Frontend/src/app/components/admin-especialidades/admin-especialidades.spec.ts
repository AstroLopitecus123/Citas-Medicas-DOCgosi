import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminEspecialidades } from './admin-especialidades';

describe('AdminEspecialidades', () => {
  let component: AdminEspecialidades;
  let fixture: ComponentFixture<AdminEspecialidades>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminEspecialidades]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminEspecialidades);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
