import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { OgTitleStrategy } from './og-title-strategy';

describe('OgTitleStrategy', () => {
  let strategy: OgTitleStrategy;
  let title: Title;
  let meta: Meta;
  const snapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), OgTitleStrategy],
    });
    strategy = TestBed.inject(OgTitleStrategy);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    vi.spyOn(title, 'setTitle');
    vi.spyOn(meta, 'updateTag');
  });

  it('syncs <title> and og:/twitter:title when the route has a title', () => {
    vi.spyOn(strategy as unknown as { buildTitle: () => string }, 'buildTitle').mockReturnValue(
      'My Title',
    );

    strategy.updateTitle(snapshot);

    expect(title.setTitle).toHaveBeenCalledWith('My Title');
    expect(meta.updateTag).toHaveBeenCalledWith({ property: 'og:title', content: 'My Title' });
    expect(meta.updateTag).toHaveBeenCalledWith({ name: 'twitter:title', content: 'My Title' });
  });

  it('leaves tags untouched when the route has no title', () => {
    vi.spyOn(
      strategy as unknown as { buildTitle: () => string | undefined },
      'buildTitle',
    ).mockReturnValue(undefined);

    strategy.updateTitle(snapshot);

    expect(title.setTitle).not.toHaveBeenCalled();
    expect(meta.updateTag).not.toHaveBeenCalled();
  });
});
