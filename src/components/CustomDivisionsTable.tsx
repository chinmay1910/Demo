import React from 'react';
import { Card, Title, TextInput, Select, SelectItem, Button, Table, TableHead, TableRow, TableHeaderCell, TableBody, TableCell } from '@tremor/react';

interface CustomDivisionsTableProps {
  xAxisStart: number;
  setXAxisStart: (value: number) => void;
  xAxisEnd: number;
  setXAxisEnd: (value: number) => void;
  numDivisions: number;
  setNumDivisions: (value: number) => void;
  divisionType: string;
  setDivisionType: (value: string) => void;
  customDivisions: Array<{
    number: number;
    start: number;
    end: number;
    center: number;
  }> | null;
  showCustomDivisions: boolean;
  setShowCustomDivisions: (value: boolean) => void;
}

const CustomDivisionsTable: React.FC<CustomDivisionsTableProps> = ({
  xAxisStart,
  setXAxisStart,
  xAxisEnd,
  setXAxisEnd,
  numDivisions,
  setNumDivisions,
  divisionType,
  setDivisionType,
  customDivisions,
  showCustomDivisions,
  setShowCustomDivisions,
}) => {
  return (
    <Card className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg">
      <Title className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Custom Frequency Divisions</Title>
      <div className="mt-4 space-y-4 sm:space-y-0 sm:flex sm:items-end sm:space-x-4">
        <TextInput
          label="X-Axis Start (Hz)"
          type="number"
          value={xAxisStart.toString()}
          onChange={(e) => setXAxisStart(Number(e.target.value))}
          className="w-full sm:w-auto"
        />
        <TextInput
          label="X-Axis End (Hz)"
          type="number"
          value={xAxisEnd.toString()}
          onChange={(e) => setXAxisEnd(Number(e.target.value))}
          className="w-full sm:w-auto"
        />
        <TextInput
          label="Number of Divisions"
          type="number"
          value={numDivisions.toString()}
          onChange={(e) => setNumDivisions(Number(e.target.value))}
          className="w-full sm:w-auto"
        />
        <Select
          label="Division Type"
          value={divisionType}
          onValueChange={setDivisionType}
          className="w-full sm:w-auto"
        >
          <SelectItem value="equal">Equal Parts</SelectItem>
          <SelectItem value="1/3 octave">1/3 Octave Parts</SelectItem>
        </Select>
        <Button
          onClick={() => setShowCustomDivisions(!showCustomDivisions)}
          className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition duration-300 ease-in-out"
        >
          {showCustomDivisions ? 'Hide' : 'Show'} Divisions
        </Button>
      </div>
      {customDivisions && customDivisions.length > 0 ? (
        <Table className="mt-6 w-full">
          <TableHead>
            <TableRow className="bg-gray-100 dark:bg-gray-700">
              <TableHeaderCell className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Division</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Start Frequency (Hz)</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">End Frequency (Hz)</TableHeaderCell>
              <TableHeaderCell className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Center Frequency (Hz)</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customDivisions.map((division) => (
              <TableRow key={division.number} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <TableCell className="py-3 px-4 text-gray-800 dark:text-gray-200">{division.number}</TableCell>
                <TableCell className="py-3 px-4 text-gray-800 dark:text-gray-200">{division.start.toFixed(2)}</TableCell>
                <TableCell className="py-3 px-4 text-gray-800 dark:text-gray-200">{division.end.toFixed(2)}</TableCell>
                <TableCell className="py-3 px-4 text-gray-800 dark:text-gray-200">{division.center.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="mt-4 text-gray-600 dark:text-gray-400">No custom divisions available.</p>
      )}
    </Card>
  );
};

export default CustomDivisionsTable;
