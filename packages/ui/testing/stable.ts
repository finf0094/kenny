import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/**
 * Waits for pending change detection. The library is zoneless: a signal written
 * in an event handler updates the DOM on the next scheduler tick, not synchronously.
 */
export function stable(): Promise<void> {
  return TestBed.inject(ApplicationRef).whenStable();
}
