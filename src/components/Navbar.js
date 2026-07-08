import React, { useEffect, useState } from 'react';
import NavSearch from './NavSearch';
import SummonerName from './SummonerName';
import { useMatchNavContext } from '../hooks/useMatchNavContext';

// Site navbar — slim white sticky bar. On match pages (which publish their
// context via useMatchNavContext) it doubles as the match context bar: once
// the page header scrolls away, the viewed player + team pill + result +
// section nav fade into the middle of this same bar. One persistent bar, no
// two-bar handoff. Search / region / favorites live in NavSearch.

const NAV = [
    ['Details', 'DetailsAnchor'],
    ['Laning', 'LaningAnchor'],
    ['Graphs', 'GraphsAnchor'],
    ['Battles', 'TeamfightsAnchor'],
    ['Builds', 'BuildsAnchor'],
];

const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function Navbar({ dataDragonVersion }) {
    const match = useMatchNavContext();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (!match) {
            setScrolled(false);
            return undefined;
        }
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                setScrolled(window.scrollY > 360);
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, [match]);

    const showCtx = Boolean(match) && scrolled;
    const blue = match?.teamId === 100;

    return (
        <header className="nvb">
            <div className="nvb-inner">
                <a href="/" className="nvb-brand" aria-label="RiftReport home">
                    <img alt="RiftReport logo" src="/images/spiritMage.webp" />
                    <span>RR.GG</span>
                </a>
                <div className={'nvb-ctx' + (showCtx ? ' nvb-ctx-show' : '')} aria-hidden={!showCtx}>
                    {match && (
                        <>
                            <img
                                className="mcb-champ"
                                style={{ '--mcb-ring': blue ? '#568CFF' : '#A35BFF' }}
                                src={match.champImg}
                                alt=""
                            />
                            <SummonerName participant={match.player} version={match.version} platformId={match.platformId} className="mcb-name">
                                {match.player.riotIdGameName}
                            </SummonerName>
                            <span className={'mcb-team ' + (blue ? 'mcb-blue' : 'mcb-purple')}>{blue ? 'Blue' : 'Purple'} Team</span>
                            <span className={'mcb-res ' + (match.win ? 'mcb-win' : 'mcb-loss')}>{match.win ? 'Victory' : 'Defeat'}</span>
                            <nav className="mcb-nav">
                                {NAV.map(([label, id]) => (
                                    <button key={id} onClick={() => scrollTo(id)}>{label}</button>
                                ))}
                            </nav>
                        </>
                    )}
                </div>
                <NavSearch dataDragonVersion={dataDragonVersion} />
            </div>
        </header>
    );
}

export default Navbar;
