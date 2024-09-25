const SubHarmonicsLabel = ({ viewBox, value }) => {
	const { x, y } = viewBox;

	return (
		<foreignObject x={x - 28} y={y + 0} className="pt-6" width="60" height="98" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px', width: '56px' }} className="break-words bg-slate-400 shadow-sm text-white w-max font-bold text-center rounded-lg text-xs px-[2px] py-[1px] rotate-[-90deg]">

				{value}
			</div>
		</foreignObject>
	);
};

export default SubHarmonicsLabel;
