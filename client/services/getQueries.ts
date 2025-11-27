import { api } from "@/config/api"

export const getQueries = async (history_id: string) =>{
    const response = await api.get(`/query/${history_id}/queries`)
    return response
}
