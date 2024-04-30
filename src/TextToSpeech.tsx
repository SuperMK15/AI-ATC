import { useState, useEffect } from "react";

const TextToSpeech = ({ text }: { text: string }) => {
    const [pitch, setPitch] = useState(1.5);
    const [rate, setRate] = useState(1.5);
    const [volume, setVolume] = useState(1);

    useEffect(() => {
        const synth: SpeechSynthesis = window.speechSynthesis;
        const u: SpeechSynthesisUtterance = new SpeechSynthesisUtterance(text);
        const voices: SpeechSynthesisVoice[] = synth.getVoices();

        if (u) {
            u.voice = voices[3];
            u.pitch = pitch;
            u.rate = rate;
            u.volume = volume;
            synth.speak(u);
        }
    }, [text]);

    {/*const handleVoiceChange = (event: { target: { value: string; }; }) => {
        const voices = window.speechSynthesis.getVoices();
        setVoice(voices.find((v) => v.name === event.target.value) || null);
    };*/}

    const handlePitchChange = (event: { target: { value: string; }; }) => {
        setPitch(parseFloat(event.target.value));
    };

    const handleRateChange = (event: { target: { value: string; }; }) => {
        setRate(parseFloat(event.target.value));
    };

    const handleVolumeChange = (event: { target: { value: string; }; }) => {
        setVolume(parseFloat(event.target.value));
    };

    return (
        <div className="text-white">
            {/*<label>
                Voice:
                <select value={voice?.name} onChange={handleVoiceChange} className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600">
                    {window.speechSynthesis.getVoices().map((voice) => (
                        <option key={voice.name} value={voice.name}>
                            {voice.name}
                        </option>
                    ))}
                </select>
            </label>

            <br />*/}

            <div className="bg-gray-800 p-4 rounded-md text-center w-full">

                <label className="flex flex-row items-center justify-start mb-4">
                    <p className="text-lg font-semibold mr-2">Pitch:</p>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        className="flex-grow"
                        value={pitch}
                        onChange={handlePitchChange}
                    />
                </label>

                <label className="flex flex-row items-center justify-start mb-4">
                    <p className="text-lg font-semibold mr-2">Speed:</p>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        className="flex-grow"
                        value={rate}
                        onChange={handleRateChange}
                    />
                </label>

                <label className="flex flex-row items-center justify-start">
                    <p className="text-lg font-semibold mr-2">Volume:</p>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        className="flex-grow"
                        value={volume}
                        onChange={handleVolumeChange}
                    />
                </label>

            </div>

            {/*<br />

            <button onClick={handlePlay} className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600">{isPaused ? "Resume" : "Play"}</button>
            <button onClick={handlePause} className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600">Pause</button>
            <button onClick={handleStop} className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600">Stop</button>*/}
        </div>
    );
};

export default TextToSpeech;
