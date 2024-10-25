/* eslint-disable @typescript-eslint/no-explicit-any */
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
  }
}

class OutdatedError extends Error {}
const createSafeAsyncOperation = (
  asyncOperation: (...args: any) => Promise<any>
) => {
  let latestToken = 0
  return async (...args: any) => {
    latestToken += 1
    const curToken = latestToken
    console.log(`latestToken: ${latestToken}`)
    const res = await asyncOperation(...args)
    if (curToken === latestToken) {
      return res
    } else {
      return Promise.reject(new OutdatedError())
    }
  }
}
const fetchPageData = createSafeAsyncOperation((page: number) =>
  reuseAxios.get(`/data?pageNum=${page}`)
)
const safeUpdatePageData = async (page: number) => {
  try {
    console.log(`will: ${page}`)
    const { data: newPageData } = await fetchPageData(page)
    console.log(`finish: ${page}`, newPageData)
    getDefaultStore().set(pageDataAtom, newPageData)
  } catch (e) {
    if (e instanceof OutdatedError) {
      console.warn(`outdated: ${page}`)
    } else {
      console.error(`error: ${page}`, e)
    }
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
