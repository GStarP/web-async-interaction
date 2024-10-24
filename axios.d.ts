import "axios"

declare module "axios" {
  export interface AxiosInstance {
    noDup(key: string, createRequest: () => Promise<T>): Promise<T>
  }
}
