import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Alert } from 'react-native';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut as firebaseSignOut,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';

interface User {
    email: string;
    membroDesde: string;
    nome: string; 
    idade: string;
    planeta: string;
    sexo: string; 
}

interface AuthContextType {
    user: User | null;
    signInWithEmailAndPassword: (dados: any) => Promise<void>; 
    createUserWithEmailAndPassword: (dados: any) => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const processUserData = (firebaseUser: FirebaseUser, dadosIniciais: any): User => ({
    email: firebaseUser.email || 'N/A',
    nome: dadosIniciais.nome || firebaseUser.email?.split('@')[0] || 'Usuário',
    idade: dadosIniciais.idade ? String(dadosIniciais.idade) : 'N/A', 
    planeta: dadosIniciais.planeta || 'Terra',
    sexo: dadosIniciais.sexo || 'N/A',
    membroDesde: new Date().toLocaleDateString('pt-BR'),
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null); 
    
    const signInWithEmailAndPasswordHandler = async (dados: any) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, dados.email, dados.senha);
            const firebaseUser = userCredential.user;
            const profileData = { nome: firebaseUser.displayName }; 
            setUser(processUserData(firebaseUser, { ...dados, ...profileData }));
        } catch (error: any) {
            console.error("Erro no Login:", error);
            Alert.alert("Erro de Login", error.message || "Credenciais inválidas ou conta não existe.");
        }
    };

const createUserWithEmailAndPasswordHandler = async (dados: any) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, dados.email, dados.senha);
        const firebaseUser = userCredential.user;

        await updateProfile(firebaseUser, { displayName: dados.nome || dados.email.split('@')[0] });

        const processedUser = processUserData(firebaseUser, dados);
        setUser(processedUser);

        return processedUser; 

    } catch (error: any) {
        console.error("Erro no Cadastro:", error);
        Alert.alert("Erro de Cadastro", error.message || "E-mail já está em uso ou senha inválida.");
        return null; 
    }
};


    const signOutHandler = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            Alert.alert("Sucesso", "Sessão encerrada com sucesso.");
        } catch (error) {
            console.error("Erro no Logout:", error);
            Alert.alert("Erro", "Não foi possível sair da sessão.");
        }
    };
    
    const value: AuthContextType = { 
        user, 
        signInWithEmailAndPassword: signInWithEmailAndPasswordHandler, 
        createUserWithEmailAndPassword: createUserWithEmailAndPasswordHandler, 
        signOut: signOutHandler 
    };
    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
