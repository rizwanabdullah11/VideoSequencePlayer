import { useState, useEffect, useRef } from "react";
import './video.css';

const VideoPlayer = ({ segments }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isBuffering, setIsBuffering] = useState(true);
    const [progress, setProgress] = useState(0);
    
    const videoRef1 = useRef(null);
    const videoRef2 = useRef(null);
    const containerRef = useRef(null);
    const isTransitioning = useRef(false);
    const preloadedVideos = useRef(new Set());

    // Preload function to handle video preloading
    const preloadVideo = (index) => {
        if (index >= segments.length || preloadedVideos.current.has(index)) return;
        
        console.log(`Preloading video ${index}: ${segments[index].url}`);
        
        // Add to preloaded set to avoid duplicate preloading
        preloadedVideos.current.add(index);
        
        // Create a temporary video element for preloading
        const tempVideo = document.createElement('video');
        tempVideo.src = segments[index].url;
        tempVideo.preload = 'auto';
        
        // Listen for enough data to ensure smooth playback
        tempVideo.addEventListener('canplaythrough', () => {
            console.log(`Video ${index} preloaded successfully`);
        }, { once: true });
        
        // Load the video data
        tempVideo.load();
    };

    // Initialize the first video and preload the second
    useEffect(() => {
        console.log("segments:", segments);
        if (!segments.length) return;
        
        const video = videoRef1.current;
        if (!video) return;
        
        // Reset preloaded videos when segments change
        preloadedVideos.current = new Set();
        
        // Load the first video
        video.src = segments[0].url;
        video.load();
        
        video.oncanplay = () => {
            setIsBuffering(false);
            video.play().catch(err => console.error("Playback error:", err));
            
            // Preload the next 2 videos in the sequence
            if (segments.length > 1) {
                preloadVideo(1);
            }
            if (segments.length > 2) {
                preloadVideo(2);
            }
        };
        
        return () => {
            video.oncanplay = null;
        };
    }, [segments]);

    // Handle video transitions and preloading of upcoming videos
    useEffect(() => {
        console.log("Current Index:", currentIndex);
        if (!segments.length) return;
        
        const currentVideo = currentIndex % 2 === 0 ? videoRef1.current : videoRef2.current;
        const nextVideo = currentIndex % 2 === 0 ? videoRef2.current : videoRef1.current;
        
        if (!currentVideo || !nextVideo) return;
        
        // Ensure the current video is visible and the next is hidden
        currentVideo.style.display = 'block';
        nextVideo.style.display = 'none';
        
        const handleTimeUpdate = () => {
            if (currentVideo.duration) {
                setProgress((currentVideo.currentTime / currentVideo.duration) * 100);
            }
            
            // Start transition when approaching the end of current video
            const transitionThreshold = 0.5; // seconds before end
            if (!isTransitioning.current && 
                currentVideo.duration - currentVideo.currentTime < transitionThreshold && 
                currentIndex + 1 < segments.length) {
                
                isTransitioning.current = true;
                
                // Prepare the next video
                nextVideo.src = segments[currentIndex + 1].url;
                nextVideo.load();
                
                // Preload videos further in the sequence
                preloadVideo(currentIndex + 2);
                preloadVideo(currentIndex + 3);
                
                const handleEnded = () => {
                    // Switch videos
                    currentVideo.style.display = 'none';
                    nextVideo.style.display = 'block';
                    
                    // Play the next video immediately
                    nextVideo.play().catch(err => console.error("Error playing next video:", err));
                    
                    // Update the current index
                    setCurrentIndex(prevIndex => prevIndex + 1);
                    isTransitioning.current = false;
                };
                
                currentVideo.addEventListener('ended', handleEnded, { once: true });
                
                return () => {
                    currentVideo.removeEventListener('ended', handleEnded);
                };
            }
        };
        
        // Listen for time updates to track progress and handle transitions
        currentVideo.addEventListener('timeupdate', handleTimeUpdate);
        
        // Handle errors during playback
        const handleError = (e) => {
            console.error(`Error with video ${currentIndex}:`, e);
            // If there's an error, try to move to the next video
            if (currentIndex + 1 < segments.length) {
                setCurrentIndex(currentIndex + 1);
            }
        };
        
        currentVideo.addEventListener('error', handleError);
        
        return () => {
            currentVideo.removeEventListener('timeupdate', handleTimeUpdate);
            currentVideo.removeEventListener('error', handleError);
        };
    }, [currentIndex, segments]);

    return (
        <div className="video-container max-w-4xl pt-2 mx-auto">
            <div ref={containerRef} className="video-wrapper relative w-full h-auto">
                {isBuffering && <div className="loading-indicator"></div>}
                
                <video
                    ref={videoRef1}
                    className="w-full h-auto"
                    style={{
                        display: currentIndex % 2 === 0 ? 'block' : 'none'
                    }}
                    playsInline
                    muted={false}
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                />
                
                <video
                    ref={videoRef2}
                    className="w-full h-auto"
                    style={{
                        display: currentIndex % 2 === 1 ? 'block' : 'none'
                    }}
                    playsInline
                    muted={false}
                    controls
                    controlsList="nodownload nofullscreen noremoteplayback noplaybackrate"
                />
            </div>
        </div>
    );
};

export default VideoPlayer;