import ky from 'ky'
import ENV from '../config/ENV';

export const baseApi = ENV.BASEAPI || "http://localhost:8000"

const apiClinet = ky.create({
    prefix : baseApi,
    credentials : 'include',
    headers : {
        "Content-Type": "application-json"
    },
    hooks : {
        beforeRequest : [
            (request) => {
                // you can the token or timeout 
                console.log("request", request)
            }
        ],
        afterResponse : [
            async(request, options, response) => { 
                 if (response.status === 401) {
                console.log("Unauthorized");
                }
                return response;
            }
        ]
    }
})

export default apiClinet;