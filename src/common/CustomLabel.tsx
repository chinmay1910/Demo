const CustomLabel = ({ viewBox, value }) => {
	const { x, y } = viewBox;

	return (
		<foreignObject x={x - 37} y={y + 30} className=" overflow-visible" width="60" height="100" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px', width: '74px' }} className= "break-words text-balance bg-violet-900 shadow-sm text-white w-max font-medium text-center rounded-lg text-xs px-[3px] py-[1px] rotate-[-90deg]">

				{value}
			</div>
		</foreignObject>
	);
};

export default CustomLabel;
