import VideoPlayer from "./components/videoPlayer";
import './App.css';

const manifest = {
    objects: [
        { url: "videos/150330.000000_primary_d61.mp4" },
        { url: "videos/150431.000000_primary_d60.mp4" },
        { url: "videos/150531.000000_primary_d60.mp4" },
        { url: "videos/150631.000000_primary_d60.mp4" },
        { url: "videos/150731.000000_primary_d60.mp4" },
        { url: "videos/150831.000000_primary_d60.mp4" },
        { url: "videos/150931.000000_primary_d60.mp4" },
        { url: "videos/151031.000000_primary_d62.mp4" },
        { url: "videos/151133.000000_primary_d60.mp4" },
        { url: "videos/151233.000000_primary_d60.mp4" },
    ],
};

function App() {
    return (
        <div className="app">
            <div className=" bg-card">
                <div className="flex flex-col space-y-1.5 p-2">
                    <h3 className="text-xl font-semibold text-center">Video Sequence Player</h3>
                </div>
                <div className="pt-0">
                    <VideoPlayer segments={manifest.objects} />
                </div>
            </div>
        </div>
    );
}

export default App;
