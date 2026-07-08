import React from 'react';
import { buildStandouts } from './standoutsPhase/standoutAdapter';
import StandoutsCard from './standoutsPhase/StandoutsCard';

const Standout = (props) => {
  const { gameData, champsJSON, dataDragonVersion } = props;

  const standouts = buildStandouts(gameData, champsJSON, dataDragonVersion);
  if (!standouts.length) return null;

  return (
    <StandoutsCard
      standouts={standouts}
      version={dataDragonVersion}
      platformId={gameData.info.platformId}
    />
  );
};

export default Standout;
