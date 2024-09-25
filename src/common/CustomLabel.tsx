const CustomLabel = ({ viewBox, value }) => {
	const { x, y } = viewBox;

	return (
<<<<<<< HEAD
		<foreignObject x={x - 37} y={y + 30} className=" overflow-visible" width="60" height="100" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px', width: '74px' }} className= "break-words text-balance bg-violet-900 shadow-sm text-white w-max font-medium text-center rounded-lg text-xs px-[3px] py-[1px] rotate-[-90deg]">
=======
		<foreignObject x={x - 34} y={y - 4} className="pt-7 overflow-visible" width="60" height="100" style={{ zIndex: 10000 }}>
			<div style={{ fontSize: '11px' }} className="w-[67px] break-words bg-violet-900 shadow-sm text-white w-max font-medium text-center rounded-lg text-xs px-[2px] py-[1px] rotate-[-90deg]">
>>>>>>> b29e959e4d0250b525df9c052c553bea413bb994

				{value}
			</div>
		</foreignObject>
	);
};

export default CustomLabel;
