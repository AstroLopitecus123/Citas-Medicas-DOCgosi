import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Restablecer } from './restablecer';

describe('Restablecer', () => {
  let component: Restablecer;
  let fixture: ComponentFixture<Restablecer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Restablecer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Restablecer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
