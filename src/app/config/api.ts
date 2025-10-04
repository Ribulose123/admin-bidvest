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

    STAKE:{
        ADMIN_CREATE_STAKING: `${API_BASE_URL}/staking/create`,
        GET_ALL_STAKING:`${API_BASE_URL}/staking`,
        UPDATE_STAKING:`${API_BASE_URL}/staking/update/{id}`,
        DELETE_STAKING: `${API_BASE_URL}/staking/delete/{id}`
    },

    SUBSCRIPTION:{
        GET_SUBSCRIPTIONS:`${API_BASE_URL}/subscription`,
        DELETE_SUBSCRIPTION:`${API_BASE_URL}/subscription/delete/{id}`,
        UPDATE_SUBSCRIPTION:`${API_BASE_URL}/subscription/update{id}`,
        CREATE_SUBSCRIPTION:`${API_BASE_URL}/subscription/create`

    },

    TRANSACTION:{
        GET_TRANSACTIONS:`${API_BASE_URL}/transaction`,
        DELETE_TRANSACTIONS:`${API_BASE_URL}/transaction/{id}`
    },
    ADMIN:{
        UPDATE_TRANSACTION:`${API_BASE_URL}/admin/transaction/{transactionId}`,
        GET_ALL_USERS:`${API_BASE_URL}/admin/users`,
        GET_USER_DETAILS:`${API_BASE_URL}/admin/users/{id}`,
        UPDATE_STAKING_BALANCE:`${API_BASE_URL}/admin/users/staking`,
        UPDATE_ASSET_BALANCE: `${API_BASE_URL}/admin/user/assets`,
    UPDATE_SIGNAL_BALANCE: `${API_BASE_URL}/admin/user/signal`,
    UPDATE_SUBSCRIPTION_BALANCE: `${API_BASE_URL}/admin/user/subscription`,
    UPDATE_USER: `${API_BASE_URL}/admin/users/{id}`,
    },

    USER:{
        GET_ALL_USERS:`${API_BASE_URL}/user/get-user`
    },
    TRADERS:{
        GET_ALL_TRADERS:`${API_BASE_URL}/trade/user/traders`,
        GET_ALL_TRADERS_DETAILS:`${API_BASE_URL}/trade/user/trader/{traderId}`,
        ADD_TRADERS:`${API_BASE_URL}/trade/create-trader`,
        DELETE_TRADERS:`${API_BASE_URL}/trade/trader/{traderId}`,
        EDIT_TRADERS: `${API_BASE_URL}/trade/trader/{traderId}`,
        SYNC_FOLLOWERS:`${API_BASE_URL}/trade/admin/sync-trader-followers`,
        TRADER_TRADER:`${API_BASE_URL}/trade/admin/trader-trade`,
        
    }
}