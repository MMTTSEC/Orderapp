interface UserData {
    username: string;
    email: string;
    phoneNumber: string | null;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
}

interface LoginStatusResult {
    isAuthorized: boolean;
    userData: UserData | null;
}

const API_BASE_URL = '/api/auth';

export const checkLoginStatus = async (): Promise<LoginStatusResult> => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return {
                isAuthorized: true,
                userData: data,
            };
        } else if (response.status === 401) {
            return {
                isAuthorized: false,
                userData: null,
            };
        } else {
            throw new Error(`Unexpected response status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error checking login status:', error);
        return {
            isAuthorized: false,
            userData: null,
        };
    }
};

export const logout = async (): Promise<boolean> => {
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'DELETE',
            credentials: 'include',
        });

        if (response.ok) {
            return true;
        } else {
            console.error('Logout failed with status:', response.status);
            return false;
        }
    } catch (error) {
        console.error('Error logging out:', error);
        return false;
    }
};

export type { UserData, LoginStatusResult };