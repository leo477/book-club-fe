import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TokenStore } from './token.store';

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenStore],
    });
    store = TestBed.inject(TokenStore);
  });

  it('initializes token as null', () => {
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() updates signal', () => {
    store.set('my-token');
    expect(store.token()).toBe('my-token');
    expect(store.snapshot()).toBe('my-token');
  });

  it('clear() resets signal to null', () => {
    store.set('my-token');
    store.clear();
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() overwrites existing token', () => {
    store.set('token-1');
    store.set('token-2');
    expect(store.token()).toBe('token-2');
    expect(store.snapshot()).toBe('token-2');
  });

  it('snapshot() returns current value', () => {
    store.set('snap-token');
    expect(store.snapshot()).toBe('snap-token');
  });
});
