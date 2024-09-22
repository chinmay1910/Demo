export function generateCustomDivisions() {
  self.onmessage = (e) => {
    const { xAxisStart, xAxisEnd, numDivisions, divisionType } = e.data;

    if (xAxisEnd <= xAxisStart || numDivisions <= 0) {
      self.postMessage([]);
      return;
    }

    let divisions = [];
    const xAxisLength = xAxisEnd - xAxisStart;

    if (divisionType === 'equal') {
      const divisionWidth = xAxisLength / numDivisions;
      for (let i = 0; i < numDivisions; i++) {
        const start = xAxisStart + i * divisionWidth;
        const end = xAxisStart + (i + 1) * divisionWidth;
        divisions.push({
          number: i + 1,
          start: start,
          end: end,
          center: (start + end) / 2,
        });
      }
    } else if (divisionType === '1/3 octave') {
      const startFreq = xAxisStart;
      const multiplier = Math.pow(2, 1/3); // 1/3 octave multiplier
      let start = startFreq;
      let i = 0;
      while (start < xAxisEnd && i < numDivisions) {
        const end = start * multiplier;
        divisions.push({
          number: i + 1,
          start: start,
          end: Math.min(end, xAxisEnd),
          center: Math.sqrt(start * Math.min(end, xAxisEnd)),
        });
        start = end;
        i++;
      }
    }

    self.postMessage(divisions);
  };
}
