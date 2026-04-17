import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { eraseLocalStorageLogin, getLocalStorageLogin, setLocalStorageLogin } from './LocalLoginSave'
import { loadAuthToken } from '../API/base_api'
import LoadingPlaceholder from '../components/LoadingPlaceholder'

interface ILogin {
    userId: number,
    username: string,
    isLoggedIn: boolean,
    loginFn: (username: string, password: string) => Promise<string | undefined>,
    registerFn: (username: string, password: string) => Promise<string | undefined>,
    logoutFn: () => void
}

const LoginContext = createContext<ILogin | undefined>(undefined)

// eslint-disable-next-line react-refresh/only-export-components
export function useLogin() {
    const context = useContext(LoginContext)
    if (context === undefined) {
        throw new Error("useLogin must be used within a LoginProvider")
    }

    return context
}

export function LoginProvider({ children }: { children: ReactNode }) {
    const [username, setUsername] = useState('')
    const [userId, setUserId] = useState(0)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)

    const innerLogin = (username?: string, userId?: number) => {
        if (username === undefined || userId === undefined) {
            setUsername('')
            setUserId(0)
            setIsLoggedIn(false)
            eraseLocalStorageLogin()
            return
        }
        setUsername(username)
        setUserId(userId)
        setIsLoggedIn(true)
        setLocalStorageLogin({ userId, username })
    }

    useEffect(() => {
        const initialize_fields = async () => {
            const token = loadAuthToken()
            const login = getLocalStorageLogin()

            if (token === undefined || login === undefined) {
                setUsername('')
                setUserId(0)
                setIsLoggedIn(false)
                setDataLoading(false)
                return
            }

            innerLogin(login.username, login.userId)
            setDataLoading(false)
        }

        initialize_fields()
    }, [])

    const loginFn = async (username: string, password: string): Promise<string | undefined> => {
        setDataLoading(true)
        console.warn(username, password)
        return undefined // TODO:
    }
    
    const registerFn = async (username: string, password: string): Promise<string | undefined> => {
        console.warn(username, password)
        setDataLoading(true)
        return undefined // TODO:
    }

    const logoutFn = () => {
        innerLogin()
    }

    if (dataLoading)
        return <LoadingPlaceholder />

    return <LoginContext.Provider value={{
        isLoggedIn,
        userId,
        username,
        loginFn,
        registerFn,
        logoutFn
    }}>
        {children}
    </LoginContext.Provider>
}

