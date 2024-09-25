const HarmonicsLabel = ({ viewBox, value }) => {
	const { x, y } = viewBox;

	return (
<<<<<<< HEAD
		<foreignObject x={x - 28} y={y + 0} className="pt-6" width="60" height="98" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px', width: '56px' }} className="break-words bg-slate-700 shadow-sm text-white w-max font-bold text-center rounded-lg text-xs px-[2px] py-[1px] rotate-[-90deg]">
=======
		<foreignObject x={x - 24} y={y - 0} className="pt-5 " width="60" height="98" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px' }} className="break-words bg-slate-700 shadow-sm text-white w-max font-bold text-center rounded-lg text-xs px-[5px] py-[1px] rotate-[-90deg]">
>>>>>>> b29e959e4d0250b525df9c052c553bea413bb994

				{value}
			</div>
		</foreignObject>
	);
};

export default HarmonicsLabel;
