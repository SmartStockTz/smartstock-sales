import { TestBed } from '@angular/core/testing';

import { CreditorState } from '../states/creditor.state';

describe('CustomerApiService', () => {
  let service: CreditorState;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditorState);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
