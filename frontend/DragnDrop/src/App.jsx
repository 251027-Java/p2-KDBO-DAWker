import DragDrop from './components/DragDrop'
import './App.css'

function App() {
  return (
    <main style={{ width: '100%', minHeight: '100vh', padding: '20px', backgroundColor: '#242424' }}>
      <h1 style={{ color: 'white', marginBottom: '20px' }}>DAW Drag & Drop</h1>
      <DragDrop />
    </main>
  )
}

export default App
