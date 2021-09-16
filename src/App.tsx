import React, { useEffect, useState } from 'react';
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

function App() {
  const [samplesLoaded, setSamplesLoaded] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<string[]>([]);

  const sampler = new Tone.Sampler({
    urls: {
      A1: buffer
    },
    onload: () => setSamplesLoaded(true)
  }).toDestination();

  const playNote = (note: string | string[]) => {
    sampler.triggerAttackRelease(note, 0.5);
  }

  const handleClick = (note: INote) => {
    setPressedKeys(prevPressedKeys => [
      ...prevPressedKeys,
     note.key
    ]);

    playNote(note.note);
  }

  useEffect(() => {
    const handleKeyPress = (e: any) => {
      const { key } = e;
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

    const handleKeyUp = (e: any) => {
      setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== e.key));
    }

    window.addEventListener('keypress', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keypress', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    }
  });

  return (
    <div className="max-w-screen-xl mx-auto">
      <div className="flex flex-row justify-center">
        <h1 className="text-2xl">Sampler</h1>
      </div>
      <div className="flex flex-row items-center justify-center space-x-4">
        {samplesLoaded ? (
          notes.map(noteItem => (
            <button
              className={`border-2 border-black rounded-md py-4 px-6 ${pressedKeys.includes(noteItem.key) && 'bg-black text-white'}`}
              onMouseDown={() => handleClick(noteItem)}
              onTouchStart={() => setPressedKeys(prevPressedKeys => [...prevPressedKeys, noteItem.key])}
              onTouchEnd={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
              onMouseUp={() => setPressedKeys(prevPressedKeys => prevPressedKeys.filter(key => key !== noteItem.key))}
              key={noteItem.note}
            >
              {noteItem.key.toUpperCase()}
            </button>
          ))
        ) : (
          <span>Loading...</span>
        )}
      </div>
    </div>
  )
}

export default App;
