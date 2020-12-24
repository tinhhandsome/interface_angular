import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CarChargeInfoComponent } from './car-charge-info.component';

describe('CarChargeInfoComponent', () => {
  let component: CarChargeInfoComponent;
  let fixture: ComponentFixture<CarChargeInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CarChargeInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CarChargeInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
