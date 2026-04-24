
export interface ILocalStorageLogin {
    email: string
}

export function getLocalStorageLogin(): ILocalStorageLogin | undefined {
    const localStorageLogin = localStorage.getItem('login')
    if (localStorageLogin) {
        return JSON.parse(localStorageLogin) as ILocalStorageLogin
    }
    else {
        return undefined
    }
}

export function eraseLocalStorageLogin() {
    localStorage.removeItem('login')
}

export function setLocalStorageLogin(loginInfo: ILocalStorageLogin) {
    localStorage.setItem('login', JSON.stringify(loginInfo))
}

