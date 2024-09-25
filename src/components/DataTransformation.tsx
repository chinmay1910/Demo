<<<<<<< HEAD
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceArea, Brush, AreaChart, Area, Line, ComposedChart } from 'recharts';
import { Card } from './Card';
import { FiEye, FiEyeOff, FiUploadCloud } from "react-icons/fi";
import { Button } from './Button';
import CustomLabel from '../common/CustomLabel';
import { scaleLog } from 'd3-scale';
import './FFTCss.css';
import HarmonicsLabel from '../common/HarmonicsLabel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';
import QuantitySelector from './QunatitySelector';
// Helper functions
const generateColor = (index: number) => {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 70%, 50%)`;
};

// Types
type Axis = 'x' | 'y' | 'z';
type VisibleAxes = Record<Axis, boolean>;
type Marker = {
  frequency: number;
  bandWidth: number;
  color: string;
  harmonics: number;
  subHarmonics: number;
  axis: Axis;
  name: string;
  visible: boolean;
  harmonicMarkers?: HarmonicMarker[];
};
type HarmonicMarker = {
  frequency: number;
  bandWidth: number;
  isHarmonic: boolean;
  order?: string;
};
type DataPoint = {
  frequency: number;
  x: number;
  y: number;
  z: number;
};
type SteppedLineInput = {
  startFrequency: string;
  warningAmplitude: string;
  alertAmplitude: string;
};

// Constants
const AXIS_COLORS = {
  x: "#ffc6b7",
  y: "#fd8c73",
  z: "#e30613"
};
const ALERT_COLORS = {
  warning: "#FACC15",
  alert: "#E11D48"
};

// Components

const EnhancedFFTSpectralPlot: React.FC = () => {
  // State
  const [data, setData] = useState<DataPoint[]>([]);
  const [baseFrequency, setBaseFrequency] = useState(100);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [colorIndex, setColorIndex] = useState(0);
  const [visibleAxes, setVisibleAxes] = useState<VisibleAxes>({ x: true, y: true, z: true });
  const [markerName, setMarkerName] = useState('');
  const [brushDomain, setBrushDomain] = useState<[number, number] | null>(null);
  const [markerOrder, setMarkerOrder] = useState<number[]>([]);
  const [steppedLineData, setSteppedLineData] = useState<{ warning: DataPoint[], alert: DataPoint[] }>({ warning: [], alert: [] });
  const [steppedLineInputs, setSteppedLineInputs] = useState<SteppedLineInput[]>([{ startFrequency: '', warningAmplitude: '', alertAmplitude: '' }]);
  const [domainType, setDomainType] = useState<'native' | 'order'>('native');
  const [analysisName, setAnalysisName] = useState('');
  const [yAxisScale, setYAxisScale] = useState<'linear' | 'log'>('linear');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized values
  const axisData = useMemo(() => {
    if (data.length === 0) return { xMin: 0, xMax: 0, yMin: 0, yMax: 0 };
    const xMin = 0;
    const xMax = data[data.length - 1].frequency;
    const yValues = data.flatMap(d => [d.x, d.y, d.z].filter(v => v !== undefined));
    const yMin = Math.min(...yValues) * 1.1;
    const yMax = Math.max(...yValues) * 1.5;
    return { xMin, xMax, yMin, yMax };
  }, [data]);

  // Callbacks
  const toggleYAxisScale = useCallback(() => {
    setYAxisScale(prevScale => (prevScale === 'linear' ? 'log' : 'linear'));
  }, []);

  const handleSteppedLineInputChange = useCallback((index: number, field: keyof SteppedLineInput, value: string) => {
    setSteppedLineInputs(prev => {
      const newInputs = [...prev];
      newInputs[index][field] = value;
      return newInputs;
    });
  }, []);

  const addSteppedLineInput = useCallback(() => {
    setSteppedLineInputs(prev => [...prev, { startFrequency: '', warningAmplitude: '', alertAmplitude: '' }]);
  }, []);

  const generateSteppedLineData = useCallback(() => {
    const warningData: DataPoint[] = [];
    const alertData: DataPoint[] = [];

    steppedLineInputs.forEach((input, i) => {
      const start = Number(input.startFrequency);
      const warningAmplitude = Number(input.warningAmplitude);
      const alertAmplitude = Number(input.alertAmplitude);
      const end = i < steppedLineInputs.length - 1 ? Number(steppedLineInputs[i + 1].startFrequency) : start + 1;

      warningData.push({ frequency: start, x: warningAmplitude, y: warningAmplitude, z: warningAmplitude });
      warningData.push({ frequency: end, x: warningAmplitude, y: warningAmplitude, z: warningAmplitude });

      alertData.push({ frequency: start, x: alertAmplitude, y: alertAmplitude, z: alertAmplitude });
      alertData.push({ frequency: end, x: alertAmplitude, y: alertAmplitude, z: alertAmplitude });
    });

    warningData.sort((a, b) => a.frequency - b.frequency);
    alertData.sort((a, b) => a.frequency - b.frequency);

    setSteppedLineData({ warning: warningData, alert: alertData });
  }, [steppedLineInputs]);

  const handleChartClick = useCallback((event: any) => {
    if (!event || !event.activeLabel) return;

    const clickedFrequency = Math.round(Number(event.activeLabel));
    const activeDataKey = event.activeTooltipIndex !== undefined
      ? Object.keys(event.activePayload[0].payload).find(key => key !== 'frequency' && visibleAxes[key as Axis])
      : null;

    const newMarker: Marker = {
      frequency: clickedFrequency,
      bandWidth: 20,
      color: generateColor(colorIndex),
      harmonics: 0,
      subHarmonics: 0,
      axis: activeDataKey as Axis,
      name: markerName || `Marker ${markers.length + 1}`,
      visible: true,
    };
    setMarkers(prev => [...prev, newMarker]);
    setMarkerOrder(prev => [...prev, markers.length]);
    setColorIndex(prev => prev + 1);
    setMarkerName('');
  }, [colorIndex, visibleAxes, markers.length, markerName]);

  const updateHarmonicMarkers = useCallback((marker: Marker): Marker => {
    const harmonicMarkers: HarmonicMarker[] = [
      ...Array(Number(marker.subHarmonics)).fill(null).map((_, i) => ({
        frequency: Math.round(marker.frequency / (i + 2)),
        bandWidth: marker.bandWidth,
        isHarmonic: true,
        order: `1/${i + 2}`
      })),
      ...Array(Number(marker.harmonics)).fill(null).map((_, i) => ({
        frequency: Math.round(marker.frequency * (i + 2)),
        bandWidth: marker.bandWidth,
        isHarmonic: true
      }))
    ];
    return { ...marker, harmonicMarkers };
  }, []);

  const handleMarkerChange = useCallback((index: number, field: keyof Marker, value: any) => {
    setMarkers(prev => {
      const updatedMarkers = prev.map((marker, i) => {
        if (i !== index) return marker;
        let updatedMarker = { ...marker, [field]: field === 'frequency' ? Math.round(Number(value)) : value };
        return updateHarmonicMarkers(updatedMarker);
      });
      return updatedMarkers;
    });
  }, [updateHarmonicMarkers]);

  const handleRemoveMarker = useCallback((index: number) => {
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

  const toggleMarkerVisibility = useCallback((index: number) => {
    setMarkers(prev => prev.map((marker, i) =>
      i === index ? { ...marker, visible: !marker.visible } : marker
    ));
  }, []);

  const handleBrush = useCallback((brushArea: { startIndex: number; endIndex: number; } | null) => {
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
      const yMin = Math.max(axisData.yMin, 0.0001);
      const yMax = axisData.yMax;
      return {
        scale: scaleLog().base(Math.E),
        domain: [yMin, yMax],
        tickFormatter: (value: number) => value.toExponential(2),
      };
    } else {
      return {
        domain: [axisData.yMin, axisData.yMax],
        tickFormatter: (value: number) => value.toFixed(2),
      };
    }
  }, [yAxisScale, axisData]);

  const getXAxisProps = useCallback(() => {
    const props = {
      dataKey: "frequency",
      type: "number",
      minTickGap: domainType === 'native' ? 20 : 10,
      tickCount: domainType === 'native' ? 34 : 22,
      domain: brushDomain || [axisData.xMin, axisData.xMax],
      tickFormatter: (value: number) => domainType === 'native' ? value : (value / baseFrequency).toFixed(1) + 'x',
    };
    return props;
  }, [domainType, brushDomain, axisData, baseFrequency]);

  const customTooltip = useCallback(({ active, payload, label }: any) => {
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
          {payload.map((entry: any, index: number) => (
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
        label={<CustomLabel value={`${marker.name}`} viewBox={undefined} />}
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

  const toggleAxisVisibility = useCallback((axis: Axis) => {
    setVisibleAxes(prev => ({ ...prev, [axis]: !prev[axis] }));
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');
        const parsedData = lines
          .filter(line => line.trim() !== '')
          .map((line, index) => {
            const [x, y, z] = line.split(/\s+/).map(value => {
              const num = Number(value);
              return num === 0 ? 0.0001 : num;
            });
            return { frequency: index, x, y, z };
          });
        setData(parsedData);
      };
      reader.readAsText(file);
    }
  }, []);

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className="w-full mx-auto mt-4">
      <div className='flex justify-between items-center mb-7'>
        <h2 className='font-bold text-lg ml-3'>Advanced Spectral Analysis {analysisName && `: ${analysisName}`}</h2>

        <div className="inline-flex rounded-md shadow-sm">
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

          <div className='flex gap-5 ml-7'>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              {(['x', 'y', 'z'] as Axis[]).map((axis) => (
                <button
                  key={axis}
                  type="button"
                  onClick={() => toggleAxisVisibility(axis)}
                  className={`px-4 py-2 text-sm font-medium border ${visibleAxes[axis]
                    ? 'bg-slate-50 text-slate-900 border-slate-200 hover:bg-slate-100 hover:text-slate-1000'
                    : 'bg-white text-slate-300 border-gray-200 hover:bg-gray-50 hover:text-gray-600'
                    } ${axis === 'x' ? 'rounded-l-lg' : axis === 'z' ? 'rounded-r-lg' : ''}`}
                >
                  {axis.toUpperCase()}-Axis
                </button>
              ))}
            </div>
          </div>
          <div className='divide-x-2 ml-7 mr-4'>
            <Button className='w-[60px]' variant='light' onClick={toggleYAxisScale}>
              {yAxisScale === 'log' ? 'Linear' : 'Log'}
            </Button>
          </div>
          <Button variant='light' onClick={handleUploadClick}>
            <p className='flex items-center gap-2'><FiUploadCloud />Upload File</p>
          </Button>
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
            {(['x', 'y', 'z'] as Axis[]).map((axis) => (
              <Area
                key={axis}
                type="linear"
                dataKey={axis}
                fill={`${AXIS_COLORS[axis]}33`}
                stroke={AXIS_COLORS[axis]}
                strokeWidth={2}
                dot={null}
                name={`${axis.toUpperCase()}-Axis`}
                isAnimationActive={false}
                legendType="circle"
                hide={!visibleAxes[axis]}
              />
            ))}
            {steppedLineData.warning.length > 0 && (
              <Line
                type="stepAfter"
                data={steppedLineData.warning}
                dataKey="x"
                stroke={ALERT_COLORS.warning}
                strokeWidth={1}
                dot={false}
                name="Warning Line"
                isAnimationActive={false}
              />
            )}
            {steppedLineData.alert.length > 0 && (
              <Line
                type="stepAfter"
                data={steppedLineData.alert}
                dataKey="x"
                stroke={ALERT_COLORS.alert}
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
                {(['x', 'y', 'z'] as Axis[]).map((axis) => (
                  <Area
                    key={axis}
                    type="linear"
                    dataKey={axis}
                    fill={`${AXIS_COLORS[axis]}00`}
                    stroke={AXIS_COLORS[axis]}
                    strokeWidth={1}
                    dot={null}
                    name={`${axis.toUpperCase()}-Axis`}
                    isAnimationActive={false}
                    legendType="circle"
                    hide={!visibleAxes[axis]}
                  />
                ))}
                {steppedLineData.warning.length > 0 && (
                  <Line
                    type="stepAfter"
                    data={steppedLineData.warning}
                    dataKey="x"
                    stroke={ALERT_COLORS.warning}
                    strokeWidth={2}
                    dot={false}
                    name="Warning Line"
                    isAnimationActive={false}
                  />
                )}
                {steppedLineData.alert.length > 0 && (
                  <Line
                    type="stepAfter"
                    data={steppedLineData.alert}
                    dataKey="x"
                    stroke={ALERT_COLORS.alert}
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
          <div className='flex item-center justify-between'>
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
                  <label htmlFor="analysis-name" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1">Analysis Name</label>
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
                <div className="overflow-y-auto mt-2">
                  <table className="w-full border-collapse">
                    <thead className='w-full'>
                      <tr className='bg-slate-50 rounded-md'>
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
                        if (!marker) return null;
                        return (
                          <tr key={index}>
                            <td className="p-2">
                              <span style={{ borderLeftWidth: '4px', borderLeftColor: marker.color, opacity: 0.9 }} className='text-base pl-5 font-bold'>{marker.name}</span>
                            </td>
                            <td className="p-2">
                              <span className='text-base text-center font-medium'>{(marker.frequency / baseFrequency).toFixed(2)}x</span>
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
                                onChange={(e) => handleMarkerChange(orderIndex, 'frequency', Math.round(Number(e.target.value)))}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Frequency"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="number"
                                value={marker.bandWidth}
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
                                onChange={(e) => handleMarkerChange(orderIndex, 'axis', e.target.value as Axis)}
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
                                  className={`w-[80px] flex items-center justify-center gap-1 ${marker.visible ? '' : 'bg-green-100 text-green-700'}`}
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
                <div className="overflow-y-auto mt-2">
                  <table className="w-full border-collapse">
                    <thead className='w-full'>
                      <tr className='bg-slate-50 rounded-md'>
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
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default EnhancedFFTSpectralPlot;
=======
import { PureComponent } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';

const data = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

export default class DataProcessing extends PureComponent {
  render() {
    return (
      <div>
        {/* Other content of DataProcessing */}

        {/* Area Chart */}
        <div style={{ width: '100%', height: '400px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffc658" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#ffc658" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                stroke="#f4f4f4" // Gray color for grid lines
                vertical={false} // Hide vertical grid lines
                horizontal={true} // Show horizontal grid lines
              />
              <XAxis 
              minTickGap={100}
                dataKey="name"
                axisLine={false} // Hide X-axis line
                tickLine={false} // Hide X-axis ticks
              />
              <YAxis 
                axisLine={false} // Hide Y-axis line
                tickLine={false} // Hide Y-axis ticks
              />
              <Tooltip />
              {/* ReferenceArea: highlights a specific area on the chart */}
              <ReferenceArea
                x1="Page B" x2="Page C"
                y1={0}
                y2={16000}
                stroke="0"
                strokeOpacity={0.3}
              />
              <Area
                type="linear" // Use linear for sharp lines
                dataKey="uv"
                stackId="1"
                stroke="#8884d8" // Stroke color for the 'uv' area
                fill="url(#colorUv)"
                strokeWidth={2} // Set the stroke width for 'uv' area
              />
              <Area
                type="linear" // Use linear for sharp lines
                dataKey="pv"
                stackId="1"
                stroke="#82ca9d" // Stroke color for the 'pv' area
                fill="url(#colorPv)"
                strokeWidth={2} // Set the stroke width for 'pv' area
              />
              <Area
                type="linear" // Use linear for sharp lines
                dataKey="amt"
                stackId="1"
                stroke="#ffc658" // Stroke color for the 'amt' area
                fill="url(#colorAmt)"
                strokeWidth={2} // Set the stroke width for 'amt' area
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}
>>>>>>> b29e959e4d0250b525df9c052c553bea413bb994
