import React from 'react';
import { profileIconImg } from '../api/ddragon';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CloseIcon from '@mui/icons-material/Close';

function SummonerCard({ summoner, dataDragonVersion, type, onRemove }) {
  const formatRank = (rank) => {
    if (!rank) return 'Unranked';
    const parts = rank.split(' ');
    return parts[0].charAt(0) + parts[0].substring(1).toLowerCase() + ' ' + parts[1];
  };

  return (
    <div className="summoner-card">
      <button 
        className={`remove-button ${type}`}
        onClick={(e) => {
          e.preventDefault();
          onRemove(summoner);
        }}
        aria-label={`Remove ${summoner.summonerName} from ${type}`}
      >
        {type === 'favorite' ? <FavoriteIcon /> : <CloseIcon />}
      </button>
      
      <a 
        className="summoner-card-link" 
        href={`/profile/${summoner.selectedRegion}/${summoner.summonerName}/${summoner.riotId}`}
      >
        <img 
          alt="Summoner Icon" 
          className="summoner-icon"
          src={profileIconImg(dataDragonVersion, summoner.icon)}
        />
        
        <div className="summoner-info">
          <div className="summoner-name-container">
            <span className="summoner-name">{summoner.summonerName}</span>
            <span className="summoner-tag">#{summoner.riotId}</span>
          </div>
          
          <div className="summoner-details">
            <span>Level {summoner.level}</span>
            <span className={`summoner-rank ${!summoner.rank ? 'unranked' : ''}`}>
              {formatRank(summoner.rank)}
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

export default SummonerCard;