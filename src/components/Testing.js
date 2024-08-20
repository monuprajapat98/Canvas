import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';

export const TextFileCanvas = () => {
  const [text, setText] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPath, setDrawnPath] = useState([]); // To store the drawing path
  const canvasRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
      const content = e.target.result;
      setText(content);
      drawTextOnCanvas(content);
    };

    reader.readAsText(file);
  };

  const drawTextOnCanvas = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    ctx.font = '16px Arial';
    ctx.fillStyle = 'black';
    const lines = text.split('\n');
    lines.forEach((line, index) => {
      ctx.fillText(line, 10, 30 + index * 20); // Draw each line with some spacing
    });
  };

  const handleMouseDown = (event) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left;
    const startY = event.clientY - rect.top;

    setDrawnPath([{ x: startX, y: startY }]); // Start a new path
  };

  const handleMouseMove = (event) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;
    const ctx = canvas.getContext('2d');

    setDrawnPath((prevPath) => [...prevPath, { x: currentX, y: currentY }]);

    ctx.lineTo(currentX, currentY);
    ctx.stroke();
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    canvasRef.current.getContext('2d').beginPath(); // Begin a new path after drawing
  };

const handleExtractText = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    // Calculate the bounding box of the drawn path
    const minX = Math.min(...drawnPath.map((p) => p.x));
    const minY = Math.min(...drawnPath.map((p) => p.y));
    const maxX = Math.max(...drawnPath.map((p) => p.x));
    const maxY = Math.max(...drawnPath.map((p) => p.y));
  
    const width = maxX - minX;
    const height = maxY - minY;
  
    // Extract the drawn area from the canvas
    const imageData = ctx.getImageData(minX, minY, width, height);
  
    // Create a temporary canvas to hold the cropped image
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.putImageData(imageData, 0, 0);
  
    // Preprocess the image (e.g., increase contrast, remove noise)
    tempCtx.filter = 'contrast(150%) brightness(120%)';
    tempCtx.drawImage(tempCanvas, 0, 0);
  
    // Use Tesseract.js to perform OCR on the cropped image
    Tesseract.recognize(tempCanvas, 'eng', {
      logger: (m) => console.log(m), // Optional logging for OCR progress
    })
      .then(({ data: { text } }) => {
        console.log('Extracted Text:', text);
      })
      .catch((err) => {
        console.error('Error during OCR:', err);
      });
  };
  

  return (
    <div>
      <input type="file" accept=".txt" onChange={handleFileUpload} />
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: '1px solid black', marginTop: '20px' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      />
      <button onClick={handleExtractText} style={{ marginTop: '20px' }}>
        Extract Text from Drawing
      </button>
    </div>
  );
};


// import React, { useState, useRef } from 'react';

// export const TextFileCanvas = () => {
//   const [text, setText] = useState('');
//   const [isDrawing, setIsDrawing] = useState(false);
//   const [drawnShapes, setDrawnShapes] = useState([]); // To store drawn shapes coordinates
//   const canvasRef = useRef(null);
//   const ctxRef = useRef(null);

//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     const reader = new FileReader();

//     reader.onload = function (e) {
//       const content = e.target.result;
//       setText(content);
//       drawTextOnCanvas(content);
//     };

//     reader.readAsText(file);
//   };

//   const drawTextOnCanvas = (text) => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     ctxRef.current = ctx;

//     ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
//     ctx.font = '16px Arial';
//     ctx.fillStyle = 'black';
//     const lines = text.split('\n');
//     lines.forEach((line, index) => {
//       ctx.fillText(line, 10, 30 + index * 20); // Draw each line with some spacing
//     });
//   };

//   const handleMouseDown = (event) => {
//     setIsDrawing(true);
//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const startX = event.clientX - rect.left;
//     const startY = event.clientY - rect.top;

//     setDrawnShapes([...drawnShapes, { startX, startY, path: [] }]); // Start a new path
//   };

//   const handleMouseMove = (event) => {
//     if (!isDrawing) return;

//     const canvas = canvasRef.current;
//     const rect = canvas.getBoundingClientRect();
//     const currentX = event.clientX - rect.left;
//     const currentY = event.clientY - rect.top;
//     const ctx = ctxRef.current;

//     const newDrawnShapes = [...drawnShapes];
//     const currentShape = newDrawnShapes[newDrawnShapes.length - 1];
//     currentShape.path.push({ x: currentX, y: currentY });
//     setDrawnShapes(newDrawnShapes);

//     ctx.lineTo(currentX, currentY);
//     ctx.stroke();
//   };

//   const handleMouseUp = () => {
//     setIsDrawing(false);
//     ctxRef.current.beginPath(); // Begin a new path after drawing
//   };

//   const handleExtractText = () => {
//     const canvas = canvasRef.current;
//     const ctx = ctxRef.current;
//     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//     // Simplified text extraction logic
//     // Here, you would need to analyze the imageData to detect the text within the drawn shape
//     // For simplicity, this is just a placeholder where you can add your own text detection logic

//     console.log('Drawn shapes:', drawnShapes);
//     console.log('Image data:', imageData); // Placeholder for further processing
//     console.log('Placeholder for extracted text');
//   };

//   return (
//     <div>
//       <input type="file" accept=".txt" onChange={handleFileUpload} />
//       <canvas
//         ref={canvasRef}
//         width={800}
//         height={600}
//         style={{ border: '1px solid black', marginTop: '20px' }}
//         onMouseDown={handleMouseDown}
//         onMouseMove={handleMouseMove}
//         onMouseUp={handleMouseUp}
//       />
//       <button onClick={handleExtractText} style={{ marginTop: '20px' }}>
//         Extract Text from Drawing
//       </button>
//     </div>
//   );
// };


