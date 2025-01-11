import React from 'react'
import { PieChart } from '@mui/x-charts/PieChart';

const DamagePie = (props) => {

    let blueColors = [
        '#568CFF', // Lightest
        '#5081E8',
        '#4A76D2',
        '#456BBB',
        '#3F60A5' // Darkest
    ]

    let redColors = [
        '#FF3F3F',  // Lightest
        '#E83B3B',
        '#D23838',
        '#BB3535',
        '#A53131' // Darkest
    ]

    let participants = props.participants
    let data = []
    if (props.type === 'given') {
        let blueIndex = 0
        let redIndex = 0
        for (let i = 0; i < participants.length; i++) {
            let currObj = {
                id: i,
                value: participants[i].totalDamageDealtToChampions,
                label: `${participants[i].riotIdGameName} (${participants[i].championName})`,
                color: participants[i].teamId === 100 ? blueColors[blueIndex] : redColors[redIndex]
            }
            if (participants[i].teamId === 100) {
                blueIndex += 1
            }
            else if (participants[i].teamId === 200) {
                redIndex += 1
            }
            data.push(currObj)
        }
    }
    else if (props.type === 'taken') {
        let blueIndex = 0
        let redIndex = 0
        for (let i = 0; i < participants.length; i++) {
            let currObj = {
                id: i,
                value: participants[i].totalDamageTaken,
                label: `${participants[i].riotIdGameName} (${participants[i].championName})`,
                color: participants[i].teamId === 100 ? blueColors[blueIndex] : redColors[redIndex]
            }
            if (participants[i].teamId === 100) {
                blueIndex += 1
            }
            else if (participants[i].teamId === 200) {
                redIndex += 1
            }
            data.push(currObj)
        }
    }

    return (
        <svg viewBox={`0 0 180 200`} width={'200px'} height={'200px'}>
            <foreignObject width="100%" height="100%">
                <PieChart
                    series={[
                        {
                            data: data
                        },
                    ]}
                    slotProps={{
                        legend: {
                            hidden: true
                        },
                    }}
                    width={255}
                    height={200}
                />
            </foreignObject>
        </svg>

    )
}

export default DamagePie