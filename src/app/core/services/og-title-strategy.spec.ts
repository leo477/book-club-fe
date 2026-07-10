import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot } from '@angular/router';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { OgTitleStrategy } from './og-title-strategy';

describe('OgTitleStrategy', () => {
  let strategy: OgTitleStrategy;
  let title: Title;
  let meta: Meta;
  let translateSpy: { instant: ReturnType<typeof vi.fn>; onLangChange: EventEmitter<LangChangeEvent> };
  const snapshot = {} as RouterStateSnapshot;

  beforeEach(() => {
    translateSpy = {
      instant: vi.fn((key: string) => key),
      onLangChange: new EventEmitter<LangChangeEvent>(),
    };
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        OgTitleStrategy,
        { provide: TranslateService, useValue: translateSpy },
      ],
    });
    strategy = TestBed.inject(OgTitleStrategy);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
    vi.spyOn(title, 'setTitle');
    vi.spyOn(meta, 'updateTag');
  });

  it('translates the route title key and syncs <title> and og:/twitter:title', () => {
    translateSpy.instant.mockReturnValue('My Title');
    vi.spyOn(strategy as unknown as { buildTitle: () => string }, 'buildTitle').mockReturnValue(
      'TITLES.my_title',
    );

    strategy.updateTitle(snapshot);

    expect(translateSpy.instant).toHaveBeenCalledWith('TITLES.my_title');
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

  it('re-applies the translated title when the language changes', () => {
    vi.spyOn(strategy as unknown as { buildTitle: () => string }, 'buildTitle').mockReturnValue(
      'TITLES.my_title',
    );
    strategy.updateTitle(snapshot);
    (title.setTitle as ReturnType<typeof vi.fn>).mockClear();

    translateSpy.instant.mockReturnValue('Мій заголовок');
    translateSpy.onLangChange.emit({ lang: 'uk', translations: {} });

    expect(title.setTitle).toHaveBeenCalledWith('Мій заголовок');
  });

  it('does not re-apply on language change when no route title was set', () => {
    vi.spyOn(
      strategy as unknown as { buildTitle: () => string | undefined },
      'buildTitle',
    ).mockReturnValue(undefined);
    strategy.updateTitle(snapshot);

    translateSpy.onLangChange.emit({ lang: 'uk', translations: {} });

    expect(title.setTitle).not.toHaveBeenCalled();
  });
});
