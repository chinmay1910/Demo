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
