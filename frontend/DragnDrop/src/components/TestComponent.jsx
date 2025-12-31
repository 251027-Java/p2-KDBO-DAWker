import React, { useState } from 'react';
import { dawService } from '../dawService/dawService';

export default function TestComponent() {
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testService = async (serviceName) => {
        setLoading(true);
        setError(null);
        try {
            // Replace with your actual service endpoint
            const result = await dawService.getDawById("587990d4-ede8-475a-a0a6-ee10c067f433");
            console.log("Service Result:", result);
            const data = result;
            setResponse(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Service Tester</h1>
            
            <div style={{ marginBottom: '20px' }}>
                <button onClick={() => testService('test')}>Test Service</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>Error: {error}</p>}
            {response && <pre>{JSON.stringify(response, null, 2)}</pre>}
        </div>
    );
}