import { championImg, itemImg, spellImg, profileIconImg } from '../api/ddragon';

const V = '14.1.1';
const BASE = `https://ddragon.leagueoflegends.com/cdn/${V}/img`;

describe('DataDragon image URL builders', () => {
  it('championImg builds the champion icon URL', () => {
    expect(championImg(V, 'Zyra')).toBe(`${BASE}/champion/Zyra.png`);
  });

  it('itemImg builds the item icon URL', () => {
    expect(itemImg(V, 3157)).toBe(`${BASE}/item/3157.png`);
  });

  it('spellImg builds the summoner-spell icon URL', () => {
    expect(spellImg(V, 'SummonerFlash')).toBe(`${BASE}/spell/SummonerFlash.png`);
  });

  it('profileIconImg builds the profile-icon URL', () => {
    expect(profileIconImg(V, 4567)).toBe(`${BASE}/profileicon/4567.png`);
  });

  it('matches the exact inline format that was previously hand-built', () => {
    // byte-for-byte equality with the old inline template string
    const id = 'Aatrox';
    expect(championImg(V, id)).toBe(
      `https://ddragon.leagueoflegends.com/cdn/${V}/img/champion/${id}.png`
    );
  });
});
