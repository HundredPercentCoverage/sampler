import React, { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import audioFileUrl from '../fart.ogg';

type Key = 'a' | 's' | 'd' | 'f' | 'g' | 'h' | 'j' | 'k';
type Note = 'C1' | 'D1' | 'E1' | 'F1' | 'G1' | 'A1' | 'B1' | 'C2';

interface INote {
  key: Key,
  note: Note
}

const notes: INote[] = [
  {
    key: 'a',
    note: 'C1'
  },
  {
    key: 's',
    note: 'D1'
  },
  {
    key: 'd',
    note: 'E1'
  },
  {
    key: 'f',
    note: 'F1'
  },
  {
    key: 'g',
    note: 'G1'
  },
  {
    key: 'h',
    note: 'A1'
  },
  {
    key: 'j',
    note: 'B1'
  },
  {
    key: 'k',
    note: 'C2'
  },
];

const recorder = new Tone.Recorder();
const mic = new Tone.UserMedia().connect(recorder);
const ctx = new Tone.Context();
const sampler = new Tone.Sampler().toDestination();

function App() {
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioIsOn, setAudioIsOn] = useState(false);
  const samplerRef = useRef(sampler);

  const playNote = (note: string | string[]) => {
    samplerRef.current.triggerAttackRelease(note, 1);
  }

  const handleClick = (note: INote) => {
    setPressedKeys(prevPressedKeys => [
      ...prevPressedKeys,
     note.key
    ]);

    playNote(note.note);
  }

  const handleRecordClick = async () => {
    setIsRecording(true);
    setSamplesLoaded(false);

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    recorder.start();
    ctx.setTimeout(async () => {
      const recording = await recorder.stop();
      samplerRef.current.add('A1', URL.createObjectURL(recording), () => setSamplesLoaded(true));
      setIsRecording(false);
    }, 1);
  }

  const turnOnAudioClick = async () => {
    await Tone.start();
    setAudioIsOn(true);

    samplerRef.current = new Tone.Sampler({
      urls: { 
        A1: audioFileUrl
      },
      onload: () => setSamplesLoaded(true)
    }).toDestination();
  }

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const { key, repeat } = e;
      if (!repeat) {
        if (key === 'a') playNote('C1');
        if (key === 's') playNote('D1');
        if (key === 'd') playNote('E1');
        if (key === 'f') playNote('F1');
        if (key === 'g') playNote('G1');
        if (key === 'h') playNote('A1');
        if (key === 'j') playNote('B1');
        if (key === 'k') playNote('C2');
  
        setPressedKeys(prevPressedKeys => [
          ...prevPressedKeys,
          key
        ]);
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== e.key));
    }

    mic.open().then(() => console.log('mic open')).catch(e => console.error(e));

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
      samplerRef.current.dispose();
    }
  }, []);

  return (
    <main className="max-w-screen-xl py-8 mx-auto">
      <div className="flex flex-row justify-center pb-8">
        <h1 className="text-2xl font-bold">One-Second Sampler</h1>
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center gap-4 pb-8">
        {notes.map((noteItem, index) => (
          <button
            className={`border-2 border-black rounded-md py-4 px-6 w-16 disabled:cursor-not-allowed disabled:opacity-50 ${(pressedKeys.includes(noteItem.key) || !samplesLoaded) && 'bg-black text-white'}`}
            onMouseDown={() => handleClick(noteItem)}
            onTouchStart={() => setPressedKeys(prevPressedKeys => [...prevPressedKeys, noteItem.key])}
            onTouchEnd={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
            onMouseUp={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
            key={noteItem.note}
            disabled={!samplesLoaded || !audioIsOn}
          >
            <span>{samplesLoaded ? noteItem.key : 'WAITING!'[index]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-row items-center justify-center mb-12">
        {audioIsOn ? (
          <button
            className="px-4 py-2 font-bold text-white bg-red-700 rounded-md disabled:bg-red-300 disabled:cursor-not-allowed"
            onClick={handleRecordClick}
            disabled={isRecording}
          >
            {isRecording ? 'Recording...' : 'Record'}
          </button>
        ) : (
          <button
            className="px-4 py-2 font-bold text-white bg-green-500 rounded-md hover:opacity-50 focus:opacity-50"
            onClick={turnOnAudioClick}
          >
            Turn on
          </button>
        )}
      </div>
      <div className="flex justify-center px-4">
        <div className="flex flex-col items-center max-w-2xl">
          <h2 className="my-2 font-bold underline">How to use:</h2>
          <ul className="space-y-1 text-sm list-disc list-inside">
            <li>Give permission for microphone access if prompted.</li>
            <li>Click the "Turn On" button to activate the sampler and keyboard.</li>
            <li>Use the keyboard / mouse / touchscreen on the boxes to play the default sound.</li>
            <li>Click 'Record' to record a sample. Recording starts immediately for one second - you might need to get used to the timing!</li>
            <li>The new sample will be playable when recording stops.</li>
          </ul>
        </div>
      </div>
    </main>
  )
}

export default App;
