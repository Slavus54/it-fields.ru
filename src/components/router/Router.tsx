import React from 'react'
import {Route} from 'wouter'
import RouterItem from './RouterItem'
import routes from '../../env/routes.json'
import {ContextPropsType} from '../../types/types'

import Home from '../hoc/Home'
import Register from '../hoc/Register'
import Login from '../hoc/Login'
import CreateLecture from '../hoc/CreateLecture'
import Lectures from '../hoc/Lectures'
import Lecture from '../hoc/Lecture'
import CreatePractice from '../hoc/CreatePractice'
import Practices from '../hoc/Practices'
import Practice from '../hoc/Practice'
import CreateVacancy from '../hoc/CreateVacancy'
import Vacancies from '../hoc/Vacancies'
import Vacancy from '../hoc/Vacancy'
import CreateTutor from '../hoc/CreateTutor'
import Tutors from '../hoc/Tutors'
import Tutor from '../hoc/Tutor'
import Profiles from '../hoc/Profiles'
import Profile from '../hoc/Profile'

const Router: React.FC<ContextPropsType> = ({account_id, username}) => {

    return (
        <>
            <div className='navbar'>
                {routes.filter(el => account_id.length === 0 ? el.access_value < 1 : el.access_value > -1).map(el => <RouterItem title={el.title} url={el.url} />)}
            </div>
     
            <Route path='/'><Home account_id={account_id} username={username} /></Route> 
            <Route component={Register} path='/register' />    
            <Route component={Login} path='/login' />  
            <Route component={CreateLecture} path='/create-lecture/:id' />  
            <Route component={Lectures} path='/lectures' />  
            <Route component={Lecture} path='/lecture/:id' />  
            <Route component={CreatePractice} path='/create-practice/:id' />  
            <Route component={Practices} path='/practices' />  
            <Route component={Practice} path='/practice/:id' />  
            <Route component={CreateVacancy} path='/create-vacancy/:id' />
            <Route component={Vacancies} path='/vacancies' />    
            <Route component={Vacancy} path='/vacancy/:id' />
            <Route component={CreateTutor} path='/create-tutor/:id' />
            <Route component={Tutors} path='/tutors' />
            <Route component={Tutor} path='/tutor/:id' />
            <Route component={Profiles} path='/profiles' />  
            <Route component={Profile} path='/profile/:id' />  
        </>
    )
}

export default Router