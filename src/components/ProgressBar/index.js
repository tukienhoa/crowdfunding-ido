import React from 'react'

const Progress_bar = ({ bgcolor, progress, height }) => {

    const Parentdiv = {
        height: height,
        width: 420,
        backgroundColor: 'whitesmoke',
        borderRadius: 40,
    }

    const Childdiv = {
        height: '100%',
        width: `${progress < 100 ? progress : 100}%`,
        backgroundColor: bgcolor,
        borderRadius: 40,
        textAlign: 'right',
        paddingTop: 6
    }

    const progresstext = {
        padding: 10,
        color: 'black',
        fontWeight: 900,
        textAlign: 'center'
    }

    return (
        <div style={Parentdiv}>
            <div style={Childdiv}>
                <span style={progresstext}>{`${progress}%`}</span>
            </div>
        </div>
    )
}

export default Progress_bar;