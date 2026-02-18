export const api = {
    auth: {
        auth: "auth:auth",
        signIn: "auth:signIn",
        signOut: "auth:signOut",
        store: "auth:store",
    },
    contact: {
        list: "contact:list",
        submit: "contact:submit",
        updateStatus: "contact:updateStatus",
    },
    users: {
        cleanupOrphanedAuthRecords: "users:cleanupOrphanedAuthRecords",
        current: "users:current",
        deleteAccount: "users:deleteAccount",
        getStarredProjects: "users:getStarredProjects",
        isProjectStarred: "users:isProjectStarred",
        starProject: "users:starProject",
        updateProfile: "users:updateProfile",
    },
};
