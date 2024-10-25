import { atom, getDefaultStore, useAtom } from "jotai"
import { useEffect, useMemo } from "react"
import { reuseAxios } from "../CancelRequest/api"

const curPageAtom = atom<number>(1)
const pageDataAtom = atom<string[]>([])

const updatePageData = async (page: number) => {
  try {
    console.log(`will: ${page}`)
    const { data: newPageData } = await reuseAxios.get(`/data?pageNum=${page}`)
    console.log(`finish: ${page}`, newPageData)
    getDefaultStore().set(pageDataAtom, newPageData)
  } catch (e) {
    console.error(`error: ${page}`, e)
    getDefaultStore().set(pageDataAtom, [])
  }
}

function createWillUpdateForAtom<T>(targetAtom: ReturnType<typeof atom<T>>) {
  let latestToken = 0
  return () => {
    latestToken += 1
    const curToken = latestToken
    return (valueOrUpdater: T | ((prevData: T) => T)) => {
      if (curToken === latestToken) {
        getDefaultStore().set(targetAtom, valueOrUpdater)
      }
    }
  }
}
const willUpdatePageData = createWillUpdateForAtom(pageDataAtom)
const safeUpdatePageData = async (page: number) => {
  const setPageData = willUpdatePageData()
  try {
    console.log(`will: ${page}`)
    const { data: newPageData } = await reuseAxios.get(`/data?pageNum=${page}`)
    console.log(`finish: ${page}`, newPageData)
    setPageData(newPageData)
  } catch (e) {
    console.error(`error: ${page}`, e)
    setPageData([])
  }
}

export default function FinalConsistency() {
  const pages = useMemo(
    () => new Array(10).fill(undefined).map((_, i) => i + 1),
    []
  )
  const [curPage, setCurPage] = useAtom(curPageAtom)
  const [pageData, _] = useAtom(pageDataAtom)

  useEffect(() => {
    // updatePageData(curPage)
    safeUpdatePageData(curPage)
  }, [curPage])

  return (
    <div>
      <h1>Final Consistency Example</h1>
      <div>curPage: {curPage}</div>
      {
        /* click 5 then click 6, you will see curPage=5 show page 6 data */
        /* click 5 then click 7, you will see what happens when late response error */
        pages.map((p) => (
          <button key={`page-${p}`} onClick={() => setCurPage(p)}>
            {p}
          </button>
        ))
      }
      {pageData.map((s) => (
        <p key={s}>{s}</p>
      ))}
    </div>
  )
}
