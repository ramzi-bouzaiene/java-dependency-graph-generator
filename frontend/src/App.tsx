
import { useState } from 'react';
import './App.css';
import GraphViewer from './components/GraphViewer/GraphViewer';
import UploadAndFetchGraph from './components/UploadAndFetchGraph/UploadAndFetchGraph';

function App() {
  const [graphData, setGraphData] = useState(null);

  return (
    <div style={{ padding: 20 }}>
      <UploadAndFetchGraph onGraphData={setGraphData} />
      <hr />
      <GraphViewer graphData={graphData} />
    </div>
  );
}

export default App;
