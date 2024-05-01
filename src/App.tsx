import { useEffect, useState } from 'react'
import TextToSpeech from './TextToSpeech.tsx';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { CohereClient } from "cohere-ai";
import { ChatMessage } from 'cohere-ai/api/index';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import SyncLoader from "react-spinners/SyncLoader";

function App() {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const [gettingSetupData, setGettingSetupData] = useState(true);
  const [towerName, setTowerName] = useState(localStorage.getItem('towerName') || '');
  const [aircraftCode, setAircraftCode] = useState(localStorage.getItem('aircraftCode') || '');
  const [scenario, setScenario] = useState(localStorage.getItem('scenario') || '');

  const [loadingAIConfig, setLoadingAIConfig] = useState(false);
  const [doneLoadingAIConfig, setDoneLoadingAIConfig] = useState(false);
  const [AIChatHistory, setAIChatHistory] = useState([] as ChatMessage[]);

  const [sendRecordingToAI, setSendRecordingToAI] = useState(false);
  const [cohere] = useState(new CohereClient({ token: import.meta.env.VITE_COHERE_API_KEY }));
  const [recording, setRecording] = useState('');
  const [responseFromAI, setResponseFromAI] = useState('');

  const ai_preamble =
    "## Task & Context\n" +
    "In this conversation, you will act as an ATC tower, and use appropriate diction.\n" +
    "Your Tower Name Is: " +
    towerName +
    ".\n" +
    "The aircraft you will be communicating with is: " +
    aircraftCode +
    ".\n" +
    "The scenario is as follows: " +
    scenario +
    "\n." +
    "\n## Style Guide\n" +
    "Whenever you give numbers (Ex. runway number, winds, etc.) you should give the number in words. For example, runway 27 should be said as runway two seven, and 270 should be said as two seven zero.\n" +
    "Additionally, you should use the NATO phonetic alphabet when spelling out things like aircraft identifiers and tower codes. For example, C-GABC should be given as Charlie Golf Alpha Bravo Charlie, and YYZ should be given as Yankee Yankee Zulu.\n" +
    "\n## Example Interactions\n" +
    "Interaction 1:\n" +
    "Pilot: Ground, Cessna 172 GHWK with information [ATIS] for [circuits, departure to the north/east/south/west]\n" +
    "ATC: Hotel Whiskey Kilo, squawk [4 digit number], runway [number], taxi via [taxiway], hold short runway [number], contact Tower [frequency]\n" +
    "Pilot: *will readback. If correct, ATC stays silent. If not, ATC corrects*\n";

    useEffect(() => {
      const setupCohere = async () => {
        try {
          // console.log("Generating result...");
          const res = await cohere.chat({
            message: "Respond with \"This is" + towerName + ", up and active.\" if you are ready to begin.",
            preamble: ai_preamble,
            connectors: [{ "id": "web-search" }],
            temperature: 0.15,
            chatHistory: [],
            maxTokens: 10,
          })
          // console.log("Result:", res);
          setResponseFromAI(res.text);
          if (res.chatHistory) setAIChatHistory(res.chatHistory);
          setDoneLoadingAIConfig(true);
        } catch (error) {
          console.error("Error fetching result:", error)
        }
      }

      if (!gettingSetupData && loadingAIConfig && !doneLoadingAIConfig) {
        setupCohere();
        setLoadingAIConfig(false);
      }
    }, [gettingSetupData, loadingAIConfig]);

  useEffect(() => {
    if (!listening && !gettingSetupData && transcript) {
      setSendRecordingToAI(true);
      setRecording(transcript);
      resetTranscript();
    }
  }, [listening, transcript, gettingSetupData, resetTranscript]);

  useEffect(() => {
    const getAIGeneration = async () => {
      // console.log ("AI Chat History:", AIChatHistory);
      try {
        // console.log("Generating result...");
        const res = await cohere.chat({
          message: recording,
          preamble: ai_preamble,
          connectors: [{ "id": "web-search" }],
          temperature: 0.15,
          chatHistory: AIChatHistory ? AIChatHistory : [],
          maxTokens: 200,
        })
        // console.log("Result:", res);
        if (res.text == responseFromAI) setResponseFromAI(res.text + " ");
        else setResponseFromAI(res.text);

        setSendRecordingToAI(false);
        if (res.chatHistory) setAIChatHistory(res.chatHistory);
      } catch (error) {
        console.error("Error fetching result:", error)
      }
    }

    if (sendRecordingToAI) {
      // console.log('Recording:', recording);
      getAIGeneration();
    }
  }, [sendRecordingToAI, recording, responseFromAI]);

  useEffect(() => {
    // force the browser to speak the response from AI
  }, [responseFromAI]);

  if (gettingSetupData) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
        <div className="flex flex-col items-center justify-center">
          <form className="bg-gray-800 p-8 rounded-md text-center w-full">
            <h1 className="text-3xl font-bold mb-6">Welcome to ATC.AI!</h1>

            <div className="flex flex-row items-center justify-start mb-4">
              <p className="text-lg font-semibold mr-2">Tower Name:</p>
              <input
                type="text"
                placeholder="Name"
                className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600 flex-grow"
                value={towerName}
                onChange={(e) => setTowerName(e.target.value)}
              />
            </div>

            <div className="flex flex-row items-center justify-start">
              <p className="text-lg font-semibold mr-2">Aircraft Code:</p>
              <input
                type="text"
                placeholder="X-XXXX"
                className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600 flex-grow"
                value={aircraftCode}
                onChange={(e) => setAircraftCode(e.target.value)}
              />
            </div>

            <div className="items-center justify-start mt-6">
              <p className="text-lg font-semibold mr-2">Scenario:</p>
              <textarea
                placeholder="Enter the ATC scenario here..."
                className="bg-gray-700 text-white px-4 py-2 rounded-md m-1 hover:bg-gray-600 w-full h-20"
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
              ></textarea>
            </div>

            <button
              className="bg-blue-700 w-full text-white px-4 py-2 rounded-md m-1 hover:bg-blue-500 mt-6 disabled:opacity-50"
              type="submit"
              onClick={(e) =>
              (e.preventDefault(),
                setGettingSetupData(false),
                setLoadingAIConfig(true),
                resetTranscript(),
                localStorage.setItem('towerName', towerName),
                localStorage.setItem('aircraftCode', aircraftCode),
                localStorage.setItem('scenario', scenario),
                localStorage.setItem('gettingSetupData', 'false'))}
              disabled={!towerName || !aircraftCode || !scenario}
            > Start </button>
          </form>
        </div>
      </div>
    );
  } else if (loadingAIConfig && !doneLoadingAIConfig) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
        <SyncLoader color="#ffffff" loading={true} size={15} />
      </div>
    );
  }

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="flex items-center justify-center bg-gray-900 text-white min-h-screen">
        <p className="text-gray-300 text-2xl">Browser doesn't support speech recognition.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button className="absolute top-0 left-0 m-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-400" onClick={() =>
      (setGettingSetupData(true),
        resetTranscript(),
        SpeechRecognition.stopListening(),
        setLoadingAIConfig(false),
        setDoneLoadingAIConfig(false),
        setAIChatHistory([] as ChatMessage[]),
        setSendRecordingToAI(false),
        setRecording(''),
        setResponseFromAI('')
      )}>
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" /> Back
      </button>
      <div className="flex items-center justify-center bg-gray-900 text-white ">
        <div className='flex flex-col items-center justify-center min-h-screen w-1/2 py-2 px-20 border-r-4 border-cyan-500'>
          <p className="text-2xl font-bold mb-5">Aircraft {aircraftCode}: {listening ? <span className='text-green'>mic on</span> : <span>mic off</span>}</p>
          {listening ?
            <button
              className="bg-red-700 text-white px-4 py-2 rounded-md m-1 hover:bg-red-500 w-1/2 disabled:opacity-50"
              disabled={!transcript}
              onClick={() => (SpeechRecognition.stopListening())}>Complete Tranmission</button> :
            <button className="bg-blue-700 text-white px-4 py-2 rounded-md m-1 hover:bg-blue-500 w-1/2" onClick={() => SpeechRecognition.startListening({ continuous: true, language: 'en-CA' })}>Begin Transmission</button>
          }
          <p>{transcript}</p>
        </div>

        <div className="flex flex-col items-center justify-center min-h-screen w-1/2 py-2 px-20">
          <h1 className='text-4xl font-bold mb-5'>{towerName}</h1>
          <TextToSpeech text={responseFromAI} />
          {sendRecordingToAI ?
            <><br /><SyncLoader color="#ffffff" loading={true} size={15} /></> :
            <p className='mt-4 text-lg text-center'>{responseFromAI}</p>}
        </div>
      </div>
    </div>
  );

}

export default App
