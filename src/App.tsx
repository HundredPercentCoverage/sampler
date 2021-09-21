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

// Have to declare this outside as Tone doesn't like it otherwise
// https://stackoverflow.com/a/57527608/9508975
const buffer = new Tone.Buffer(audioFileUrl);
const recorder = new Tone.Recorder();
const mic = new Tone.UserMedia().connect(recorder);
const ctx = new Tone.Context();
const sampler = new Tone.Sampler().toDestination();

function App() {
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const samplerRef = useRef(sampler);

  const playNote = (note: string | string[]) => {
    sampler.triggerAttackRelease(note, 1);
  }

  const handleClick = (note: INote) => {
    setPressedKeys(prevPressedKeys => [
      ...prevPressedKeys,
     note.key
    ]);

    playNote(note.note);
  }

  const handleRecordClick = () => {
    setIsRecording(true);
    setSamplesLoaded(false);
    recorder.start();
    ctx.setTimeout(async () => {
      const recording = await recorder.stop();
      samplerRef.current.add('A1', URL.createObjectURL(recording), () => setSamplesLoaded(true));
      setIsRecording(false);
    }, 1);
  }

  useEffect(() => {
    samplerRef.current.add('A1', buffer, () => setSamplesLoaded(true));

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
      buffer.dispose();
      samplerRef.current.dispose();
    }
  }, []);

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="flex flex-row justify-center pb-8">
        <h1 className="text-2xl">One-Second Sampler</h1>
      </div>
      <div className="flex flex-row flex-wrap items-center justify-center space-x-4 pb-8">
        {notes.map((noteItem, index) => (
          <button
            className={`border-2 border-black rounded-md py-4 px-6 w-16 ${(pressedKeys.includes(noteItem.key) || !samplesLoaded) && 'bg-black text-white'}`}
            onMouseDown={() => handleClick(noteItem)}
            onTouchStart={() => setPressedKeys(prevPressedKeys => [...prevPressedKeys, noteItem.key])}
            onTouchEnd={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
            onMouseUp={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
            key={noteItem.note}
            disabled={!samplesLoaded}
          >
            <span>{samplesLoaded ? noteItem.key.toUpperCase() : 'LOADING!'[index]}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-row justify-center items-center">
        <button
          className="py-2 px-4 bg-red-700 text-white font-semi disabled:bg-red-300 disabled:cursor-not-allowed rounded-md"
          onClick={handleRecordClick}
          disabled={isRecording}
        >
          {isRecording ? 'Recording...' : 'Record'}
        </button>
      </div>
    </div>
  )
}

export default App;
