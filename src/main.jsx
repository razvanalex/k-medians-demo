import { useState, useMemo } from 'react';
import { RotateCcw, ChevronRight, Info, MapPin, RefreshCcw, Plus, Minus } from 'lucide-react';


const K_MEANS_COLORS = {
    A: '#3b82f6', // Blue
    B: '#ef4444', // Red
    Unassigned: '#94a3b8' // Slate
};


const ClusteringDemo = () => {
    // Initial Hardcoded Defaults
    const DEFAULT_POINTS = [
        { id: 'P1', x: 2, y: 5, cluster: null },
        { id: 'P2', x: 3, y: 2, cluster: null },
        { id: 'P3', x: 4, y: 6, cluster: null },
        { id: 'P4', x: 5, y: 3, cluster: null },
        { id: 'P5', x: 6, y: 5, cluster: null },
        { id: 'P6', x: 7, y: 2, cluster: null },
        { id: 'P7', x: 8, y: 6, cluster: null }
    ];

    const DEFAULT_CENTROIDS = [
        { id: 'A', x: 2, y: 2, color: K_MEANS_COLORS.A, label: 'Centroid A' },
        { id: 'B', x: 7, y: 6, color: K_MEANS_COLORS.B, label: 'Centroid B' }
    ];


    // Simulation State
    const [centroids, setCentroids] = useState(DEFAULT_CENTROIDS);
    const [points, setPoints] = useState(DEFAULT_POINTS);
    const [step, setStep] = useState(0);
    const [phase, setPhase] = useState('setup'); // setup, assign, update, finished
    // Recovery Point State (to remember the last custom configuration)
    const [lastSetup, setLastSetup] = useState({
        centroids: DEFAULT_CENTROIDS,
        points: DEFAULT_POINTS
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
            // Save with explicit null clusters
            setLastSetup({
                centroids: centroids.map(c => ({ 
                    id: c.id, 
                    x: c.x, 
                    y: c.y, 
                    color: c.color, 
                    label: c.label 
                })),
                points: points.map(p => ({ 
                    id: p.id, 
                    x: p.x, 
                    y: p.y, 
                    cluster: null 
                }))
            });


            // Perform initial assignment
            const newPoints = points.map(point => {
                const distA = calculateDistance(point, centroids[0]);
                const distB = calculateDistance(point, centroids[1]);
                return { ...point, cluster: distA <= distB ? 'A' : 'B' };
            });
            setPoints(newPoints);
            setPhase('assign');
        } else if (phase === 'update') {
            // ASSIGN PHASE (Subsequent iterations)
            const newPoints = points.map(point => {
                const distA = calculateDistance(point, centroids[0]);
                const distB = calculateDistance(point, centroids[1]);
                return { ...point, cluster: distA <= distB ? 'A' : 'B' };
            });
            setPoints(newPoints);
            setPhase('assign');
        } else if (phase === 'assign') {
            // UPDATE PHASE (Move Centroids using Median)
            const newCentroids = centroids.map(centroid => {
                const assignedPoints = points.filter(p => p.cluster === centroid.id);
                if (assignedPoints.length === 0) return centroid;

                const xCoords = assignedPoints.map(p => p.x);
                const yCoords = assignedPoints.map(p => p.y);

                const medianX = calculateMedian(xCoords);
                const medianY = calculateMedian(yCoords);

                return { ...centroid, x: medianX, y: medianY };
            });


            const hasChanged = newCentroids.some((c, i) => c.x !== centroids[i].x || c.y !== centroids[i].y);
            setCentroids(newCentroids);
            setStep(s => s + 1);
            setPhase(hasChanged ? 'update' : 'finished');
        }
    };


    const resetToLastSetup = () => {
        // Reverts to the configuration set before clicking "Start"
        // Create completely fresh copies to avoid any reference issues
        const freshCentroids = lastSetup.centroids.map(c => ({ 
            id: c.id, 
            x: c.x, 
            y: c.y, 
            color: c.color, 
            label: c.label 
        }));
        const freshPoints = lastSetup.points.map(p => ({ 
            id: p.id, 
            x: p.x, 
            y: p.y, 
            cluster: null  // Explicitly reset cluster assignment
        }));
        
        setCentroids(freshCentroids);
        setPoints(freshPoints);
        setStep(0);
        setPhase('setup');
    };


    const factoryReset = () => {
        // Reverts to the original hardcoded defaults
        // Create completely fresh copies
        const freshCentroids = DEFAULT_CENTROIDS.map(c => ({ 
            id: c.id, 
            x: c.x, 
            y: c.y, 
            color: c.color, 
            label: c.label 
        }));
        const freshPoints = DEFAULT_POINTS.map(p => ({ 
            id: p.id, 
            x: p.x, 
            y: p.y, 
            cluster: null 
        }));
        
        setCentroids(freshCentroids);
        setPoints(freshPoints);
        setLastSetup({ 
            centroids: freshCentroids.map(c => ({ ...c })), 
            points: freshPoints.map(p => ({ ...p })) 
        });
        setStep(0);
        setPhase('setup');
    };

    const addPoint = () => {
        if (phase === 'setup') {
            const nextNum = Math.max(...points.map(p => parseInt(p.id.substring(1))), 0) + 1;
            const newId = `P${nextNum}`;
            const newPoint = { id: newId, x: 7, y: 5, cluster: null };
            const updatedPoints = [...points, newPoint];
            setPoints(updatedPoints);
            setLastSetup({
                ...lastSetup,
                points: updatedPoints
            });
        }
    };

    const removePoint = (id) => {
        if (phase === 'setup' && points.length > 1) {
            const updatedPoints = points.filter(p => p.id !== id);
            setPoints(updatedPoints);
            setLastSetup({
                ...lastSetup,
                points: updatedPoints
            });
        }
    };

    const updatePointCoordinate = (id, axis, value) => {
        if (phase === 'setup') {
            const newValue = Math.max(0, Math.min(axis === 'x' ? maxX : maxY, parseInt(value) || 0));
            const updatedPoints = points.map(p =>
                p.id === id ? { ...p, [axis]: newValue } : p
            );
            setPoints(updatedPoints);
            setLastSetup({
                ...lastSetup,
                points: updatedPoints.map(p => ({ ...p, cluster: null }))
            });
        }
    };

    const updateCentroidCoordinate = (id, axis, value) => {
        if (phase === 'setup') {
            const newValue = Math.max(0, Math.min(axis === 'x' ? maxX : maxY, parseInt(value) || 0));
            const updatedCentroids = centroids.map(c =>
                c.id === id ? { ...c, [axis]: newValue } : c
            );
            setCentroids(updatedCentroids);
            setLastSetup({
                ...lastSetup,
                centroids: updatedCentroids
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


            if (draggedItem.type === 'centroid') {
                setCentroids(prev => {
                    const updated = prev.map(c =>
                        c.id === draggedItem.id ? { ...c, x: gridX, y: gridY } : c
                    );
                    setLastSetup(last => ({
                        ...last,
                        centroids: updated.map(c => ({ ...c }))
                    }));
                    return updated;
                });
            } else if (draggedItem.type === 'point') {
                setPoints(prev => {
                    const updated = prev.map(p =>
                        p.id === draggedItem.id ? { ...p, x: gridX, y: gridY } : p
                    );
                    setLastSetup(last => ({
                        ...last,
                        points: updated.map(p => ({ ...p, cluster: null }))
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
                                Drag points and centroids to configure the visualization. <span className="text-blue-400 font-bold">Reset</span> will return to your last configuration.
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
                            {phase !== 'setup' && points.map((p, i) => {
                                const targetCentroid = centroids.find(c => c.id === p.cluster);
                                if (!targetCentroid) return null;
                                return (
                                    <line
                                        key={`link-${i}`}
                                        x1={getX(p.x)}
                                        y1={getY(p.y)}
                                        x2={getX(targetCentroid.x)}
                                        y2={getY(targetCentroid.y)}
                                        stroke={targetCentroid.color}
                                        strokeWidth="5"
                                        strokeDasharray="10 10"
                                        className="opacity-30 transition-all duration-500"
                                    />
                                );
                            })}


                            {/* Data Points */}
                            {points.map((p) => (
                                <g
                                    key={p.id}
                                    className={`${phase === 'setup' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    onMouseDown={() => phase === 'setup' && setDraggedItem({ type: 'point', id: p.id })}
                                    onTouchStart={() => phase === 'setup' && setDraggedItem({ type: 'point', id: p.id })}
                                >
                                    <circle 
                                        cx={getX(p.x)} 
                                        cy={getY(p.y)} 
                                        r="20" 
                                        fill={p.cluster ? K_MEANS_COLORS[p.cluster] : K_MEANS_COLORS.Unassigned}
                                        className="transition-colors duration-500 shadow-sm"
                                    />
                                    <text x={getX(p.x)} y={getY(p.y) + 35} textAnchor="middle" className="text-[11px] font-bold fill-slate-400 pointer-events-none">{p.id}</text>
                                </g>
                            ))}


                            {/* Centroids */}
                            {centroids.map((c) => (
                                <g
                                    key={c.id}
                                    className={`${phase === 'setup' ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    onMouseDown={() => phase === 'setup' && setDraggedItem({ type: 'centroid', id: c.id })}
                                    onTouchStart={() => phase === 'setup' && setDraggedItem({ type: 'centroid', id: c.id })}
                                >
                                    <circle cx={getX(c.x)} cy={getY(c.y)} r="30" fill={c.color} className="opacity-10" />
                                    <circle
                                        cx={getX(c.x)}
                                        cy={getY(c.y)}
                                        r="15"
                                        fill={c.color}
                                        stroke="white"
                                        strokeWidth="3"
                                        className="shadow-md"
                                    />
                                    <text x={getX(c.x)} y={getY(c.y) - 35} textAnchor="middle" className="text-[14px] font-black fill-slate-800 tracking-tighter pointer-events-none">
                                        {c.id}
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
                                    {centroids.map(c => (
                                        <div key={c.id} className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                                            <div className="flex items-center gap-2 font-bold mb-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></div>
                                                Centroid {c.id}
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="flex-1">
                                                    <label className="text-[9px] text-slate-500">X</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={maxX}
                                                        value={c.x}
                                                        onChange={(e) => updateCentroidCoordinate(c.id, 'x', e.target.value)}
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
                                                        value={c.y}
                                                        onChange={(e) => updateCentroidCoordinate(c.id, 'y', e.target.value)}
                                                        disabled={phase !== 'setup'}
                                                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs font-mono disabled:bg-slate-100 disabled:cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {points.map(p => (
                                        <div key={p.id} className="p-2 sm:p-3 bg-white rounded-xl border border-slate-200 text-xs shadow-sm">
                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                <span className="font-medium text-slate-600">{p.id}</span>
                                                {phase === 'setup' && points.length > 1 && (
                                                    <button
                                                        onClick={() => removePoint(p.id)}
                                                        className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                                        title="Remove point"
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
                                                        value={p.x}
                                                        onChange={(e) => updatePointCoordinate(p.id, 'x', e.target.value)}
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
                                                        value={p.y}
                                                        onChange={(e) => updatePointCoordinate(p.id, 'y', e.target.value)}
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
                                        onClick={addPoint}
                                        className="w-full mt-3 py-2 rounded-lg font-bold text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus size={16} />
                                        Add Point
                                    </button>
                                )}
                            </div>
                        </div>


                        <div className="mt-6 sm:mt-8">
                            <div className="p-3 sm:p-4 rounded-2xl bg-slate-900 text-white shadow-xl">
                                <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Status</div>
                                <p className="text-[10px] sm:text-[11px] italic leading-relaxed text-slate-300">
                                    {phase === 'setup' && "Drag points and centroids to configure, then press Initialize."}
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
    return <ClusteringDemo />;
}

