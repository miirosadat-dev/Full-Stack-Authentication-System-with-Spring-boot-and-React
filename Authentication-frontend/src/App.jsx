import { useEffect, useState } from 'react';

function App() {
    const [status, setStatus] = useState('checking...');



    useEffect(() => {
        fetch('http://localhost:8080')
            .then((res) => res.json())
            .then((data) => setStatus(data.status))
            .catch((err) => setStatus('ERROR: ' + err.message));
    }, []);

    return <h1>Backend status: {status}</h1>;
}

export default App;