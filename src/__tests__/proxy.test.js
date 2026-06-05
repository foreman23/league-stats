import axios from 'axios';
import {
  getFeaturedGame,
  getPuuid,
  getSummoner,
  getRanked,
  getHistory,
  getMatchInfo,
  getMatchTimeline,
  getMastery,
} from '../api/proxy';

// Factory mock so the real (ESM) axios is never loaded by Jest.
jest.mock('axios', () => ({ __esModule: true, default: { get: jest.fn() } }));

const base = process.env.REACT_APP_REST_URL; // may be undefined in test env; we assert on the path/query portion

beforeEach(() => {
  axios.get.mockReset();
  axios.get.mockResolvedValue({ data: {}, status: 200 });
});

const calledUrl = () => axios.get.mock.calls[0][0];

describe('proxy client builds correct endpoint URLs', () => {
  it('getFeaturedGame -> /featuredgame', () => {
    getFeaturedGame();
    expect(calledUrl()).toBe(`${base}/featuredgame`);
  });

  it('getPuuid -> /puuid with alternateRegion, summonerName, riotId', () => {
    getPuuid('americas', 'Faker', 'KR1');
    expect(calledUrl()).toBe(`${base}/puuid?alternateRegion=americas&summonerName=Faker&riotId=KR1`);
  });

  it('getSummoner -> /summoner with selectedRegion, puuid', () => {
    getSummoner('na1', 'PUUID123');
    expect(calledUrl()).toBe(`${base}/summoner?selectedRegion=na1&puuid=PUUID123`);
  });

  it('getRanked -> /ranked with selectedRegion, summonerId', () => {
    getRanked('euw1', 'SUM456');
    expect(calledUrl()).toBe(`${base}/ranked?selectedRegion=euw1&summonerId=SUM456`);
  });

  it('getHistory -> /history with alternateRegion, puuid', () => {
    getHistory('sea', 'PUUID123');
    expect(calledUrl()).toBe(`${base}/history?alternateRegion=sea&puuid=PUUID123`);
  });

  it('getMatchInfo -> /matchinfo with alternateRegion, matchId', () => {
    getMatchInfo('americas', 'NA1_123');
    expect(calledUrl()).toBe(`${base}/matchinfo?alternateRegion=americas&matchId=NA1_123`);
  });

  it('getMatchTimeline -> /matchtimeline with alternateRegion, matchId', () => {
    getMatchTimeline('asia', 'KR_999');
    expect(calledUrl()).toBe(`${base}/matchtimeline?alternateRegion=asia&matchId=KR_999`);
  });

  it('getMastery -> /mastery with default count of 3', () => {
    getMastery('na1', 'PUUID123');
    expect(calledUrl()).toBe(`${base}/mastery?selectedRegion=na1&puuid=PUUID123&count=3`);
  });

  it('getMastery -> /mastery honors an explicit count', () => {
    getMastery('na1', 'PUUID123', 5);
    expect(calledUrl()).toBe(`${base}/mastery?selectedRegion=na1&puuid=PUUID123&count=5`);
  });

  it('returns the axios response promise (callers use .data/.status)', async () => {
    const res = await getSummoner('na1', 'p');
    expect(res).toEqual({ data: {}, status: 200 });
  });
});
