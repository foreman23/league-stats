import { Button } from '@mui/material';
import React from 'react'
import { useNavigate } from 'react-router-dom'

function GameDetails() {

  // Init navigate
  const navigate = useNavigate();

  return (
    <div>
      GameDetails
      <Button onClick={() => navigate(-1)}>Back</Button>
    </div>
  )
}

export default GameDetails