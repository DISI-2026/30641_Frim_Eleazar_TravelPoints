import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { eraseLocalStorageLogin, getLocalStorageLogin, setLocalStorageLogin } from './LocalLoginSave'
import { loadAuthToken } from '../API/base_api'
import LoadingPlaceholder from '../components/LoadingPlaceholder'
import { loginUser, logoutUser, registerUser } from '../API/auth_api'

interface ILogin {
    email: string,
    isLoggedIn: boolean,
    loginFn: (email: string, password: string) => Promise<string | true>,
    registerFn: (email: string, password: string) => Promise<string | true>,
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
    const [email, setEmail] = useState('')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [dataLoading, setDataLoading] = useState(true)

    const innerLogin = (email?: string) => {
        if (email === undefined) {
            setEmail('')
            setIsLoggedIn(false)
            eraseLocalStorageLogin()
            return
        }
        setEmail(email)
        setIsLoggedIn(true)
        setLocalStorageLogin({ email })
    }

    useEffect(() => {
        const initialize_fields = async () => {
            const token = loadAuthToken()
            const login = getLocalStorageLogin()

            if (token === undefined || login === undefined) {
                setEmail('')
                setIsLoggedIn(false)
                setDataLoading(false)
                return
            }

            innerLogin(login.email)
            setDataLoading(false)
        }

        initialize_fields()
    }, [])

    const loginFn = async (email: string, password: string): Promise<string | true> => {
        setDataLoading(true)
        return loginUser({ email, password }).then(res => {
            if (res.success) {
                innerLogin(email)
                return true
            }
            else {
                return res.error
            }
        }).catch(err => {
            const errorMessage = err instanceof Error ? err.message : "A aparut o eroare la autentificare";
            return errorMessage;
        }).finally(() => setDataLoading(false))
    }

    const registerFn = async (email: string, password: string): Promise<string | true> => {
        setDataLoading(true)
        return registerUser({ email, password }).then(res => {
            if (res.success) {
                innerLogin(email)
                return true
            } else {
                return res.error
            }
        }).catch(err => {
            const errorMessage = err instanceof Error ? err.message : "A aparut o eroare la inregistrare";
            return errorMessage;
        }).finally(() => setDataLoading(false))
    }

    const logoutFn = () => {
        innerLogin()
        logoutUser()
    }

    if (dataLoading)
        return <LoadingPlaceholder />

    return <LoginContext.Provider value={{
        isLoggedIn,
        email,
        loginFn,
        registerFn,
        logoutFn
    }}>
        {children}
    </LoginContext.Provider>
}

