import { useState, useMemo, useEffect } from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ReferenceLine,
	ResponsiveContainer,
	Legend,
	ReferenceArea,
	Brush,
} from "recharts";


import { TabsList, Tabs, TabsContent, TabsTrigger } from "./Tabs";
import FrequencyTable from "./FrequencyTable";
import DivisionsTable from "./DivisionsTable";
import { CustomTooltip } from "../common/Tooltip";
import { LoaderCircle } from "lucide-react";
import CustomLabel from "../common/CustomLabel";
import { Card } from "./Card";
export function FeatureExtraction() {
	const [chartData, setChartData] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [referenceLines, setReferenceLines] = useState([]);
	const [referenceAreas, setReferenceAreas] = useState([]);
	const [visibleLines, setVisibleLines] = useState({});
	const [loading, setLoading] = useState(false);
	const [selectedHarmonics, setSelectedHarmonics] = useState({});
	const [selectedSubHarmonics, setSelectedSubHarmonics] = useState({});
	const [bandSizes, setBandSizes] = useState({});
	const [markerSets, setMarkerSets] = useState({});
	const [visibleSets, setVisibleSets] = useState({});
	const [isLogScale, setIsLogScale] = useState(false);
	const [customDivisions, setCustomDivisions] = useState([]);
	const [xAxisLength, setXAxisLength] = useState(0);
	const [numDivisions, setNumDivisions] = useState(0);
	const [divisionType, setDivisionType] = useState('equal'); // 'equal' or 'octave'
	const [xAxisStart, setXAxisStart] = useState(0);
	const [xAxisEnd, setXAxisEnd] = useState(1000);
	const [showCustomDivisions, setShowCustomDivisions] = useState(true);
	const [brushDomain, setBrushDomain] = useState(null);

	const lineColors = [
		"#d3d3d3",
		"#e25d47",
		"#e8c1a0",
		"#61cdbb",
		"#e8a838",
		"#f1e15b",
		"#f47560",

	];

	// Generate a list of distinct colors for the sets
	const setColors = useMemo(() => [
		"#f9c80e", "#f86624", "#ea3546", "#8d2a5f", "#662e9b",
		"#43bccd", "#AED581", "#7986CB", "#4DB6AC", "#FFD54F"
	], []);

	// Helper function to round to nearest integer
	const roundToNearestInteger = (num: number): number => {
		return Math.round(num);
	};

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (!file) return;
		setLoading(true);
		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target.result;
			parseData(text);
			setLoading(false);
		};
		reader.readAsText(file);
	};

	const generateColumnLabels = (numColumns) => {
		const alphabet = "XYZABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
		return Array.from({ length: numColumns }, (_, i) => `${alphabet[i]} Axis`);
	};

	const parseData = (text) => {
		const rows = text.trim().split("\n");
		const columnCount = rows[0].split("\t").length;
		const labels = generateColumnLabels(columnCount);

		const parsedData = rows.map((row, index) => {
			const values = row.split("\t");
			const numericFrequency = index + 1;
			const dataObject = { frequency: numericFrequency };
			values.forEach((value, idx) => {
				dataObject[labels[idx]] = parseFloat(value);
			});
			return dataObject;
		});

		setChartData(parsedData);
		setVisibleLines(
			labels.reduce((acc, label) => {
				acc[label] = true;
				return acc;
			}, {})
		);
	};

	const handleSetVisibilityToggle = (frequency) => {
		setVisibleSets(prev => ({
			...prev,
			[frequency]: !prev[frequency]
		}));
	};

	const addMarker = (frequency: number, magnitude: number, label: string) => {
		const roundedFrequency = roundToNearestInteger(frequency);
		if (!tableData.find(item => item.frequency === roundedFrequency && item.axis === label)) {
			const newData = {
				frequency: roundedFrequency,
				magnitude,
				axis: label,
			};
			setTableData([...tableData, newData]);

			const defaultHarmonics = 1;
			const defaultSubHarmonics = 0;
			const defaultBandSize = 1;
			const defaultSetName = `Set ${Object.keys(markerSets).length + 1}`;

			setSelectedHarmonics(prev => ({ ...prev, [roundedFrequency]: defaultHarmonics }));
			setSelectedSubHarmonics(prev => ({ ...prev, [roundedFrequency]: defaultSubHarmonics }));
			setBandSizes(prev => ({ ...prev, [roundedFrequency]: defaultBandSize }));
			setMarkerSets(prev => ({ ...prev, [roundedFrequency]: defaultSetName }));
			setVisibleSets(prev => ({ ...prev, [roundedFrequency]: true }));

			updateChartMarkers(roundedFrequency, defaultHarmonics, defaultSubHarmonics, defaultBandSize);
		}
	};

	const generateReferences = (frequency: number, harmonics: number, subHarmonics: number, bandSize: number) => {
		const newLines = [];
		const newAreas = [];
		const setName = markerSets[frequency] || `Set ${Object.keys(markerSets).length + 1}`;
		const setColor = setColors[Object.keys(markerSets).indexOf(frequency.toString()) % setColors.length];
		const isVisible = visibleSets[frequency] !== false;

		// Add base frequency reference area
		const baseFrequency = roundToNearestInteger(frequency);
		newAreas.push({
			x1: roundToNearestInteger(baseFrequency - bandSize / 2),
			x2: roundToNearestInteger(baseFrequency + bandSize / 2),
			originalFrequency: frequency,
			frequency: baseFrequency,
			isBaseFrequency: true,
			setName,
			setColor,
			isVisible
		});

		// Generate harmonics
		for (let i = 1; i <= harmonics; i++) {
			const harmonicFrequency = roundToNearestInteger(frequency * i);
			newLines.push({
				frequency: harmonicFrequency,
				originalFrequency: frequency,
				setName,
				setColor,
				isVisible
			});
			newAreas.push({
				x1: roundToNearestInteger(harmonicFrequency - bandSize / 2),
				x2: roundToNearestInteger(harmonicFrequency + bandSize / 2),
				originalFrequency: frequency,
				frequency: harmonicFrequency,
				isBaseFrequency: false,
				setName,
				setColor,
				isVisible
			});
		}

		// Generate sub-harmonics
		for (let n = 2; n <= subHarmonics + 1; n++) {
			const subHarmonicFrequency = roundToNearestInteger(frequency / n);
			newLines.push({
				frequency: subHarmonicFrequency,
				originalFrequency: frequency,
				setName,
				setColor,
				isVisible,
				isSubHarmonic: true
			});
			newAreas.push({
				x1: roundToNearestInteger(subHarmonicFrequency - bandSize / 2),
				x2: roundToNearestInteger(subHarmonicFrequency + bandSize / 2),
				originalFrequency: frequency,
				frequency: subHarmonicFrequency,
				isBaseFrequency: false,
				setName,
				setColor,
				isVisible,
				isSubHarmonic: true
			});
		}

		return { newLines, newAreas };
	};

	const handleSetNameChange = (frequency, name) => {
		setMarkerSets(prev => ({ ...prev, [frequency]: name }));
	};

	const handleHarmonicsChange = (frequency, value) => {
		setSelectedHarmonics(prev => ({
			...prev,
			[frequency]: value,
		}));
		updateChartMarkers(frequency, value, selectedSubHarmonics[frequency] || 0, bandSizes[frequency] || 0);
	};

	const handleSubHarmonicsChange = (frequency, value) => {
		setSelectedSubHarmonics(prev => ({
			...prev,
			[frequency]: value,
		}));
		updateChartMarkers(frequency, selectedHarmonics[frequency] || 1, value, bandSizes[frequency] || 0);
	};

	const handleBandSizeChange = (frequency, value) => {
		setBandSizes(prev => ({
			...prev,
			[frequency]: value,
		}));
		updateChartMarkers(frequency, selectedHarmonics[frequency] || 1, selectedSubHarmonics[frequency] || 0, value);
	};

	const updateChartMarkers = (frequency, harmonics, subHarmonics, bandSize) => {
		// Remove all previous lines and areas for this frequency
		const filteredLines = referenceLines.filter(line => line.originalFrequency !== frequency);
		const filteredAreas = referenceAreas.filter(area => area.originalFrequency !== frequency);

		const { newLines, newAreas } = generateReferences(frequency, harmonics, subHarmonics, bandSize);

		// Update state with new lines and areas
		setReferenceLines([...filteredLines, ...newLines]);
		setReferenceAreas([...filteredAreas, ...newAreas]);
	};

	const removeRow = (index, frequency) => {
		const updatedData = tableData.filter((_, i) => i !== index);
		setTableData(updatedData);

		setReferenceLines(
			referenceLines.filter((line) => line.originalFrequency !== frequency)
		);
		setReferenceAreas(
			referenceAreas.filter((area) => area.originalFrequency !== frequency)
		);
	};

	const handleLegendClick = (e) => {
		const { dataKey } = e;
		setVisibleLines((prevState) => ({
			...prevState,
			[dataKey]: !prevState[dataKey],
		}));
	};

	const renderLegend = (props) => {
		const { payload } = props;
		return (
			<ul className="flex space-x-4 justify-end mb-10 w-max ml-auto p-5">
				{payload.map((entry, index) => (
					<li
						key={`item-${index}`}
						className="cursor-pointer flex items-center"
						onClick={() => handleLegendClick(entry)}
					>
						<div
							className="w-3 h-3 mr-2 rounded-full"
							style={{
								backgroundColor: visibleLines[entry.dataKey]
									? entry.color
									: "#d3d3d3",
							}}
						></div>
						<span
							className={`text-sm ${visibleLines[entry.dataKey] ? "text-black" : "text-gray-400"
								}`}
						>
							{entry.value}
						</span>
					</li>
				))}
			</ul>
		);
	};

	const toggleScale = () => {
		setIsLogScale(!isLogScale);
	};

	const xAxisTickFormatter = (value) => {
		if (isLogScale) {
			return value.toExponential(0);
		}
		return value;
	};

	const generateXAxisTicks = (data) => {
		if (!data || data.length === 0) return [];

		const minFreq = Math.max(1, Math.min(...data.map(d => d.frequency))); // Ensure minimum is at least 1 for log scale
		const maxFreq = Math.max(...data.map(d => d.frequency));

		if (isLogScale) {
			const logMin = Math.log10(minFreq);
			const logMax = Math.log10(maxFreq);
			const step = (logMax - logMin) / 5; // Adjust this number to control the number of ticks

			return Array.from({ length: 6 }, (_, i) => Math.pow(10, logMin + step * i));
		} else {
			const interval = Math.ceil((maxFreq - minFreq) / 5); // Adjust this number to control the number of ticks
			return Array.from({ length: 6 }, (_, i) => minFreq + interval * i);
		}
	};

	const handleBrushChange = (domain) => {
		if (domain && domain.startIndex !== undefined && domain.endIndex !== undefined) {
			setBrushDomain([
				chartData[domain.startIndex].frequency,
				chartData[domain.endIndex].frequency
			]);
		} else {
			setBrushDomain(null);
		}
	};

	const xAxisProps = {
		dataKey: "frequency",
		type: "number",
		scale: isLogScale ? "log" : "linear",
		domain: brushDomain || (isLogScale ? ['auto', 'auto'] : [0, 'auto']),
		ticks: generateXAxisTicks(chartData),
		tickFormatter: xAxisTickFormatter,
		allowDataOverflow: true,
		minTickGap: 24,
		unit: 'Hz',
		axisLine: false,
	};

	const generateCustomDivisions = () => {
		if (xAxisEnd <= xAxisStart || numDivisions <= 0) return;

		let divisions = [];
		const xAxisLength = xAxisEnd - xAxisStart;

		if (divisionType === 'equal') {
			const divisionWidth = xAxisLength / numDivisions;
			for (let i = 0; i < numDivisions; i++) {
				const start = xAxisStart + i * divisionWidth;
				const end = xAxisStart + (i + 1) * divisionWidth;
				divisions.push({
					number: i + 1,
					start: start,
					end: end,
					center: (start + end) / 2,
				});
			}
		} else if (divisionType === '1/3 octave') {
			const startFreq = xAxisStart;
			const multiplier = Math.pow(2, 1 / 3); // 1/3 octave multiplier
			let start = startFreq;
			let i = 0;
			while (start < xAxisEnd && i < numDivisions) {
				const end = start * multiplier;
				divisions.push({
					number: i + 1,
					start: start,
					end: Math.min(end, xAxisEnd),
					center: Math.sqrt(start * Math.min(end, xAxisEnd)),
				});
				start = end;
				i++;
			}
		}

		setCustomDivisions(divisions);
	};

	useEffect(() => {
		generateCustomDivisions();
	}, [xAxisStart, xAxisEnd, numDivisions, divisionType]);

	const renderCustomDivisionAreas = () => {
		if (!showCustomDivisions) return null;
		return customDivisions.map((division, index) => (
			<ReferenceArea
				key={`custom-division-${index}`}
				x1={division.start}
				x2={division.end}
				fill="#8884d833"
				fillOpacity={0.3}
				stroke="#8884d8"
				strokeOpacity={0.5}
			/>
		));
	};

	return (
		<div className="pt-10">
			<Card className="pt-10">
		
				<div className="flex gap-4 items-center justify-between mb-4">
					<h1 className="mt-2 text-xl ml-5 font-semibold text-gray-700 dark:text-gray-50 ">Vibration Spectral Analysis</h1>
					<div className="flex items-center gap-4">
						<label className="flex items-center gap-2">
							<input
								type="checkbox"
								checked={isLogScale}
								onChange={toggleScale}
								className="form-checkbox h-5 w-5 text-blue-600"
							/>
							<span>Log Scale</span>
						</label>
						<label
							className={`bg-formfour/70 text-white px-4 py-2 rounded-md flex justify-center items-center cursor-pointer capitalize text-md gap-2 flex-row-reverse ${loading ? "opacity-50 cursor-not-allowed" : ""
								}`}
						>
							{loading && (
								<LoaderCircle
									size={20}
									strokeWidth={1.5}
									className="animate-spin"
								/>
							)}
							{!loading ? "Upload" : "Uploading..."}
							<input
								type="file"
								accept=".txt"
								onChange={handleFileUpload}
								style={{ display: "none" }}
								disabled={loading}
							/>
						</label>
					</div>
				</div>

				<ResponsiveContainer width="100%" height={480}>
					<LineChart
						data={chartData}
						margin={{ top: 0, right: 20, left: 0, bottom: 20 }}
					>
						<CartesianGrid
							vertical={false}
							horizontal={false}
							strokeDasharray="3 3" />
						<XAxis {...xAxisProps} />
						<YAxis
							axisLine={false} />

						<Tooltip content={<CustomTooltip />} />
						<Legend
							layout="horizontal"
							align="right"
							verticalAlign="top"
							content={renderLegend}
						/>

						{Object.keys(chartData[0] || {}).map((key, index) => {
							if (key === "frequency") return null;
							const color = lineColors[index] || lineColors[5];
							return (
								<Line
									strokeWidth={2}
									key={key}
									type="linear"
									dataKey={key}
									stroke={visibleLines[key] ? color : "transparent"}
									dot={false}
									activeDot={{
										onClick: (e, payload) =>
											addMarker(
												payload.payload.frequency,
												payload.payload[key],
												key
											),
									}}
								/>
							);
						})}

						{referenceLines.filter(line => visibleSets[line.originalFrequency] !== false).map((line, index) => (
							<ReferenceLine
								key={`line-${index}`}
								x={line.frequency}
								stroke={line.setColor}
								strokeDasharray="4 4"
								label={<CustomLabel value={`${line.frequency} Hz`} />}
							/>
						))}

						{referenceAreas.filter(area => visibleSets[area.originalFrequency] !== false).map((area, index) => (
							<ReferenceArea
								key={`area-${index}`}
								x1={area.x1}
								x2={area.x2}
								fill={`${area.setColor}${area.isBaseFrequency ? '4D' : '33'}`}
							/>
						))}
						<Brush
							dataKey="frequency"
							height={30}
							stroke="#8884d8"
							onChange={handleBrushChange}
						>
							<LineChart>
								<XAxis {...xAxisProps} hide />
								<YAxis hide />
								{Object.keys(chartData[0] || {}).map((key, index) => {
									if (key === "frequency") return null;
									const color = lineColors[index] || lineColors[5];
									return (
										<Line
											key={key}
											type="monotone"
											dataKey={key}
											stroke={visibleLines[key] ? color : "transparent"}
											dot={false}
										/>
									);
								})}
							</LineChart>
						</Brush>
						{renderCustomDivisionAreas()}
					</LineChart>

				</ResponsiveContainer>
			</Card>

			<Tabs defaultValue="frequencies" className="mt-24">
				<TabsList>
					<TabsTrigger value="frequencies">Frequencies</TabsTrigger>
					<TabsTrigger value="divisions">Custom Divisions</TabsTrigger>
				</TabsList>
				<TabsContent value="frequencies">
					<FrequencyTable
						tableData={tableData}
						removeRow={removeRow}
						selectedHarmonics={selectedHarmonics}
						selectedSubHarmonics={selectedSubHarmonics}
						bandSizes={bandSizes}
						markerSets={markerSets}
						visibleSets={visibleSets}
						onHarmonicsChange={handleHarmonicsChange}
						onSubHarmonicsChange={handleSubHarmonicsChange}
						onBandSizeChange={handleBandSizeChange}
						onSetNameChange={handleSetNameChange}
						onSetVisibilityToggle={handleSetVisibilityToggle}
					/>
				</TabsContent>
				<TabsContent value="divisions">
					<DivisionsTable
						xAxisStart={xAxisStart}
						setXAxisStart={setXAxisStart}
						xAxisEnd={xAxisEnd}
						setXAxisEnd={setXAxisEnd}
						numDivisions={numDivisions}
						setNumDivisions={setNumDivisions}
						divisionType={divisionType}
						setDivisionType={setDivisionType}
						showCustomDivisions={showCustomDivisions}
						setShowCustomDivisions={setShowCustomDivisions}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}

export default FeatureExtraction;
