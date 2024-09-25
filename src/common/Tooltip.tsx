export const CustomTooltip = ({ active, payload, label }) => {
	if (active && payload && payload.length) {
		return (
			<div
				className="rounded-lg shadow-lg bg-white p-4"
				style={{
					border: "1px solid #eaeaea",
					boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
				}}
			>
				<p className="font-semibold text-gray-800 mb-2">{`Frequency: ${label}`}</p>
				{payload.map((data, index) => (
					<p key={index} className="text-sm text-gray-600">
						<span
							className="inline-block w-3 h-3 mr-2 rounded-full"
							style={{ backgroundColor: data.color }}
						></span>
						{`${data.name}: ${data.value}`}
					</p>
				))}
			</div>
		);
	}

	return null;
};
