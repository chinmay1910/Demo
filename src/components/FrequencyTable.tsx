
import { Card } from './Card';

const FrequencyTable = ({
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
        <Card className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Axis</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Harmonics</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-harmonics</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Band Size</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {tableData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{row.frequency}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{row.axis}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="text"
                                    value={markerSets[row.frequency] || ''}
                                    onChange={(e) => onSetNameChange(row.frequency, e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input 
                                    type="number"
                                    value={selectedHarmonics[row.frequency] || 0}
                                    onChange={(e) => onHarmonicsChange(row.frequency, parseInt(e.target.value))}
                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="number"
                                    value={selectedSubHarmonics[row.frequency] || 0}
                                    onChange={(e) => onSubHarmonicsChange(row.frequency, parseInt(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="number"
                                    value={bandSizes[row.frequency] || 0}
                                    onChange={(e) => onBandSizeChange(row.frequency, parseFloat(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    checked={visibleSets[row.frequency] !== false}
                                    onChange={() => onSetVisibilityToggle(row.frequency)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                    onClick={() => removeRow(index, row.frequency)}
                                    className="text-red-600 hover:text-red-900 font-medium"
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Card>
    );
};

export default FrequencyTable;
