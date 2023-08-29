import {createContext, useEffect, useRef, useState} from 'react'
import TrackPanel from '@/components/track-panel'

const TrackPanelContext = createContext(null) // Context for track panel

const TrackPanelProvider = ({children}) => {
    const [trackPanel, _setTrackPanel] = useState({ // Track panel state
        active: false, // Is track panel active
        type: null, // Type of track panel to show
    })
    const trackPanelRef = useRef(trackPanel) // Reference to the track panel
    const setTrackPanel = value => { // Update track panel
        _setTrackPanel(value)
        trackPanelRef.current = value
    }

    useEffect(() => {
        const handleKeyUp = e => {
            if (e.code === 'Escape' && trackPanelRef.current.active) setTrackPanel({...trackPanelRef.current, active: false}) // Close track panel if Esc key is pressed
        }

        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [])

    return (
        <TrackPanelContext.Provider value={[trackPanel, setTrackPanel]}>
            {children}
            {trackPanel.active ? <TrackPanel/> : ''}
        </TrackPanelContext.Provider>
    )
}

export {TrackPanelContext, TrackPanelProvider}