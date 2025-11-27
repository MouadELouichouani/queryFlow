import { api } from "@/config/api"

export const getHistories = async () =>{
    const response = await api.get(`/history/all`)
    return response
}
