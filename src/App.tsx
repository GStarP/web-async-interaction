import { useState } from "react"
import CancelRequest from "./CancelRequest/CancelRequest"
import LockInteraction from "./LockInteraction/LockInteraction"

function App() {
  const [curTab, setCurTab] = useState(0)

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <a onClick={() => setCurTab(0)}>Lock Interaction</a>
        <a onClick={() => setCurTab(1)}>Cancel Request</a>
      </div>

      <div>
        {curTab === 0 ? (
          <LockInteraction />
        ) : curTab === 1 ? (
          <CancelRequest />
        ) : null}
      </div>
    </>
  )
}

export default App
