const CustomLabel = ({ viewBox, value }) => {
	const { x, y } = viewBox;

	return (
		<foreignObject x={x - 34} y={y - 4} className="pt-7 overflow-visible" width="60" height="100" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px' }} className="w-[67px] break-words bg-violet-900 shadow-sm text-white w-max font-medium text-center rounded-lg text-xs px-[2px] py-[1px] rotate-[-90deg]">

				{value}
			</div>
		</foreignObject>
	);
};

export default CustomLabel;
