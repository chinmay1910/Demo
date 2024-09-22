import React, { useState, useCallback, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, ReferenceArea, Brush } from 'recharts';
import { Card } from './Card';
import { FiEye } from "react-icons/fi";
import { Button } from './Button';
import { FiEyeOff } from "react-icons/fi";
import CustomLabel from '../common/CustomLabel';
import { FiUploadCloud } from "react-icons/fi";


import HarmonicsLabel from '../common/HarmonicsLabel';
const generateColor = (index: number) => {
    const hue = (index * 137.508) % 360; // Use golden angle approximation
    return `hsl(${hue}, 70%, 50%)`;
};

const QuantitySelector = React.memo(({ value, min, max, onChange }) => {
    const [disableDec, setDisableDec] = useState(value <= min);
    const [disableInc, setDisableInc] = useState(value >= max);

    const increment = () => {
        if (value < max) {
            onChange(value + 1);
            setDisableDec(false);
            setDisableInc(value + 1 >= max);
        }
    };

    const decrement = () => {
        if (value > min) {
            onChange(value - 1);
            setDisableInc(false);
            setDisableDec(value - 1 <= min);
        }
    };

    return (
        <span className="flex w-min items-center border border-gray-300 rounded-md overflow-hidden">
            <button
                className={`px-2 py-1 text-sm font-medium transition-colors duration-150 ${disableDec
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                onClick={decrement}
                disabled={disableDec}
            >
                &minus;
            </button>
            <div>
                <input
                    className="w-10 text-center  border-none hover:border-none active:border-none py-1 text-sm"
                    type="text"
                    value={value}
                    id="plus"
                    readOnly
                />

            </div>


            <button
                className={`px-2 py-1 text-sm font-medium transition-colors duration-150 ${disableInc
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                    }`}
                onClick={increment}
                disabled={disableInc}
            >
                +
            </button>
        </span>
    );
});

const EnhancedFFTSpectralPlot = () => {
    const [data, setData] = useState([]);
    const [baseFrequency, setBaseFrequency] = useState(100);
    const [markers, setMarkers] = useState([]);
    const [colorIndex, setColorIndex] = useState(0);
    const [visibleAxes, setVisibleAxes] = useState({ x: true, y: true, z: true });
    const [markerName, setMarkerName] = useState('');
    const [brushDomain, setBrushDomain] = useState(null);
    const [markerOrder, setMarkerOrder] = useState([]);
    const fileInputRef = useRef(null);

    const handleChartClick = useCallback((event) => {
        if (!event || !event.activeLabel) return;

        const clickedFrequency = Math.round(Number(event.activeLabel));
        const activeDataKey = event.activeTooltipIndex !== undefined ?
            Object.keys(event.activePayload[0].payload).find(key => key !== 'frequency' && visibleAxes[key]) :
            null;

        const newMarker = {
            frequency: clickedFrequency,
            bandWidth: 100,
            color: generateColor(colorIndex),
            harmonics: 0,
            subHarmonics: 0,
            axis: activeDataKey,
            name: markerName || `Marker ${markers.length + 1}`,
            visible: true,
        };
        setMarkers(prev => [...prev, newMarker]);
        setMarkerOrder(prev => [...prev, markers.length]);
        setColorIndex(prev => prev + 1);
        setMarkerName('');
    }, [colorIndex, visibleAxes, markers.length, markerName]);

    const updateHarmonicMarkers = useCallback((marker) => {
        const harmonicMarkers = [
            ...Array(Number(marker.subHarmonics)).fill().map((_, i) => ({
                frequency: Math.round(marker.frequency / (i + 2)),
                bandWidth: marker.bandWidth,
                isHarmonic: true,
                order: `1/${i + 2}`  // Add this to show the order
            })),
            ...Array(Number(marker.harmonics)).fill().map((_, i) => ({
                frequency: Math.round(marker.frequency * (i + 2)),
                bandWidth: marker.bandWidth,
                isHarmonic: true
            }))
        ];
        return { ...marker, harmonicMarkers };
    }, []);

    const handleMarkerChange = useCallback((index, field, value) => {
        setMarkers(prev => {
            const updatedMarkers = prev.map((marker, i) => {
                if (i !== index) return marker;
                let updatedMarker = { ...marker, [field]: field === 'frequency' ? Math.round(Number(value)) : value };
                return updateHarmonicMarkers(updatedMarker);
            });
            return updatedMarkers;
        });
    }, [updateHarmonicMarkers]);

    const handleRemoveMarker = useCallback((index) => {
        setMarkers(prev => {
            const newMarkers = [...prev];
            newMarkers.splice(index, 1);
            return newMarkers;
        });
        setMarkerOrder(prev => {
            const newOrder = prev.filter(i => i !== index).map(i => i > index ? i - 1 : i);
            return newOrder;
        });
    }, []);

    const toggleMarkerVisibility = useCallback((index) => {
        setMarkers(prev => prev.map((marker, i) =>
            i === index ? { ...marker, visible: !marker.visible } : marker
        ));
    }, []);

    const customTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const frequency = Number(label);
            const order = frequency / baseFrequency;
            return (
                <div className="bg-slate-900 p-5  text-slate-50 rounded-md shadow">
                    <p className='font-bold text-amber-400'>Freq: {frequency} Hz</p>

                    <p className='text-amber-200'>Order: {order.toFixed(2)}x</p>
                    <hr className='my-1'></hr>
                    {payload.map((entry, index) => (
                        <p key={index}>{entry.name}: {entry.value ? entry.value.toFixed(2) : 'N/A'} mg</p>
                    ))}

                </div>
            );
        }
        return null;
    }, [baseFrequency]);

    const axisData = useMemo(() => {
        const xMin = 0;
        const xMax = data.length - 1;
        const yMin = Math.min(...data.flatMap(d => [d.x, d.y, d.z])) * 1.1;
        const yMax = Math.max(...data.flatMap(d => [d.x, d.y, d.z])) * 1.5;
        return { xMin, xMax, yMin, yMax };
    }, [data]);

    const markerElements = useMemo(() => markers.flatMap((marker, index) => {
        if (!marker.visible) return [];

        const elements = [
            <ReferenceLine
                key={`line-${index}`}
                x={marker.frequency}
                stroke={marker.color}
                label={<CustomLabel value={`${marker.name}`} />}
                strokeDasharray="7 3"
                strokeOpacity={0.75}
            // label={{
            //     value: `${marker.name}`,
            //     position: 'top',
            //     offset: 40,
            //     angle: -90,
            //     style: { fontWeight: 'bold' },
            // }}
            />,
            <ReferenceArea
                key={`area-${index}`}
                x1={marker.frequency - marker.bandWidth / 2}
                x2={marker.frequency + marker.bandWidth / 2}
                y1={axisData.yMin}
                y2={axisData.yMax / 1.45}
                fill={marker.color}
                fillOpacity={0.2}
                strokeOpacity={0.3}
            />
        ];

        if (marker.harmonicMarkers) {
            marker.harmonicMarkers.forEach((harmonic, hIndex) => {
                elements.push(
                    <ReferenceLine
                        key={`harmonic-line-${index}-${hIndex}`}
                        x={harmonic.frequency}
                        stroke={marker.color}
                        strokeDasharray="7 3"
                        strokeOpacity={0.6}

                        // position='insideBottom'
                        label={<HarmonicsLabel value={`${harmonic.frequency} Hz`} viewBox={undefined} />}

                    />,
                    <ReferenceArea
                        key={`harmonic-area-${index}-${hIndex}`}
                        x1={harmonic.frequency - harmonic.bandWidth / 2}
                        x2={harmonic.frequency + harmonic.bandWidth / 2}
                        y1={axisData.yMin}
                        y2={axisData.yMax / 1.45}
                        fill={marker.color}
                        fillOpacity={0.1}
                        strokeOpacity={0.2}
                    />
                );
            });
        }

        return elements;
    }), [markers, axisData]);

    const handleBrush = useCallback((brushArea: { startIndex: any; endIndex: any; }) => {
        if (brushArea) {
            setBrushDomain([brushArea.startIndex, brushArea.endIndex]);
        } else {
            setBrushDomain(null);
        }
    }, []);

    const toggleAxisVisibility = useCallback((axis: 'x' | 'y' | 'z') => {
        setVisibleAxes(prev => ({ ...prev, [axis]: !prev[axis] }));
    }, []);



    const handleLegendClick = useCallback((e) => {
        const { dataKey } = e;
        toggleAxisVisibility(dataKey as 'x' | 'y' | 'z');
    }, [toggleAxisVisibility]);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                const lines = content.split('\n');
                const parsedData = lines
                    .filter(line => line.trim() !== '') // Filter out empty lines
                    .map((line, index) => {
                        const [x, y, z] = line.split(/\s+/).map(Number);
                        return { frequency: index, x, y, z };
                    });
                setData(parsedData);
            };
            reader.readAsText(file);
        }
    }, []);

    const handleUploadClick = useCallback(() => {
        fileInputRef.current.click();
    }, []);



    return (
        <Card className="w-full  mx-auto">
            <div className='flex justify-between items-center mb-7 '>
                <h2 className='font-bold text-lg ml-3 '>Advanced Spectral Analysis</h2>

                <div className="inline-flex rounded-md shadow-sm  ">
                    <Button variant='ghost' onClick={handleUploadClick}><p className='flex   items-center gap-2'>
                        FFT</p></Button>
                    <Button variant='ghost' onClick={handleUploadClick}><p className='flex   items-center gap-2'>
                        PSD</p></Button>
                    <div
                        onClick={() => toggleAxisVisibility('x')}
                        className={`px-4 py-2 text-sm font-medium cursor-pointer ${visibleAxes.x ? 'bg-[#be123c] hover:bg-[#9f1239] text-white' : 'bg-white border border-gray-200 text-blue-700 hover:bg-gray-100'
                            } rounded-l-lg focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
                    >
                        X-Axis
                    </div>

                    <div
                        onClick={() => toggleAxisVisibility('y')}
                        className={`px-4 py-2 text-sm font-medium cursor-pointer ${visibleAxes.y ? 'bg-[#fb7185] hover:bg-[#f43f5e] text-white' : 'bg-white border-t border-b border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                            } focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
                    >
                        Y-Axis
                    </div>



                    <div
                        onClick={() => toggleAxisVisibility('z')}
                        className={`px-4 py-2 text-sm font-medium cursor-pointer ${visibleAxes.z ? 'bg-[#14b8a6] hover:bg-[#0d9488] text-white' : 'bg-white border border-gray-200 text-gray-900 hover:bg-gray-100 hover:text-blue-700'
                            } rounded-r-lg focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700`}
                    >
                        Z-Axis
                    </div>

                    <div className='divide-x-2 ml-7 '>

                    </div>
                    <Button variant='light' onClick={handleUploadClick}><p className='flex   items-center gap-2'><FiUploadCloud />
                        Upload File</p></Button>
                </div>
            </div>



            {/* <div>
                <div className='font-bold text-lg ml-2 mb-5'>Spectral Analysis: Rule based Harmonics</div>
<div>
            </div> */}

            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300} className="my-custom-chart">
                    <LineChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -10, bottom: 0 }} // Adjusted bottom margin for space between chart and brush
                        onClick={handleChartClick}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} horizontal={false} />
                        <XAxis
                            dataKey="frequency"
                            type="number"
                            domain={brushDomain || [axisData.xMin, axisData.xMax]}
                            interval={'preserveStartEnd'}
                            tick={{ fontSize: 12 }}
                            tickMargin={5}

                        />
                        <YAxis
                            domain={[axisData.yMin, axisData.yMax]}
                            tick={{ fontSize: 12 }}
                            axisLine={true}
                            interval={'preserveStartEnd'}
                            tickFormatter={(value) => value.toFixed(2)}
                            tickMargin={5}
                        />
                        <Tooltip content={customTooltip} cursor={{ strokeDasharray: '3 3' }} />

                        {markerElements}
                        <Line
                            type="linear"
                            dataKey="x"
                            stroke="#be123c"
                            strokeWidth={2}
                            dot={false}
                            name="X-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.x}
                        />
                        <Line
                            type="linear"
                            dataKey="y"
                            stroke="#fb7185"
                            strokeWidth={2}
                            dot={false}
                            name="Y-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.y}
                        />
                        <Line
                            type="linear"
                            dataKey="z"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            dot={false}
                            name="Z-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.z}
                        />
                        <Brush
                            dataKey="frequency"
                            height={40}
                            stroke="#d3d3d3"
                            onChange={handleBrush}

                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            <div className='pt-10'>


                <div>
                    <Card className="pl-4 overflow-y-auto mt-2">
                        <div className='flex justify-between'>

                            <h2 className='font-bold text-lg ml-2 mb-5'>Add Frequency Markers</h2>
                            <div className="mb-4 flex space-x-4 items-center">
                                <div className="relative">
                                    <input
                                        type="number"
                                        id="base-frequency"
                                        value={baseFrequency}
                                        onChange={(e) => setBaseFrequency(Math.round(Number(e.target.value)))}
                                        className="block w-[115px] px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                    />

                                    <label htmlFor="base-frequency" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Base Freq (Hz)</label>
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                    accept=".csv,.txt"
                                />
                                <div className="relative">
                                    <input
                                        type="text"
                                        id="marker-name"
                                        maxLength={36}
                                        value={markerName}
                                        onChange={(e) => setMarkerName(e.target.value)}
                                        className="block w-[240px] px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                    />
                                    <label htmlFor="marker-name" className=" absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Analysis Name</label>
                                </div>
                            </div>
                        </div>

                        <table className="w-full border-collapse">
                            <thead className='w-full'>
                                <tr className='bg-slate-50 rounded-md '>

                                    <th className="text-left p-2 pl-8 w-[200px]">Name</th>
                                    <th className="text-left p-2 w-[60px]">Order</th>
                                    <th className="text-left p-2 w-[140px]">Marker Name</th>
                                    <th className="text-left p-2 w-[120px]">Freq (Hz)</th>
                                    <th className="text-left p-2 w-[140px]">Band Size (Hz)</th>
                                    <th className="text-left p-2 w-[100px]">Harmonics</th>
                                    <th className="text-left p-2 w-[130px]">Sub-Harmonics</th>
                                    <th className="text-left p-2 w-[120px]">Axis</th>
                                    <th className='w-[24px]'></th>
                                    <th className="text-left p-2 border-spacing-5 w-[140px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className='mr-5'>
                                {markerOrder.map((orderIndex, index) => {
                                    const marker = markers[orderIndex];
                                    if (!marker) return null; // Skip if marker doesn't exist
                                    return (
                                        <tr key={index}>
                                            <td className="p-2">
                                                <span style={{ borderLeftWidth: '4px', borderLeftColor: marker.color, opacity: 0.9 }} className='text-base pl-5 font-bold '>{marker.name}</span>
                                            </td>
                                            <td className="p-2">
                                                <span className='text-base  text-center font-medium'>{(marker.frequency / baseFrequency).toFixed(2)}x</span>
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="text"
                                                    value={marker.name}
                                                    maxLength={18}
                                                    onChange={(e) => handleMarkerChange(orderIndex, 'name', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Marker Name"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={marker.frequency}
                                                    onChange={(e) => handleMarkerChange(orderIndex, 'frequency', Math.round(e.target.value))}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Frequency"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <input
                                                    type="number"
                                                    value={marker.bandWidth}
                                                    onChange={(e) => handleMarkerChange(orderIndex, 'bandWidth', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                    placeholder="Band Size"
                                                />
                                            </td>
                                            <td className="p-2">
                                                <QuantitySelector
                                                    value={marker.harmonics}
                                                    min={0}
                                                    max={20}
                                                    onChange={(value) => handleMarkerChange(orderIndex, 'harmonics', value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <QuantitySelector
                                                    value={marker.subHarmonics}
                                                    min={0}
                                                    max={10}
                                                    onChange={(value) => handleMarkerChange(orderIndex, 'subHarmonics', value)}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <select
                                                    value={marker.axis}
                                                    onChange={(e) => handleMarkerChange(orderIndex, 'axis', e.target.value)}
                                                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                >

                                                    <option value="x">X-Axis</option>
                                                    <option value="y">Y-Axis</option>
                                                    <option value="z">Z-Axis</option>
                                                </select>
                                            </td>
                                            <td></td>
                                            <td className="p-2">
                                                <div className='flex gap-5'>
                                                    <Button
                                                        variant='ghost'
                                                        onClick={() => toggleMarkerVisibility(orderIndex)}
                                                        className={`w-[80px] flex items-center justify-center gap-1 ${marker.visible ? '' : 'bg-green-100 text-green-700'
                                                            } `}
                                                    >
                                                        {marker.visible ? (
                                                            <>
                                                                <FiEyeOff />
                                                                <span>Hide</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiEye />
                                                                <span>Show</span>
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button variant="destructive" onClick={() => handleRemoveMarker(orderIndex)} className="">Remove</Button>
                                                </div>


                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Card>
                </div>
            </div>
        </Card>
    );
};

export default EnhancedFFTSpectralPlot;

