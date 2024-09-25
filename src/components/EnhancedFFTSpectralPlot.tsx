import React, { useState, useCallback, useMemo, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Brush, AreaChart, Area, Line, ComposedChart } from 'recharts';
import { Card } from './Card';
import { FiEye } from "react-icons/fi";
import { Button } from './Button';
import { FiEyeOff } from "react-icons/fi";
import CustomLabel from '../common/CustomLabel';
import { FiUploadCloud } from "react-icons/fi";
import { scaleLog } from 'd3-scale';

import './FFTCss.css';
import HarmonicsLabel from '../common/HarmonicsLabel';
import { Tabs } from '@radix-ui/react-tabs';
import { TabsContent, TabsList, TabsTrigger } from './Tabs';

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
    const zAxisColor = "#e30613";
    const yAxisColor = "#fd8c73";
    const xAxisColor = "#ffc6b7";
    const AlertColor = "#E11D48";
    const WarningColor = "#FACC15";

    const [data, setData] = useState([]);
    const [baseFrequency, setBaseFrequency] = useState(100);
    const [markers, setMarkers] = useState([]);
    const [colorIndex, setColorIndex] = useState(0);
    const [visibleAxes, setVisibleAxes] = useState({ x: true, y: true, z: true });
    const [markerName, setMarkerName] = useState('');
    const [brushDomain, setBrushDomain] = useState(null);
    const [markerOrder, setMarkerOrder] = useState([]);
    const [steppedLineData, setSteppedLineData] = useState([]);
    const [steppedLineInputs, setSteppedLineInputs] = useState([{ startFrequency: '', warningAmplitude: '', alertAmplitude: '' }]);

    const fileInputRef = useRef(null);
    const [domainType, setDomainType] = useState('native'); // 'native' or 'order'
    const [analysisName, setAnalysisName] = useState('');
    const [yAxisScale, setYAxisScale] = useState<'linear' | 'log'>('linear');

    const toggleYAxisScale = () => {
        setYAxisScale(prevScale => (prevScale === 'linear' ? 'log' : 'linear'));
    };

    const handleSteppedLineInputChange = (index, field, value) => {
        const newInputs = [...steppedLineInputs];
        newInputs[index][field] = value;
        setSteppedLineInputs(newInputs);
    };

    const addSteppedLineInput = () => {
        setSteppedLineInputs([...steppedLineInputs, { startFrequency: '', warningAmplitude: '', alertAmplitude: '' }]);
    };

    const generateSteppedLineData = () => {
        const warningData = [];
        const alertData = [];
    
        if (steppedLineInputs.length === 0) {
            console.warn('No stepped line inputs provided.');
            return;
        }
    
        for (let i = 0; i < steppedLineInputs.length; i++) {
            const start = Number(steppedLineInputs[i].startFrequency);
            const warningAmplitude = Number(steppedLineInputs[i].warningAmplitude);
            const alertAmplitude = Number(steppedLineInputs[i].alertAmplitude);
            const end = i < steppedLineInputs.length - 1 ? Number(steppedLineInputs[i + 1].startFrequency) : start + 1;
    
            if (isNaN(start) || isNaN(warningAmplitude) || isNaN(alertAmplitude)) {
                console.warn(`Invalid data at index ${i}: startFrequency = ${start}, warningAmplitude = ${warningAmplitude}, alertAmplitude = ${alertAmplitude}`);
                continue;
            }
    
            warningData.push({ frequency: start, amplitude: warningAmplitude });
            warningData.push({ frequency: end, amplitude: warningAmplitude });
    
            alertData.push({ frequency: start, amplitude: alertAmplitude });
            alertData.push({ frequency: end, amplitude: alertAmplitude });
        }
    
        // Sort the data by frequency
        warningData.sort((a, b) => a.frequency - b.frequency);
        alertData.sort((a, b) => a.frequency - b.frequency);
    
        console.log('Generated Warning Line Data:', warningData);
        console.log('Generated Alert Line Data:', alertData);
    
        setSteppedLineData({ warning: warningData, alert: alertData });
    };
    

    const handleChartClick = useCallback((event) => {
        if (!event || !event.activeLabel) return;

        const clickedFrequency = Math.round(Number(event.activeLabel));
        const activeDataKey = event.activeTooltipIndex !== undefined ?
            Object.keys(event.activePayload[0].payload).find(key => key !== 'frequency' && visibleAxes[key]) :
            null;

        const newMarker = {
            frequency: clickedFrequency,
            bandWidth: 20,
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

    const axisData = useMemo(() => {
        const xMin = 0;
        const xMax = data.length > 0 ? data[data.length - 1].frequency : 0;
        const yMin = Math.min(...data.flatMap(d => [d.x, d.y, d.z].filter(v => v !== undefined))) * 1.1;
        const yMax = Math.max(...data.flatMap(d => [d.x, d.y, d.z].filter(v => v !== undefined))) * 1.5;
        return { xMin, xMax, yMin, yMax };
    }, [data]);


    const handleBrush = useCallback((brushArea: { startIndex: number; endIndex: number; }) => {
        if (brushArea) {
            const startFrequency = data[brushArea.startIndex]?.frequency;
            const endFrequency = data[brushArea.endIndex]?.frequency;
            setBrushDomain([startFrequency, endFrequency]);
        } else {
            setBrushDomain(null);
        }
    }, [data]);


    const getYAxisProps = useCallback(() => {
        if (yAxisScale === 'log') {
            const yMin = Math.max(axisData.yMin, 0.0001); // Ensure yMin is positive for log scale
            const yMax = axisData.yMax;
            return {
                scale: scaleLog().base(Math.E),
                domain: [yMin, yMax],
                tickFormatter: (value) => value.toExponential(2),
            };
        } else {
            return {
                domain: [axisData.yMin, axisData.yMax],
                tickFormatter: (value) => value.toFixed(2),
            };
        }
    }, [yAxisScale, axisData]);

    const getXAxisProps = useCallback(() => {
        if (domainType === 'native') {
            return {
                dataKey: "frequency",
                type: "number",
                minTickGap: 20,
                tickCount: 34,
                domain: brushDomain || [axisData.xMin, axisData.xMax],
                tickFormatter: (value) => value,
            };
        } else {
            return {
                dataKey: "frequency",
                type: "number",
                minTickGap: 10,
                tickCount: 22,
                domain: brushDomain || [axisData.xMin, axisData.xMax],
                tickFormatter: (value) => (value / baseFrequency).toFixed(1) + 'x',
            };
        }
    }, [domainType, brushDomain, axisData, baseFrequency]);

    const customTooltip = useCallback(({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const frequency = Number(label);
            const order = frequency / baseFrequency;
            return (
                <div className="bg-slate-900 p-5 text-slate-50 rounded-md shadow">
                    <p className='font-bold text-amber-400 line-height-0'>
                        Freq: {frequency.toFixed(0)} Hz
                    </p>
                    <p className='font-bold text-teal-400'>
                        Order: x{order.toFixed(2)}
                    </p>
                    <hr className='my-1'></hr>
                    {payload.map((entry, index) => (
                        <p key={index}>{entry.name}: {entry.value ? entry.value.toFixed(2) : 'N/A'} mg</p>
                    ))}
                </div>
            );
        }
        return null;
    }, [baseFrequency]);

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
            />,
            <ReferenceArea
                key={`area-${index}`}
                x1={marker.frequency - marker.bandWidth / 2}
                x2={marker.frequency + marker.bandWidth / 2}
                y1={axisData.yMin}
                y2={axisData.yMax / 1.4}
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
                        label={<HarmonicsLabel value={`${harmonic.frequency} Hz`} viewBox={undefined} />}
                    />,
                    <ReferenceArea
                        key={`harmonic-area-${index}-${hIndex}`}
                        x1={harmonic.frequency - harmonic.bandWidth / 2}
                        x2={harmonic.frequency + harmonic.bandWidth / 2}
                        y1={axisData.yMin}
                        y2={axisData.yMax / 1.4}
                        fill={marker.color}
                        fillOpacity={0.1}
                        strokeOpacity={0.2}
                    />
                );
            });
        }

        return elements;
    }), [markers, axisData]);



    const toggleAxisVisibility = useCallback((axis: 'x' | 'y' | 'z') => {
        setVisibleAxes(prev => ({ ...prev, [axis]: !prev[axis] }));
    }, []);

    // function darkenColor(color: string, amount: number): string {
    //     return color.replace(/^#/, '').replace(/../g, color =>
    //         ('0' + Math.max(0, Math.min(255, parseInt(color, 16) - amount)).toString(16)).substr(-2)
    //     );
    // }

    // const handleLegendClick = useCallback((e) => {
    //     const { dataKey } = e;
    //     toggleAxisVisibility(dataKey as 'x' | 'y' | 'z');
    // }, [toggleAxisVisibility]);

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
                        const [x, y, z] = line.split(/\s+/).map(value => {
                            const num = Number(value);
                            return num === 0 ? 0.0001 : num; // Replace 0 with a small positive number
                        });
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
                <h2 className='font-bold text-lg ml-3 '>Advanced Spectral Analysis {analysisName && `: ${analysisName}`}</h2>

                <div className="inline-flex rounded-md shadow-sm  ">
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setDomainType('native')}
                            className={`px-4 py-2 text-sm font-medium border ${domainType === 'native'
                                ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                                : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                                } rounded-l-lg`}
                        >
                            Frequency
                        </button>
                        <button
                            type="button"
                            onClick={() => setDomainType('order')}
                            className={`px-4 py-2 text-sm font-medium border ${domainType === 'order'
                                ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                                : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                                } rounded-r-lg`}
                        >
                            Order
                        </button>
                    </div>

                    <div className='flex GAP-5 ml-7'>
                        <div className="inline-flex rounded-md shadow-sm" role="group">
                            <button
                                type="button"
                                onClick={() => toggleAxisVisibility('x')}
                                className={`px-4 py-2 text-sm  font-medium border ${visibleAxes.x
                                    ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                                    : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                                    } rounded-l-lg `}
                            >
                                X-Axis
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleAxisVisibility('y')}
                                className={`px-4 py-2 text-sm  font-medium border ${visibleAxes.y
                                    ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                                    : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                                    } rounded-l-lg `}
                            >
                                X-Axis
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleAxisVisibility('z')}
                                className={`px-4 py-2 text-sm  font-medium border ${visibleAxes.z
                                    ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                                    : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                                    } rounded-r-md `}
                            >
                                Z-Axis
                            </button>
                        </div>
                    </div>
                    <div className='divide-x-2 ml-7 mr-4 '>
                        <Button className='w-[60px]' variant='light' onClick={toggleYAxisScale}>
                            {yAxisScale === 'log' ? 'Linear' : 'Log'}
                        </Button>
                    </div>
                    <Button variant='light' onClick={handleUploadClick}><p className='flex   items-center gap-2'><FiUploadCloud />
                        Upload File</p></Button>
                </div>
            </div>

            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', marginBottom: '20px' }}>
                <ResponsiveContainer width="100%" height="100%" minHeight={300} className="my-custom-chart">
                    <ComposedChart
                        data={data}
                        margin={{ top: 0, right: 0, left: -10, bottom: 0 }}
                        onClick={handleChartClick}
                    >
                        <CartesianGrid vertical={false} horizontal={true} />
                        <XAxis {...getXAxisProps()} />
                        <YAxis {...getYAxisProps()} />
                        <Tooltip content={customTooltip} cursor={{ strokeDasharray: '3 3' }} />
                        {markerElements}
                        <Area
                            type="linear"
                            dataKey="x"
                            fill={`${xAxisColor}33`}
                            stroke={xAxisColor}
                            strokeWidth={2}
                            dot={null}
                            name="X-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.x}
                        />
                        <Area
                            type="linear"
                            dataKey="y"
                            fill={`${yAxisColor}33`}
                            stroke={yAxisColor}
                            strokeWidth={2}
                            dot={false}
                            name="Y-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.y}
                        />
                        <Area
                            type="linear"
                            dataKey="z"
                            fill={`${zAxisColor}33`}
                            stroke={zAxisColor}
                            strokeWidth={2}
                            dot={false}
                            name="Z-Axis"
                            isAnimationActive={false}
                            legendType="circle"
                            hide={!visibleAxes.z}
                        />
                        {steppedLineData.warning && steppedLineData.warning.length > 0 && (
                            <Line
                                type="stepAfter"
                                data={steppedLineData.warning}
                                dataKey="amplitude"
                                stroke={WarningColor}
                                strokeWidth={1}
                                dot={false}
                                name="Warning Line"
                                isAnimationActive={false}
                            />
                        )}
                        {steppedLineData.alert && steppedLineData.alert.length > 0 && (
                            <Line
                                type="stepAfter"
                                data={steppedLineData.alert}
                                dataKey="amplitude"
                                stroke={AlertColor}
                                strokeWidth={1}
                                dot={false}
                                name="Alert Line"
                                isAnimationActive={false}
                            />
                        )}
                        <Brush dataKey="frequency" height={40} stroke="#cccccc" travellerWidth={10} onChange={handleBrush}>
                            <ComposedChart data={data}>
                                <CartesianGrid vertical={false} horizontal={false} />
                                <YAxis hide domain={[axisData.yMin, axisData.yMax]} />
                                <Area
                                    type="linear"
                                    dataKey="x"
                                    fill={`${xAxisColor}00`}
                                    stroke={xAxisColor}
                                    strokeWidth={1}
                                    dot={null}
                                    name="X-Axis"
                                    isAnimationActive={false}
                                    legendType="circle"
                                    hide={!visibleAxes.x}
                                />
                                <Area
                                    type="linear"
                                    dataKey="y"
                                    fill={`${yAxisColor}00`}
                                    stroke={yAxisColor}
                                    strokeWidth={1}
                                    dot={false}
                                    name="Y-Axis"
                                    isAnimationActive={false}
                                    legendType="circle"
                                    hide={!visibleAxes.y}
                                />
                                <Area
                                    type="linear"
                                    dataKey="z"
                                    fill={`${zAxisColor}00`}
                                    stroke={zAxisColor}
                                    strokeWidth={1}
                                    dot={false}
                                    name="Z-Axis"
                                    isAnimationActive={false}
                                    legendType="circle"
                                    hide={!visibleAxes.z}
                                />
                                {steppedLineData.warning && steppedLineData.warning.length > 0 && (
                                    <Line
                                        type="stepAfter"
                                        data={steppedLineData.warning}
                                        dataKey="amplitude"
                                        stroke={WarningColor}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Warning Line"
                                        isAnimationActive={false}
                                    />
                                )}
                                {steppedLineData.alert && steppedLineData.alert.length > 0 && (
                                    <Line
                                        type="stepAfter"
                                        data={steppedLineData.alert}
                                        dataKey="amplitude"
                                        stroke={AlertColor}
                                        strokeWidth={2}
                                        dot={false}
                                        name="Alert Line"
                                        isAnimationActive={false}
                                    />
                                )}
                            </ComposedChart>
                        </Brush>
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <Card>
                <Tabs defaultValue="tab1">
                    <div className='flex item-center justify-between '>
                        <div>
                            <TabsList variant="line">
                                <TabsTrigger className='text-base' value="tab1">Add Frequency Markers</TabsTrigger>
                                <TabsTrigger className='text-base' value="tab2">Add Thresholds</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className='flex justify-between items-center'>
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
                                        id="analysis-name"
                                        maxLength={36}
                                        value={analysisName}
                                        onChange={(e) => setAnalysisName(e.target.value)}
                                        className="block w-[320px] px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                                        placeholder=" "
                                    />
                                    <label htmlFor="analysis-name" className=" absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Analysis Name</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <TabsContent
                            value="tab1"
                            className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                            <div>
                                <div className=" overflow-y-auto mt-2">
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
                                                                maxLength={20}
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
                                                                defaultValue={20}
                                                                min={0}
                                                                onChange={(e) => {
                                                                    const value = Math.max(0, Number(e.target.value));
                                                                    handleMarkerChange(orderIndex, 'bandWidth', value);
                                                                }}
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
                                </div>
                            </div>
                        </TabsContent>
                        <TabsContent
                            value="tab2"
                            className="space-y-2 text-sm leading-7 text-gray-600 dark:text-gray-500"
                        >
                            <div>
                                <div>
                                    <div className="overflow-y-auto mt-2">
                                        <table className="w-full border-collapse">
                                            <thead className='w-full'>
                                                <tr className='bg-slate-50 rounded-md '>
                                                    <th className="text-left p-2 pl-8 w-[200px]">Start Frequency</th>
                                                    <th className="text-left p-2 w-[200px]">Warning Amplitude</th>
                                                    <th className="text-left p-2 w-[200px]">Alert Amplitude</th>
                                                    <th className="text-left p-2 w-[100px]">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className='mr-5'>
                                                {steppedLineInputs.map((input, index) => (
                                                    <tr key={index}>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={input.startFrequency}
                                                                onChange={(e) => handleSteppedLineInputChange(index, 'startFrequency', e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Start Frequency"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={input.warningAmplitude}
                                                                onChange={(e) => handleSteppedLineInputChange(index, 'warningAmplitude', e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Warning Amplitude"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <input
                                                                type="number"
                                                                value={input.alertAmplitude}
                                                                onChange={(e) => handleSteppedLineInputChange(index, 'alertAmplitude', e.target.value)}
                                                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                                placeholder="Alert Amplitude"
                                                            />
                                                        </td>
                                                        <td className="p-2">
                                                            <Button variant="destructive" onClick={() => {
                                                                const newInputs = steppedLineInputs.filter((_, i) => i !== index);
                                                                setSteppedLineInputs(newInputs);
                                                            }}>Remove</Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <Button variant="light" onClick={addSteppedLineInput}>Add Row</Button>
                                        <Button variant="primary" onClick={generateSteppedLineData}>Generate Stepped Line</Button>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </Card>
    );
};

export default EnhancedFFTSpectralPlot;
