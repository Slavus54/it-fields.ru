import React from 'react'
import Welcome from '../hoc/Welcome'
import AccountPage from '../hoc/AccountPage'
import {ContextPropsType} from '../../types/types'

const Home: React.FC<ContextPropsType> = ({account_id}) => {
    
    return (
        <>
            {account_id === '' ? <Welcome /> : <AccountPage />}  
        </>
    )
}

export default Home