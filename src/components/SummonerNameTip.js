import React from 'react';

// The standard summoner hover-card CONTENT (profile icon + name #tag), used as a
// tooltip `title`. `iconUrl` is a ready profile-icon URL, e.g.
// profileIconImg(version, participant.profileIcon). Used by SummonerName and by
// the champion-portrait/graph-icon tooltips so every name hover looks the same.
export default function SummonerNameTip({ name, tag, iconUrl }) {
  return (
    <span className="summonerNameTip">
      {iconUrl && <img className="summonerNameTip-icon" src={iconUrl} alt="" />}
      <span className="summonerNameTip-text">
        <span className="summonerNameTip-name">{name}</span>
        <span className="summonerNameTip-tag">#{tag}</span>
      </span>
    </span>
  );
}
