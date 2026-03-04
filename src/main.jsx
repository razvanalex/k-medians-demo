import { useState, useMemo } from 'react';
import { RotateCcw, ChevronRight, Info, MapPin, RefreshCcw, Plus, Minus } from 'lucide-react';


const K_MEANS_COLORS = {
    A: '#3b82f6', // Blue
    B: '#ef4444', // Red
    Unassigned: '#94a3b8' // Slate
};


const ScooterMap = () => {
    // Initial Hardcoded Defaults
    const DEFAULT_HOUSES = [
        { id: 'H1', x: 2, y: 5, cluster: null },
        { id: 'H2', x: 3, y: 2, cluster: null },
        { id: 'H3', x: 4, y: 6, cluster: null },
        { id: 'H4', x: 5, y: 3, cluster: null },
        { id: 'H5', x: 6, y: 5, cluster: null },
        { id: 'H6', x: 7, y: 2, cluster: null },
        { id: 'H7', x: 8, y: 6, cluster: null }
    ];

    const DEFAULT_SCOOTERS = [
        { id: 'A', x: 2, y: 2, color: K_MEANS_COLORS.A, label: 'Centroid A' },
        { id: 'B', x: 1, y: 4, color: K_MEANS_COLORS.B, label: 'Centroid B' }
    ];


    // Simulation State
    const [scooters, setScooters] = useState(DEFAULT_SCOOTERS);
    const [houses, setHouses] = useState(DEFAULT_HOUSES);
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState('setup'); // setup, assign, update, finished
    // Recovery Point State (to remember the last custom configuration)
    const [lastSetup, setLastSetup] = useState({
        scooters: DEFAULT_SCOOTERS,
        houses: DEFAULT_HOUSES
    });


    // Dragging State
    const [draggedItem, setDraggedItem] = useState(null);


    // Map configuration
    const padding = 50;
    const width = 800;
    const height = 600;
    const maxX = 10;
    const maxY = 7;


    const getX = (val) => padding + (val / maxX) * (width - 2 * padding);
    const getY = (val) => (height - padding) - (val / maxY) * (height - 2 * padding);
    const fromX = (pixelX) => Math.round(((pixelX - padding) / (width - 2 * padding)) * maxX);
    const fromY = (pixelY) => Math.round(((height - padding - pixelY) / (height - 2 * padding)) * maxY);


    const calculateDistance = (p1, p2) => {
        // Manhattan distance (L1 norm): |x1 - x2| + |y1 - y2|
        return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
    };

    // Helper function to calculate median
    const calculateMedian = (values) => {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            // For even number of values, take the larger of the two middle values
            return sorted[mid];
        }
        // For odd number of values, take the middle value
        return sorted[mid];
    };


    const runStep = () => {
        if (phase === 'setup') {
            // Before starting the algorithm, save the CURRENT state as the recovery point
            setLastSetup({
                scooters: scooters.map(s => ({ ...s })),
                houses: houses.map(h => ({ ...h, cluster: null }))
            });


            // Perform initial assignment
            const newHouses = houses.map(house => {
                const distA = calculateDistance(house, scooters[0]);
                const distB = calculateDistance(house, scooters[1]);
                return { ...house, cluster: distA <= distB ? 'A' : 'B' };
            });
            setHouses(newHouses);
            setPhase('assign');
        } else if (phase === 'update') {
            // ASSIGN PHASE (Subsequent iterations)
            const newHouses = houses.map(house => {
                const distA = calculateDistance(house, scooters[0]);
                const distB = calculateDistance(house, scooters[1]);
                return { ...house, cluster: distA <= distB ? 'A' : 'B' };
            });
            setHouses(newHouses);
            setPhase('assign');
        } else if (phase === 'assign') {
            // UPDATE PHASE (Move Centroids using Median)
            const newScooters = scooters.map(scooter => {
                const assignedHouses = houses.filter(h => h.cluster === scooter.id);
                if (assignedHouses.length === 0) return scooter;

                const xCoords = assignedHouses.map(h => h.x);
                const yCoords = assignedHouses.map(h => h.y);

                const medianX = calculateMedian(xCoords);
                const medianY = calculateMedian(yCoords);

                return { ...scooter, x: medianX, y: medianY };
            });


            const hasChanged = newScooters.some((s, i) => s.x !== scooters[i].x || s.y !== scooters[i].y);
            setScooters(newScooters);
            setStep(s => s + 1);
            setPhase(hasChanged ? 'update' : 'finished');
        }
    };


    const resetToLastSetup = () => {
        // Reverts to the configuration set before clicking "Start"
        setScooters(lastSetup.scooters.map(s => ({ ...s })));
        // Remove clustering info but keep positions
        setHouses(lastSetup.houses.map(h => ({ ...h, cluster: null })));
        setStep(0);
        setPhase('setup');
    };


    const factoryReset = () => {
        // Reverts to the original hardcoded defaults
        setScooters(DEFAULT_SCOOTERS.map(s => ({ ...s })));
        setHouses(DEFAULT_HOUSES.map(h => ({ ...h, cluster: null })));
        setLastSetup({ 
            scooters: DEFAULT_SCOOTERS.map(s => ({ ...s })), 
            houses: DEFAULT_HOUSES.map(h => ({ ...h, cluster: null })) 
        });
        setStep(0);
        setPhase('setup');
    };

    const addHouse = () => {
        if (phase === 'setup') {
            const nextNum = Math.max(...houses.map(h => parseInt(h.id.substring(1))), 0) + 1;
            const newId = `H${nextNum}`;
            const newHouse = { id: newId, x: 7, y: 5, cluster: null };
            const updatedHouses = [...houses, newHouse];
            setHouses(updatedHouses);
            setLastSetup({
                ...lastSetup,
                houses: updatedHouses
            });
        }
    };

    const removeHouse = (id) => {
        if (phase === 'setup' && houses.length > 1) {
            const updatedHouses = houses.filter(h => h.id !== id);
            setHouses(updatedHouses);
            setLastSetup({
                ...lastSetup,
                houses: updatedHouses
            });
        }
    };

    const updateHouseCoordinate = (id, axis, value) => {
        if (phase === 'setup') {
            const newValue = Math.max(0, Math.min(axis === 'x' ? maxX : maxY, parseInt(value) || 0));
            const updatedHouses = houses.map(h =>
                h.id === id ? { ...h, [axis]: newValue } : h
            );
            setHouses(updatedHouses);
            setLastSetup({
                ...lastSetup,
                houses: updatedHouses.map(h => ({ ...h, cluster: null }))
            });
        }
    };

    const updateScooterCoordinate = (id, axis, value) => {
        if (phase === 'setup') {
            const newValue = Math.max(0, Math.min(axis === 'x' ? maxX : maxY, parseInt(value) || 0));
            const updatedScooters = scooters.map(s =>
                s.id === id ? { ...s, [axis]: newValue } : s
            );
            setScooters(updatedScooters);
            setLastSetup({
                ...lastSetup,
                scooters: updatedScooters
            });
        }
    };


    const handleMouseMove = (e) => {
        if (draggedItem && phase === 'setup') {
            const svg = e.currentTarget;
            const CTM = svg.getScreenCTM();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            const mouseX = (clientX - CTM.e) / CTM.a;
            const mouseY = (clientY - CTM.f) / CTM.d;

            const gridX = Math.max(0, Math.min(maxX, fromX(mouseX)));
            const gridY = Math.max(0, Math.min(maxY, fromY(mouseY)));


            if (draggedItem.type === 'scooter') {
                setScooters(prev => {
                    const updated = prev.map(s =>
                        s.id === draggedItem.id ? { ...s, x: gridX, y: gridY } : s
                    );
                    setLastSetup(last => ({
                        ...last,
                        scooters: updated.map(s => ({ ...s }))
                    }));
                    return updated;
                });
            } else if (draggedItem.type === 'house') {
                setHouses(prev => {
                    const updated = prev.map(h =>
                        h.id === draggedItem.id ? { ...h, x: gridX, y: gridY } : h
                    );
                    setLastSetup(last => ({
                        ...last,
                        houses: updated.map(h => ({ ...h, cluster: null }))
                    }));
                    return updated;
                });
            }
        }
    };

    const handleTouchMove = (e) => {
        if (draggedItem && phase === 'setup') {
            e.preventDefault();
            handleMouseMove(e);
        }
    };


    const gridLines = useMemo(() => {
        const lines = [];
        for (let i = 0; i <= maxX; i++) {
            lines.push(<line key={`v-${i}`} x1={getX(i)} y1={getY(0)} x2={getX(i)} y2={getY(maxY)} stroke="#f1f5f9" strokeWidth="1" />);
        }
        for (let i = 0; i <= maxY; i++) {
            lines.push(<line key={`h-${i}`} x1={getX(0)} y1={getY(i)} x2={getX(maxX)} y2={getY(i)} stroke="#f1f5f9" strokeWidth="1" />);
        }
        return lines;
    }, []);


    return (
        <div className="flex flex-col min-h-screen bg-slate-100 font-sans">
            <div className="w-full max-w-7xl mx-auto bg-white sm:rounded-3xl shadow-2xl overflow-hidden border-0 sm:border sm:border-slate-200 sm:my-4">
                {/* Header */}
                <div className="bg-slate-900 p-4 sm:p-6 md:p-8 text-white">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">K-Medians Clustering</h1>
                            <p className="text-slate-400 text-xs sm:text-sm max-w-md">
                                Configure your map by dragging assets. <span className="text-blue-400 font-bold">Reset</span> will return to your last manual configuration.
                            </p>
                        </div>
                        <div className="flex flex-col items-start sm:items-end">
                            <span className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Iteration</span>
                            <span className="text-3xl sm:text-4xl font-black text-blue-500">{step}</span>
                        </div>
                    </div>
                </div>


                {/* Main Interface */}
                <div className="flex flex-col lg:flex-row">
                    {/* Map View */}
                    <div className="flex-1 p-4 sm:p-6 bg-white relative min-h-[400px] sm:min-h-[500px]">
                        <div className="absolute top-4 sm:top-8 left-4 sm:left-10 z-10 flex flex-col gap-2">
                            <div className="bg-white/90 backdrop-blur-md px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-slate-200 text-[9px] sm:text-[10px] font-bold text-slate-500 flex items-center gap-1 sm:gap-2 shadow-sm">
                                <Info size={10} className="text-blue-500 sm:w-3 sm:h-3" />
                                <span className="hidden sm:inline">{phase === 'setup' ? "DRAG MODE: Ready to Start" : `LOCKED: Phase ${phase.toUpperCase()}`}</span>
                                <span className="sm:hidden">{phase === 'setup' ? "DRAG MODE" : phase.toUpperCase()}</span>
                            </div>
                        </div>


                        <svg
                            viewBox={`0 0 ${width} ${height}`}
                            className="w-full h-auto drop-shadow-sm select-none touch-none"
                            onMouseMove={handleMouseMove}
                            onMouseUp={() => setDraggedItem(null)}
                            onMouseLeave={() => setDraggedItem(null)}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={() => setDraggedItem(null)}
                        >
                            {gridLines}


                            {/* Cluster Connections */}
                            {phase !== 'setup' && houses.map((h, i) => {
                                const targetScooter = scooters.find(s => s.id === h.cluster);
                                if (!targetScooter) return null;
                                return (
                                    <line
                                        key={`link-${i}`}
                                        x1={getX(h.x)}
                                        y1={getY(h.y)}
                                        x2={getX(targetScooter.x)}
                                        y2={getY(targetScooter.y)}
                                        stroke={targetScooter.color}
                                        strokeWidth="5"
                                        strokeDasharray="10 10"
                                        className="opacity-30 transition-all duration-500"
                                    />
                                );
                            })}


                            {/* Houses */}
                            {houses.map((h) => (
                                <g
                                    key={h.id}
                                    className={`${phase === 'setup' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    onMouseDown={() => phase === 'setup' && setDraggedItem({ type: 'house', id: h.id })}
                                    onTouchStart={() => phase === 'setup' && setDraggedItem({ type: 'house', id: h.id })}
                                >
                                    <rect x={getX(h.x) - 15} y={getY(h.y) - 15} width="60" height="60" fill="transparent" />
                                    <path
                                        d={`M ${getX(h.x) - 20} ${getY(h.y)} L ${getX(h.x)} ${getY(h.y) - 20} L ${getX(h.x) + 20} ${getY(h.y)} L ${getX(h.x) + 20} ${getY(h.y) + 16} L ${getX(h.x) - 20} ${getY(h.y) + 16} Z`}
                                        fill={h.cluster ? K_MEANS_COLORS[h.cluster] : K_MEANS_COLORS.Unassigned}
                                        className="transition-colors duration-500 shadow-sm"
                                    />
                                    <text x={getX(h.x)} y={getY(h.y) + 35} textAnchor="middle" className="text-[11px] font-bold fill-slate-400 pointer-events-none">{h.id}</text>
                                </g>
                            ))}


                            {/* Scooters */}
                            {scooters.map((s) => (
                                <g
                                    key={s.id}
                                    className={`${phase === 'setup' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    onMouseDown={() => phase === 'setup' && setDraggedItem({ type: 'scooter', id: s.id })}
                                    onTouchStart={() => phase === 'setup' && setDraggedItem({ type: 'scooter', id: s.id })}
                                >
                                    <circle cx={getX(s.x)} cy={getY(s.y)} r="30" fill={s.color} className="opacity-10" />
                                    <circle
                                        cx={getX(s.x)}
                                        cy={getY(s.y)}
                                        r="15"
                                        fill={s.color}
                                        stroke="white"
                                        strokeWidth="3"
                                        className="shadow-md"
                                    />
                                    <text x={getX(s.x)} y={getY(s.y) - 35} textAnchor="middle" className="text-[14px] font-black fill-slate-800 tracking-tighter pointer-events-none">
                                        {s.id}
                                    </text>
                                </g>
                            ))}
                        </svg>
                    </div>


                    {/* Controls Panel */}
                    <div className="w-full lg:w-80 bg-slate-50 border-t lg:border-t-0 lg:border-l border-slate-100 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 sm:mb-6 flex items-center gap-2">
                                <MapPin size={14} /> Simulation Control
                            </h3>

                            <div className="space-y-3 sm:space-y-4">
                                <button
                                    onClick={runStep}
                                    disabled={phase === 'finished'}
                                    className={`w-full py-3 sm:py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 text-sm sm:text-base ${phase === 'finished'
                                        ? 'bg-emerald-500 text-white shadow-emerald-100'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100'
                                        }`}
                                >
                                    {phase === 'finished' ? 'Converged' : (
                                        <>
                                            <ChevronRight size={18} />
                                            {phase === 'setup' ? 'Initialize' : 'Step'}
                                        </>
                                    )}
                                </button>


                                <button
                                    onClick={resetToLastSetup}
                                    className="w-full py-3 sm:py-4 rounded-2xl font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm text-sm sm:text-base"
                                    title="Reset to your custom layout"
                                >
                                    <RotateCcw size={18} />
                                    Reset to Setup
                                </button>


                                <button
                                    onClick={factoryReset}
                                    className="w-full py-2 rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center justify-center gap-1"
                                >
                                    <RefreshCcw size={12} />
                                    Restore Factory Defaults
                                </button>
                            </div>


                            {/* Coordinate Editor */}
                            <div className="mt-6 sm:mt-8">
                                <div className="text-[10px] font-bold text-slate-400 uppercase mb-3 sm:mb-4 tracking-wider">Coordinates</div>
                                <div className="max-h-60 sm:max-h-80 overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {scooters.map(s => (
                                        <div key={s.id} className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                                            <div className="flex items-center gap-2 font-bold mb-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }}></div>
                                                Centroid {s.id}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500">X</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxX}
                                                        value={s.x}
                                                        onChange={(e) => updateScooterCoordinate(s.id, 'x', e.target.value)}
                                                        disabled={phase !== 'setup'}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500">Y</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxY}
                                                        value={s.y}
                                                        onChange={(e) => updateScooterCoordinate(s.id, 'y', e.target.value)}
                                                        disabled={phase !== 'setup'}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {houses.map(h => (
                                        <div key={h.id} className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="font-medium text-slate-600">{h.id}</span>
                                                {phase === 'setup' && houses.length > 1 && (
                                                    <button
                                                        onClick={() => removeHouse(h.id)}
                                                        className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                                        title="Remove house"
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500">X</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxX}
                                                        value={h.x}
                                                        onChange={(e) => updateHouseCoordinate(h.id, 'x', e.target.value)}
                                                        disabled={phase !== 'setup'}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500">Y</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxY}
                                                        value={h.y}
                                                        onChange={(e) => updateHouseCoordinate(h.id, 'y', e.target.value)}
                                                        disabled={phase !== 'setup'}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {phase === 'setup' && (
                                    <button
                                        onClick={addHouse}
                                        className="w-full mt-3 py-2 rounded-lg font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add House
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className="mt-6 sm:mt-8">
                            <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</div>
                                <p className="text-[10px] sm:text-[11px] italic leading-relaxed text-slate-300">
                                    {phase === 'setup' && "Drag assets to set up a scenario, then press Initialize."}
                                    {phase === 'assign' && "Points assigned. Next: Move centroids to the median coordinates."}
                                    {phase === 'update' && "Centroids moved. Next: Re-assign points."}
                                    {phase === 'finished' && "Optimal clustering reached."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function App() {
    return <ScooterMap />;
}

