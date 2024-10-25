/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, {
  AxiosInstance,
  CancelTokenSource,
  InternalAxiosRequestConfig,
} from "axios"

const initCancelDuplicateRequest = (axiosInstance: AxiosInstance) => {
  // simple impl, not care about body
  const getRequestKey = (config: InternalAxiosRequestConfig) =>
    config.method + "_" + config.url

  const pendingRequests = new Map<string, CancelTokenSource>()
  axiosInstance.interceptors.request.use(
    (config) => {
      // only concern request with 'NoDup' header
      if (config.headers["NoDup"] === undefined) return config

      // compute request key to locate duplicate
      const requestKey = getRequestKey(config)

      // if exists, cancel the previous request
      if (pendingRequests.has(requestKey)) {
        pendingRequests.get(requestKey)?.cancel("Duplicate request")
      }

      // record this new request
      const cancelToken = axios.CancelToken.source()
      config.cancelToken = cancelToken.token
      pendingRequests.set(requestKey, cancelToken)

      return config
    },
    (err) => Promise.reject(err)
  )

  axiosInstance.interceptors.response.use(
    (response) => {
      if (response.config.headers["NoDup"] !== undefined) {
        const requestKey = getRequestKey(response.config)
        pendingRequests.delete(requestKey)
      }

      return response
    },
    (err) => {
      return Promise.reject(err)
    }
  )

  return axiosInstance
}

const initReuseDuplicateRequest = (axiosInstance: AxiosInstance) => {
  const cachedRequests = new Map<string, Promise<any>>()
  const noDup = (key: string, createRequest: () => Promise<any>) => {
    if (cachedRequests.has(key)) {
      console.log(`reuse ${key}`)
      return cachedRequests.get(key)!
    } else {
      const promise = createRequest()
      cachedRequests.set(key, promise)
      promise.finally(() => cachedRequests.delete(key))
      return promise
    }
  }
  axiosInstance.noDup = noDup

  return axiosInstance
}

export const cancelAxios = initCancelDuplicateRequest(
  axios.create({
    baseURL: "/api",
  })
)
export const reuseAxios = initReuseDuplicateRequest(
  axios.create({
    baseURL: "/api",
  })
)
