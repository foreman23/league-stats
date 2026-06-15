import React from 'react';
import StyledTooltip from './StyledTooltip';
import SummonerNameTip from './SummonerNameTip';
import { profileIconImg } from '../api/ddragon';

// The one standardized way to render a summoner name across the match pages:
// a team-colored profile link with a hover card showing the profile icon +
// name #tag. Pass a `participant` (any object with riotIdGameName /
// riotIdTagline / teamId / profileIcon) or the explicit fields; `version` and
// `platformId` come from the page (DataDragon version + gameData.info.platformId).
export default function SummonerName({
  participant,
  name,
  tag,
  teamId,
  profileIcon,
  version,
  platformId,
  color,
  className = '',
  style,
  children,
}) {
  const gName = name ?? participant?.riotIdGameName;
  const gTag = tag ?? participant?.riotIdTagline;
  const tId = teamId ?? participant?.teamId;
  const icon = profileIcon ?? participant?.profileIcon;

  const href = `/profile/${String(platformId).toLowerCase()}/${gName}/${String(gTag).toLowerCase()}`;
  const linkColor = color || (tId === 200 ? '#8A3FE6' : tId === 100 ? '#0089D6' : undefined);
  const iconUrl = icon != null && version ? profileIconImg(version, icon) : null;

  const tip = <SummonerNameTip name={gName} tag={gTag} iconUrl={iconUrl} />;

  return (
    <StyledTooltip placement="top" disableInteractive title={tip}>
      <a className={('summonerName ' + className).trim()} href={href} style={{ color: linkColor, ...style }}>
        {children ?? gName}
      </a>
    </StyledTooltip>
  );
}
