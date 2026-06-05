import {
  isSeaServer,
  getAccountCluster,
  getMatchCluster,
  regionValues,
} from '../utils/regions';

// Platform regions grouped by their expected routing, used across the suite.
const AMERICAS = ['na1', 'br1', 'la1', 'la2'];
const EUROPE = ['eun1', 'euw1', 'tr1', 'ru'];
const ASIA_CORE = ['kr', 'jp1']; // asia for BOTH account and match clusters
const SEA = ['oc1', 'ph2', 'sg2', 'th2', 'tw2', 'vn2']; // asia for account, sea for match

describe('isSeaServer', () => {
  it.each(SEA)('returns true for SEA platform %s', (p) => {
    expect(isSeaServer(p)).toBe(true);
  });

  it.each([...AMERICAS, ...EUROPE, ...ASIA_CORE])(
    'returns false for non-SEA platform %s',
    (p) => {
      expect(isSeaServer(p)).toBe(false);
    }
  );

  it('returns false for unknown/garbage input', () => {
    expect(isSeaServer('zzz')).toBe(false);
    expect(isSeaServer(undefined)).toBe(false);
    expect(isSeaServer('')).toBe(false);
  });
});

describe('getAccountCluster (account-v1: americas | asia | europe)', () => {
  it.each(AMERICAS)('maps %s -> americas', (p) => {
    expect(getAccountCluster(p)).toBe('americas');
  });

  it.each(EUROPE)('maps %s -> europe', (p) => {
    expect(getAccountCluster(p)).toBe('europe');
  });

  it.each(ASIA_CORE)('maps core-asia %s -> asia', (p) => {
    expect(getAccountCluster(p)).toBe('asia');
  });

  it.each(SEA)('routes SEA platform %s through asia (no sea cluster for accounts)', (p) => {
    expect(getAccountCluster(p)).toBe('asia');
  });

  it('returns null for unknown platforms', () => {
    expect(getAccountCluster('zzz')).toBeNull();
    expect(getAccountCluster(undefined)).toBeNull();
  });
});

describe('getMatchCluster (match-v5: americas | sea | asia | europe)', () => {
  it.each(AMERICAS)('maps %s -> americas', (p) => {
    expect(getMatchCluster(p)).toBe('americas');
  });

  it.each(EUROPE)('maps %s -> europe', (p) => {
    expect(getMatchCluster(p)).toBe('europe');
  });

  it.each(ASIA_CORE)('maps core-asia %s -> asia', (p) => {
    expect(getMatchCluster(p)).toBe('asia');
  });

  it.each(SEA)('splits SEA platform %s into its own sea cluster', (p) => {
    expect(getMatchCluster(p)).toBe('sea');
  });

  it('returns null for unknown platforms', () => {
    expect(getMatchCluster('zzz')).toBeNull();
    expect(getMatchCluster(undefined)).toBeNull();
  });
});

describe('account vs match cluster divergence', () => {
  // The whole reason there are two functions: SEA accounts route through asia
  // but their matches route through sea.
  it.each(SEA)('%s is asia for accounts but sea for matches', (p) => {
    expect(getAccountCluster(p)).toBe('asia');
    expect(getMatchCluster(p)).toBe('sea');
  });

  it.each([...AMERICAS, ...EUROPE, ...ASIA_CORE])(
    'non-SEA platform %s resolves to the same cluster for both',
    (p) => {
      expect(getAccountCluster(p)).toBe(getMatchCluster(p));
    }
  );
});

describe('regionValues dropdown map', () => {
  it('maps the dropdown number to the correct platform code', () => {
    expect(regionValues[10]).toBe('na1');
    expect(regionValues[20]).toBe('euw1');
    expect(regionValues[70]).toBe('oc1'); // OCE special case
    expect(regionValues[110]).toBe('kr');
    expect(regionValues[160]).toBe('vn2');
  });

  it('covers all 16 regions with unique platform codes', () => {
    const codes = Object.values(regionValues);
    expect(codes).toHaveLength(16);
    expect(new Set(codes).size).toBe(16);
  });

  it('every dropdown value resolves to a known routing cluster', () => {
    Object.values(regionValues).forEach((platform) => {
      expect(getAccountCluster(platform)).not.toBeNull();
      expect(getMatchCluster(platform)).not.toBeNull();
    });
  });
});
