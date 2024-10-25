import { useLockFn } from "ahooks"
import { atom, useAtom } from "jotai"

const isStarAtom = atom(false)

// mock slow api
const doStar = async (starred: boolean) => {
  return new Promise((resolve) => setTimeout(resolve, 3000))
}

export default function LockInteraction() {
  const [isStar, setIsStar] = useAtom(isStarAtom)

  const toggleStar = useLockFn(async () => {
    console.log("toggleStar called")
    await doStar(!isStar)
    setIsStar(!isStar)
    console.log("toggleStar done")
  })

  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #000",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
      }}
    >
      <span>This is a post.</span>
      <span
        style={{
          color: isStar ? "#f00" : "#000",
          fontSize: "2rem",
          marginLeft: 8,
        }}
        onClick={toggleStar}
      >
        ♡
      </span>
    </div>
  )
}
