const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const API_ENDPOINT={
    AUTH:{
        ADMIN_LOGIN: `${API_BASE_URL}/auth/admin/login`
    },
    SIGNAL:{
        ADMIN_CREATE_SIGNALS: `${API_BASE_URL}/signal/create`,
        GET_ALL_SIGNAL:`${API_BASE_URL}/signal`,
        UPDATE_SIGNAL:`${API_BASE_URL}/signal/update/{id}`,
        DELETE_SIGNAL: `${API_BASE_URL}/signal/delete/{id}`
    },

    TRANSACTION:{
        GET_TRANSACTIONS:`${API_BASE_URL}/transaction`,
        DELETE_TRANSACTIONS:`${API_BASE_URL}/transaction/{id}`
    },
    ADMIN:{
        UPDATE_TRANSACTION:`${API_BASE_URL}/admin/transaction/{transactionId}`
    }
}