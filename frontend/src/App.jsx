import React, { useState, useMemo, useCallback, useEffect } from 'react';

const useGridState = () => {
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [path, setPath] = useState([]);
  const [animatedPath, setAnimatedPath] = useState([]);

  const resetGrid = useCallback(() => {
    setStartPoint(null);
    setEndPoint(null);
    setPath([]);
    setAnimatedPath([]);
  }, []);

  return {
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    path,
    setPath,
    animatedPath,
    setAnimatedPath,
    resetGrid
  };
};

const usePathFinding = () => {
  return useCallback(async (startPoint, endPoint) => {
    try {
      const response = await fetch('http://localhost:3000/find-path', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start: startPoint,
          end: endPoint
        }),
      });

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error fetching path:', error);
      return [];
    }
  }, []);
};

const Cell = React.memo(({ x, y, color, onClick }) => {
  return (
    <>
      <div
        className={`w-6 h-6 rounded cursor-pointer transition-all duration-300 ${color} hover:bg-gray-300`}
        onClick={() => onClick(x, y)}
      />
      {console.log("hello 2:", x, y)}
    </>
  );
});

const EmptyCell = React.memo(({ onClick }) => (
  <div
    className="w-6 h-6 rounded cursor-pointer transition-colors duration-200 bg-gray-200 hover:bg-gray-300"
    onClick={onClick}
  />
));

const GridRow = React.memo(({ y, width, activeCells, onCellClick }) => {
  return (
    <div className="flex">
      {Array.from({ length: width }, (_, x) => {
        const activeCell = activeCells.find(cell => cell.x === x && cell.y === y);
        if (activeCell) {
          return (
            <Cell
              key={`${x}-${y}`}
              x={x}
              y={y}
              color={activeCell.color}
              onClick={onCellClick}
            />
          );
        }
        return (
          <EmptyCell
            key={`${x}-${y}`}
            onClick={() => onCellClick(x, y)}
          />
        );
      })}
    </div>
  );
});

const Grid = React.memo(({ width, height, onCellClick, startPoint, endPoint, path, animatedPath }) => {
  const activeCells = useMemo(() => {
    const cells = [];
    if (startPoint) {
      cells.push({ ...startPoint, color: 'bg-green-500' });
    }
    if (endPoint) {
      cells.push({ ...endPoint, color: 'bg-red-500' });
    }
    animatedPath.forEach(point => {
      cells.push({ ...point, color: 'bg-green-500' });
    });
    return cells;
  }, [startPoint, endPoint, animatedPath]);

  return (
    <div className="grid gap-1">
      {Array.from({ length: height }, (_, y) => (
        <GridRow
          key={y}
          y={y}
          width={width}
          activeCells={activeCells}
          onCellClick={onCellClick}
        />
      ))}
    </div>
  );
});

const App = () => {
  const GRID_SIZE = 20;
  const ANIMATION_DELAY = 50; 

  const {
    startPoint,
    setStartPoint,
    endPoint,
    setEndPoint,
    path,
    setPath,
    animatedPath,
    setAnimatedPath,
    resetGrid
  } = useGridState();

  const findPath = usePathFinding();

  useEffect(() => {
    if (path.length === 0) {
      setAnimatedPath([]);
      return;
    }

    const animatePath = async () => {
      setAnimatedPath([]);
      for (let i = 0; i < path.length; i++) {
        await new Promise(resolve => setTimeout(resolve, ANIMATION_DELAY));
        setAnimatedPath(prev => [...prev, path[i]]);
      }
    };

    animatePath();
  }, [path]);

  const handleCellClick = useCallback(async (x, y) => {
    if (!startPoint) {
      setStartPoint({ x, y });
    } else if (!endPoint) {
      setEndPoint({ x, y });
      const newPath = await findPath(startPoint, { x, y });
      setPath(newPath);
    } else {
      resetGrid();
    }
  }, [startPoint, endPoint, findPath, resetGrid]);

  const statusMessage = useMemo(() => {
    if (!startPoint) return 'Select start point';
    if (!endPoint) return 'Select end point';
    return 'Click anywhere to reset';
  }, [startPoint, endPoint]);

  return (
    <div className="flex flex-col items-center p-4">
      <h1 className="text-2xl font-bold mb-4">Pathfinding Grid</h1>
      <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
        <Grid
          width={GRID_SIZE}
          height={GRID_SIZE}
          startPoint={startPoint}
          endPoint={endPoint}
          path={path}
          animatedPath={animatedPath}
          onCellClick={handleCellClick}
        />
      </div>
      <div className="mt-4 text-gray-600">
        {statusMessage}
      </div>
    </div>
  );
};

export default App;