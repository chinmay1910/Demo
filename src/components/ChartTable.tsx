import React from 'react';

const ChartTable = ({ 
  tableData, 
  removeRow, 
  selectedHarmonics, 
  selectedSubHarmonics, 
  bandSizes, 
  markerSets,
  visibleSets,
  onHarmonicsChange, 
  onSubHarmonicsChange,
  onBandSizeChange,
  onSetNameChange,
  onSetVisibilityToggle
}) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th>Set Name</th>
          <th>Frequency</th>
          <th>Magnitude</th>
          <th>Axis</th>
          <th>Harmonics</th>
          <th>Sub-harmonics</th>
          <th>Band Size</th>
          <th>Visible</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {tableData.map((row, index) => (
          <tr key={index}>
            <td>
              <input
                type="text"
                value={markerSets[row.frequency] || ''}
                onChange={(e) => onSetNameChange(row.frequency, e.target.value)}
                placeholder="Set name"
              />
            </td>
            <td>{row.frequency}</td>
            <td>{row.magnitude}</td>
            <td>{row.axis}</td>
            <td>
              <input
                type="number"
                value={selectedHarmonics[row.frequency] || 1}
                onChange={(e) => onHarmonicsChange(row.frequency, parseInt(e.target.value))}
                min="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={selectedSubHarmonics[row.frequency] || 0}
                onChange={(e) => onSubHarmonicsChange(row.frequency, parseInt(e.target.value))}
                min="1"
              />
            </td>
            <td>
              <input
                type="number"
                value={bandSizes[row.frequency] || 0}
                onChange={(e) => onBandSizeChange(row.frequency, parseFloat(e.target.value))}
                min="0"
                step="0.1"
              />
            </td>
            <td>
              <button
                onClick={() => onSetVisibilityToggle(row.frequency)}
                className={`px-2 py-1 rounded ${visibleSets[row.frequency] !== false ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
              >
                {visibleSets[row.frequency] !== true ? 'Show' : 'Hide'}
              </button>
            </td>
            <td>
              <button onClick={() => removeRow(index, row.frequency)}>Remove</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ChartTable;