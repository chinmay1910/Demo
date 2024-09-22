// Import.tsx

const Export = ({ onDataLoaded }) => {
    const handleFileUpload = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const jsonData = JSON.parse(e.target.result);
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              onDataLoaded(jsonData); // Pass the data to the parent component
            } else {
              console.error("Invalid JSON data format.");
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        };
        reader.readAsText(file);
      }
    };
  
    return (
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="mb-4 p-2 border border-gray-300 rounded"
      />
    );
  };

  export default Export;