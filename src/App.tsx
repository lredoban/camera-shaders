import React, { useState } from 'react';
import WebGLCamera from './components/WebGLCamera';
import { Camera, Wand2 } from 'lucide-react';
import { shaders } from './shaders/fragment';

function App() {
  const [selectedShader, setSelectedShader] = useState<keyof typeof shaders>('crt');

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          <Camera className="w-8 h-8 text-purple-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">WebGL Camera Effects</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="inline-flex gap-2 p-1 bg-gray-800 rounded-lg">
            {Object.entries(shaders).map(([key, shader]) => (
              <button
                key={key}
                onClick={() => setSelectedShader(key as keyof typeof shaders)}
                className={`
                  px-4 py-2 rounded-md flex items-center gap-2 transition-all
                  ${selectedShader === key 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'}
                `}
              >
                <Wand2 className="w-4 h-4" />
                {shader.name}
              </button>
            ))}
          </div>
        </div>

        <div className="aspect-video rounded-lg overflow-hidden shadow-2xl border-2 border-purple-500/20">
          <WebGLCamera selectedShader={selectedShader} />
        </div>
        
        <p className="text-gray-400 text-center mt-4">
          Select different shader effects to transform your camera feed in real-time using WebGL.
        </p>
      </div>
    </div>
  );
}

export default App;