import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TokenStore } from './token.store';

describe('TokenStore', () => {
  let store: TokenStore;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenStore],
    });
    store = TestBed.inject(TokenStore);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('initializes token as null when localStorage is empty', () => {
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() stores token in sessionStorage and updates signal', () => {
    store.set('my-token');
    expect(sessionStorage.getItem('bc_access_token')).toBe('my-token');
    expect(store.token()).toBe('my-token');
    expect(store.snapshot()).toBe('my-token');
  });

  it('clear() removes token from sessionStorage and clears signal', () => {
    store.set('my-token');
    store.clear();
    expect(sessionStorage.getItem('bc_access_token')).toBeNull();
    expect(store.token()).toBeNull();
    expect(store.snapshot()).toBeNull();
  });

  it('set() overwrites existing token', () => {
    store.set('token-1');
    store.set('token-2');
    expect(store.token()).toBe('token-2');
    expect(sessionStorage.getItem('bc_access_token')).toBe('token-2');
  });

  it('reads initial token from sessionStorage', () => {
    sessionStorage.setItem('bc_access_token', 'pre-existing');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), TokenStore],
    });
    const newStore = TestBed.inject(TokenStore);
    expect(newStore.snapshot()).toBe('pre-existing');
  });
});
