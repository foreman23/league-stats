import React from 'react';

// Hover card for a summoner name: profile icon + name #tag. Expects a lane
// view-model player/actor ({ name, tag, profilePic }); the icon comes from the
// match data, so there's no extra lookup. Shared by the lane card and CS graph.
export default function NameTip({ player }) {
  return (
    <span className="lpr-name-tip">
      {player.profilePic && <img className="lpr-name-tip-icon" src={player.profilePic} alt="" />}
      <span className="lpr-name-tip-text">
        <span className="lpr-name-tip-name">{player.name}</span>
        <span className="lpr-name-tip-tag">#{player.tag}</span>
      </span>
    </span>
  );
}
