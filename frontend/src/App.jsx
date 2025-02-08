import React, { useState } from 'react';

const App = () => {
  const GRID_SIZE = 20;
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [path, setPath] = useState([]);
  
  const handleCellClick = async (x, y) => {
    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint) {
      setEndPoint({ x, y });
      const coordinates = {
        start: startPoint,
        end: { x, y }
      };
      
      try {
        const response = await fetch('http://localhost:8080/find-path', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(coordinates),
        });
        
        const pathData = await response.json();
        setPath(pathData.path);
      } catch (error) {
        console.error('Error fetching path:', error);
      }
    } else {
      setStartPoint(null);
      setEndPoint(null);
      setPath([]);
    }
  };

  const getCellColor = (x, y) => {
    if (startPoint && startPoint.x === x && startPoint.y === y) {
      return 'bg-green-500';
    }
    if (endPoint && endPoint.x === x && endPoint.y === y) {
      return 'bg-red-500';
    }
    if (path.some(point => point.x === x && point.y === y)) {
      return 'bg-blue-500';
    }
    return 'bg-gray-200';
  };

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pathfinding Grid</h1>
      <div className="grid grid-cols-20 gap-1 p-4 bg-gray-100 rounded-lg shadow-lg">
        {Array.from({ length: GRID_SIZE }, (_, y) => (
          Array.from({ length: GRID_SIZE }, (_, x) => (
            <div
              key={`${x}-${y}`}
              className={`w-6 h-6 rounded cursor-pointer transition-colors duration-200 ${getCellColor(x, y)} hover:bg-gray-300`}
              onClick={() => handleCellClick(x, y)}
            />
          ))
        ))}
      </div>
      <div className="mt-4 text-gray-600">
        {!startPoint && 'Select start point'}
        {startPoint && !endPoint && 'Select end point'}
        {startPoint && endPoint && 'Click anywhere to reset'}
      </div>
    </div>
  );
};

export default App;