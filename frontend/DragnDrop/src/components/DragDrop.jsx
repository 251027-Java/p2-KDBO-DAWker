import React, { useState } from 'react'

export default function DragDrop() {
  const NUM_COLUMNS = 5

  const initialItems = [
    { id: 'a', text: 'Draggable item A' },
    { id: 'b', text: 'Draggable item B' },
    { id: 'c', text: 'Draggable item C' },
  ]

  const makeColumns = () =>
    Array.from({ length: NUM_COLUMNS }, (_, i) => ({
      id: String(i),
      title: `Column ${i + 1}`,
      items: i === 0 ? initialItems.slice() : [],
    }))

  const [columns, setColumns] = useState(makeColumns)

  function onDragStart(e, fromIdx, itemId) {
    const payload = JSON.stringify({ from: fromIdx, id: itemId })
    e.dataTransfer.setData('text/plain', payload)
    e.dataTransfer.effectAllowed = 'move'
  }

  function onDropToColumn(e, toIdx) {
    e.preventDefault()
    const payload = e.dataTransfer.getData('text/plain')
    if (!payload) return
    let parsed
    try {
      parsed = JSON.parse(payload)
    } catch (err) {
      return
    }
    const { from, id } = parsed
    const fromIdx = Number(from)
    const destIdx = Number(toIdx)
    if (isNaN(fromIdx) || isNaN(destIdx)) return
    if (fromIdx === destIdx) return

    setColumns((cols) => {
      const src = cols[fromIdx]
      const dst = cols[destIdx]
      const item = src.items.find((it) => it.id === id)
      if (!item) return cols
      const newCols = cols.map((c) => ({ ...c, items: [...c.items] }))
      newCols[fromIdx].items = newCols[fromIdx].items.filter((it) => it.id !== id)
      newCols[destIdx].items = [...newCols[destIdx].items, item]
      return newCols
    })
  }

  function onDragOver(e) {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  return (
    <div className="dd-root">
      <h2>Drag & Drop — {NUM_COLUMNS} Columns</h2>
      <div className="dd-container columns-5">
        {columns.map((col, idx) => (
          <div
            key={col.id}
            className="dd-column"
            onDragOver={onDragOver}
            onDrop={(e) => onDropToColumn(e, idx)}
          >
            <h3>{col.title}</h3>
            {col.items.length === 0 && <div className="dd-empty">(empty)</div>}
            {col.items.map((item) => (
              <div
                key={item.id}
                className="dd-item"
                draggable
                onDragStart={(e) => onDragStart(e, idx, item.id)}
              >
                {item.text}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
