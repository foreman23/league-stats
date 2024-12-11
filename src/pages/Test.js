import { CircularProgress } from '@mui/material'
import React, { useEffect, useState } from 'react'

const Test = () => {

    const [storage, setStorage] = useState(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let gameData = JSON.parse(localStorage.getItem('gameData'))
        setStorage(gameData)
    }, [])

    useEffect(() => {
        if (storage) {
            console.log(storage)
            setIsLoading(false)
        }
    }, [storage])

    if (isLoading) {
        <CircularProgress color='warning'></CircularProgress>
    }

    else {
        return (
            <div>
                {storage.gameData.info.gameMode}
            </div>
        )
    }

}

export default Test