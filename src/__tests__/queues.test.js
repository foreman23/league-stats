import { queueTitle } from '../utils/queues';

describe('queueTitle', () => {
  it.each([
    ['5v5 Ranked Solo games', 'Ranked Solo'],
    ['5v5 Ranked Flex games', 'Ranked Flex'],
    ['5v5 Draft Pick games', 'Normal'],
    ["Summoner's Rift Clash games", 'SR Clash'],
    ['5v5 ARAM games', 'ARAM'],
    ['ARAM Clash games', 'ARAM Clash'],
    ['ARURF games', 'ARURF'],
    ['URF games', 'URF'],
    ['Arena', 'Arena'],
  ])('maps %s -> %s', (description, expected) => {
    expect(queueTitle(description)).toBe(expected);
  });

  it('returns null fallback by default for unknown descriptions', () => {
    expect(queueTitle('Some New Mode games')).toBeNull();
    expect(queueTitle(undefined)).toBeNull();
    expect(queueTitle(null)).toBeNull();
  });

  it('returns the provided fallback for unknown descriptions', () => {
    expect(queueTitle('Some New Mode games', 'Game')).toBe('Game');
    expect(queueTitle(null, 'Featured Mode')).toBe('Featured Mode');
    // ArenaDetails passes the raw description as its own fallback
    expect(queueTitle('Weird Mode', 'Weird Mode')).toBe('Weird Mode');
  });

  it('prefers a known title over the fallback', () => {
    expect(queueTitle('5v5 ARAM games', 'Game')).toBe('ARAM');
  });
});
