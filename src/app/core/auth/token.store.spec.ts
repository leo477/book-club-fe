import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TokenStore } from './token.store';

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenStore],
    });
    store = TestBed.inject(TokenStore);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('initializes token as null when localStorage is empty', () => {
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() stores token in localStorage and updates signal', () => {
    store.set('my-token');
    expect(localStorage.getItem('bc_access_token')).toBe('my-token');
    expect(store.token()).toBe('my-token');
    expect(store.snapshot()).toBe('my-token');
  });

  it('clear() removes token from localStorage and clears signal', () => {
    store.set('my-token');
    store.clear();
    expect(localStorage.getItem('bc_access_token')).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() overwrites existing token', () => {
    store.set('token-1');
    store.set('token-2');
    expect(store.token()).toBe('token-2');
    expect(localStorage.getItem('bc_access_token')).toBe('token-2');
  });

  it('reads initial token from localStorage', () => {
    localStorage.setItem('bc_access_token', 'pre-existing');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenStore],
    });
    const newStore = TestBed.inject(TokenStore);
    expect(newStore.snapshot()).toBe('pre-existing');
  });
});
