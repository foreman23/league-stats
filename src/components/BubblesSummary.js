import React from 'react'
import { Box } from '@mui/material'
import StyledTooltip from './StyledTooltip';
import { useHoveredLane, setHoveredLane } from '../hooks/useLaneHover';

const BubblesSummary = (props) => {

    const { statsAt15, gameData } = props

    // Cross-highlight: hovering a short-summary lane phrase OR a lane bubble dims
    // the other lane bubbles to draw the eye to the matching one.
    const hoveredLane = useHoveredLane();
    const laneOpacity = (lane) => (hoveredLane && hoveredLane !== lane ? 0.3 : 1);
    const laneStyle = (lane) => ({ opacity: laneOpacity(lane), transition: 'opacity 0.15s ease' });
    const laneHover = (lane) => ({
        onMouseEnter: () => setHoveredLane(lane),
        onMouseLeave: () => setHoveredLane(null),
    });

    // Handle section button click
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        }
    }

    return (
        <div className='BubbleSummaryContainer'>

            <div className='BubbleSummarySubContainer1'>
                <StyledTooltip disableInteractive placement='top' title={statsAt15.laneResults.TOP.resTag === 'draw'
                    ? 'Top laning phase was even'
                    : `${statsAt15.laneResults.TOP.teamWonLane === 100 ? 'Blue' : 'Purple'} team ${statsAt15.laneResults.TOP.resTag} lane in top`}>
                    <div className='bubblesContainer pointer' onClick={() => scrollToSection('LaningAnchor')} {...laneHover('TOP')} style={laneStyle('TOP')}>
                        <img alt='Lane' src='/images/laneIcons/TopLane.png'></img>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 0 ? statsAt15.laneResults.TOP.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 1 ? statsAt15.laneResults.TOP.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 2 ? statsAt15.laneResults.TOP.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 3 ? statsAt15.laneResults.TOP.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.TOP.bubbleCount > 4 ? statsAt15.laneResults.TOP.bubbleColor : '#d1d1d1', borderRadius: '100%' }}></Box>
                    </div>
                </StyledTooltip>

                <StyledTooltip disableInteractive placement='top' title={statsAt15.laneResults.MIDDLE.resTag === 'draw'
                    ? 'Middle laning phase was even'
                    : `${statsAt15.laneResults.MIDDLE.teamWonLane === 100 ? 'Blue' : 'Purple'} team ${statsAt15.laneResults.MIDDLE.resTag} lane in middle`}>
                    <div className='bubblesContainer pointer' onClick={() => scrollToSection('LaningAnchor')} {...laneHover('MIDDLE')} style={{ display: 'flex', alignItems: 'center', ...laneStyle('MIDDLE') }}>
                        <img alt='Lane' style={{ width: '28px', marginRight: '3px' }} src='/images/laneIcons/Middle.png'></img>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 0 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 1 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 2 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 3 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.MIDDLE.bubbleCount > 4 ? statsAt15.laneResults.MIDDLE.bubbleColor : '#d1d1d1', borderRadius: '100%' }}></Box>
                    </div>
                </StyledTooltip>
            </div>

            <div className='BubbleSummarySubContainer2'>
                <StyledTooltip disableInteractive placement='top' title={statsAt15.laneResults.JUNGLE.resTag === 'draw'
                    ? 'Early jungle was even'
                    : `${statsAt15.laneResults.JUNGLE.teamWonLane === 100 ? 'Blue' : 'Purple'} team ${statsAt15.laneResults.JUNGLE.resTag} in early jungle`}>
                    <div className='bubblesContainer pointer' onClick={() => scrollToSection('LaningAnchor')} {...laneHover('JUNGLE')} style={{ display: 'flex', alignItems: 'center', ...laneStyle('JUNGLE') }}>
                        <img alt='Lane' style={{ width: '28px', marginRight: '3px' }} src='/images/laneIcons/Jungle.png'></img>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 0 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 1 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 2 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 3 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.JUNGLE.bubbleCount > 4 ? statsAt15.laneResults.JUNGLE.bubbleColor : '#d1d1d1', borderRadius: '100%' }}></Box>
                    </div>
                </StyledTooltip>

                <StyledTooltip disableInteractive placement='top' title={statsAt15.laneResults.BOTTOM.resTag === 'draw'
                    ? 'Bottom laning phase was even'
                    : `${statsAt15.laneResults.BOTTOM.teamWonLane === 100 ? 'Blue' : 'Purple'} team ${statsAt15.laneResults.BOTTOM.resTag} lane in bottom`}>
                    <div className='bubblesContainer pointer' onClick={() => scrollToSection('LaningAnchor')} {...laneHover('BOTTOM')} style={{ display: 'flex', alignItems: 'center', ...laneStyle('BOTTOM') }}>
                        <img alt='Lane' style={{ width: '28px', marginRight: '3px' }} src='/images/laneIcons/Bottom.png'></img>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 0 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 1 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 2 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 3 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', borderRadius: '100%', marginRight: '3px' }}></Box>
                        <Box height={'16px'} width={'16px'} style={{ backgroundColor: statsAt15.laneResults.BOTTOM.bubbleCount > 4 ? statsAt15.laneResults.BOTTOM.bubbleColor : '#d1d1d1', borderRadius: '100%' }}></Box>
                    </div>
                </StyledTooltip>
            </div>

            <StyledTooltip className='hideTablet hideMobile' disableInteractive placement='top' title={`${gameData.info.teams.find(team => team.teamId === 100).win ? 'Blue' : 'Purple'} team won the game`}>
                <div className='hideTablet hideMobile' style={{ display: 'flex', alignItems: 'end', position: 'relative', marginBottom: '2px' }}>
                    <img alt='Winner' style={{ width: '44px', position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)' }} src='/images/crown.svg'></img>
                    <Box height={'40px'} width={'40px'} style={{ backgroundColor: gameData.info.teams.find(team => team.teamId === 100).win ? '#568CFF' : '#A35BFF', borderRadius: '100%' }}></Box>
                </div>
            </StyledTooltip>

        </div>
    )
}

export default BubblesSummary