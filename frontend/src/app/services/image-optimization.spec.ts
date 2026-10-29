import { TestBed } from '@angular/core/testing';

import { ImageOptimization } from './image-optimization';

describe('ImageOptimization', () => {
  let service: ImageOptimization;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageOptimization);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
