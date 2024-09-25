import React from 'react';

interface HarmonicsTableProps {
  baseFrequency: number;
  harmonics: number;
  subHarmonics: number;
}

const HarmonicsTable: React.FC<HarmonicsTableProps> = ({
  baseFrequency,
  harmonics,
  subHarmonics,
}) => {
  const generateHarmonics = () => {
    const result = [];
    for (let i = 1; i <= harmonics; i++) {
      result.push({
        type: 'Harmonic',
        number: i,
        frequency: baseFrequency * i,
      });
    }
    return result;
  };

  const generateSubHarmonics = () => {
    const result = [];
    for (let i = 2; i <= subHarmonics + 1; i++) {
      result.push({
        type: 'Sub-harmonic',
        number: i - 1,
        frequency: baseFrequency / i,
      });
    }
    return result;
  };

  const allHarmonics = [...generateSubHarmonics().reverse(), { type: 'Base', number: 0, frequency: baseFrequency }, ...generateHarmonics()];

  return (
    <div className="harmonics-table mt-8">
      <h2 className="text-xl font-bold mb-4">Harmonics and Sub-harmonics</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Type</th>
            <th className="border p-2">Number</th>
            <th className="border p-2">Frequency (Hz)</th>
          </tr>
        </thead>
        <tbody>
          {allHarmonics.map((harmonic, index) => (
            <tr key={index}>
              <td className="border p-2">{harmonic.type}</td>
              <td className="border p-2">{harmonic.type === 'Base' ? '-' : harmonic.number}</td>
              <td className="border p-2">{harmonic.frequency.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HarmonicsTable;
