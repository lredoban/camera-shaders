import React, { useRef, useState } from 'react';
import WebGLCamera, { WebGLCameraHandle } from './components/WebGLCamera';
import { Camera, Wand2 } from 'lucide-react';
import { shaders } from './shaders/fragment';

function App() {
  const [selectedShader, setSelectedShader] = useState<keyof typeof shaders>('crt');
  const cameraRef = useRef<WebGLCameraHandle>(null);

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
          <WebGLCamera ref={cameraRef} selectedShader={selectedShader} />
        </div>
        
        <div className="flex justify-center mt-6">
          <button
            onClick={() => cameraRef.current?.takePhoto()}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-full flex items-center gap-2 transition-colors"
          >
            <Camera className="w-5 h-5" />
            Prendre une photo
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;