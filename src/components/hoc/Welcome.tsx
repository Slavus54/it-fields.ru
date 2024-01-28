import React from 'react'
import NavigatorWrapper from '../router/NavigatorWrapper'
import youtubers from '../../env/youtubers.json'

const Welcome: React.FC = () => {
    
    const onView = (url: string): void => {
        window.open(url)
    }
    
    return (
        <>          
            <h1>IT-Fields.ru</h1>
            <h3 className='pale text'>Будущее IT в России</h3>
            
            <NavigatorWrapper isRedirect={false} url='/register'>
                <button>Начать</button>
            </NavigatorWrapper>

            <h2>Авторы каналов на YouTube</h2>
            <div className='items half'>
                {youtubers.map(el => 
                    <div onClick={() => onView(el.url)} className='item panel'>
                        {el.title}
                        <h5 className='pale'>{el.category}</h5>
                    </div>    
                )}
            </div>
        </>
    )
}

export default Welcome