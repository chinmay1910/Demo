import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Scatter } from 'recharts';
import { FaTimes } from 'react-icons/fa';

const CustomizedDot = (props) => {
  const { cx, cy, payload, xAxisKey, clickedDataPoints } = props;
  const isClicked = clickedDataPoints.some(point => point[xAxisKey] === payload[xAxisKey]);

  if (isClicked) {
    return (
      <circle cx={cx} cy={cy} r={6} stroke="red" strokeWidth={1} fill="white" />
    );
  }

  return null;
};

const ConditionAssessment = () => {
  const [data, setData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [chartCategories, setChartCategories] = useState([]);
  const [xAxisKey, setXAxisKey] = useState(null);
  const [clickedDataPoints, setClickedDataPoints] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    setClickedDataPoints([]);
  }, [data]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const firstItem = jsonData[0];
            const keys = Object.keys(firstItem);
            const xAxisKey = keys[0];
            const otherKeys = keys.slice(1);
            setXAxisKey(xAxisKey);
            setChartCategories(otherKeys);
            setData(jsonData);
            setSelectedData(null);
          } else {
            console.error("Invalid JSON data format.");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClick = (chartData) => {
    if (chartData && chartData.activePayload && chartData.activePayload.length > 0) {
      const point = chartData.activePayload[0].payload;
      if (point && Object.keys(point).length > 0 && point[xAxisKey] !== undefined) {
        setSelectedData(point);
        setClickedDataPoints((prevPoints) => {
          if (!prevPoints.some(p => p[xAxisKey] === point[xAxisKey])) {
            return [...prevPoints, point];
          }
          return prevPoints;
        });
      }
    }
  };

  return (
    <div className="p-4">
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mb-4 p-2 border border-gray-300 rounded"
      />

      <div>
        {data.length === 0 ? (
          <p>No data available. Please upload a file.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              onClick={handleClick}
              ref={chartRef}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisKey} 
                type="category"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {chartCategories.map((key, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={key}
                  stroke={index === 0 ? "#8884d8" : "#82ca9d"}
                  strokeDasharray={index === 0 ? "5 5" : "5 2"}
                  dot={<CustomizedDot xAxisKey={xAxisKey} clickedDataPoints={clickedDataPoints} />}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Rest of the component (Selected Data Point and Clicked Data Points table) remains the same */}
    </div>
  );
};

export default ConditionAssessment;