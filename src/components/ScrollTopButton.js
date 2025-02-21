import React from 'react'
import { useState, useEffect } from 'react'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';

const ScrollTopButton = () => {

    const [visible, setVisible] = useState(false);
    // const [fadeOutFlag, setFadeOutFlag] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 250) {
                setVisible(true);
                // setFadeOutFlag(false);
            }
            else {
                setVisible(false);
            }
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => window.removeEventListener("scroll", toggleVisibility);
    }, [visible]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        visible &&
        <div onClick={() => scrollToTop()} className={`scrollTop fadein`}>
            <KeyboardArrowUpRoundedIcon className='scrollTopBtn'></KeyboardArrowUpRoundedIcon>
        </div>
    )
}

export default ScrollTopButton