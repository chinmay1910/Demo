import { Button } from "@headlessui/react";
import { Card } from "./Card";

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


const EnhancedFFTTable = () => {


  return (
    <div>
      
      <div className='pt-10'>


<div>
    <Card className="px-8 overflow-y-auto mt-2">
        <div className='flex justify-between items-center'>

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
    </Card>
</div>
</div>
    </div>
  )
}

export default EnhancedFFTTable
