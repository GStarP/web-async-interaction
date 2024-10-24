import { atom, useAtom } from "jotai"
import { useMemo } from "react"
import { cancelAxios, reuseAxios } from "./api"
import { isCancel } from "axios"

const pageDataAtom = atom<string[]>([])

export default function CancelRequest() {
  const pages = useMemo(
    () => new Array(10).fill(undefined).map((_, i) => i + 1),
    []
  )
  const [pageData, setPageData] = useAtom(pageDataAtom)

  const updatePageDataCancel = async (page: number) => {
    try {
      console.log(`will: ${page}`)
      const { data: newPageData } = await cancelAxios.get(
        `/data?pageNum=${page}`,
        {
          headers: {
            NoDup: "1",
          },
        }
      )
      console.log(`finish: ${page}`, newPageData)
      setPageData(newPageData)
    } catch (e) {
      // cancel will lead to here and skip logic after axios.request
      if (isCancel(e)) {
        console.warn(`cancel: ${page}`, e)
      } else {
        console.error(`error: ${page}`, e)
      }
    }
  }

  const updatePageDataReuse = async (page: number) => {
    try {
      console.log(`will: ${page}`)
      const { data: newPageData } = await reuseAxios.noDup(`page-${page}`, () =>
        reuseAxios.get(`/data?pageNum=${page}`)
      )
      // reuse will lead to here and trigger logic multiple times at the same time
      console.log(`finish: ${page}`, newPageData)
      setPageData(newPageData)
    } catch (e) {
      console.error(`cancel: ${page}`, e)
    }
  }

  return (
    <div>
      <h1>Cancel Request Example</h1>
      {pages.map((p) => (
        /* switch between two update func */
        /* and click multiple times on the same button to see what happens */
        <button key={`page-${p}`} onClick={() => updatePageDataCancel(p)}>
          {p}
        </button>
      ))}
      {pageData.map((s) => (
        <p key={s}>{s}</p>
      ))}
    </div>
  )
}
