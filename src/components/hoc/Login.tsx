import {useState, useContext} from 'react';
import {useMutation, gql} from '@apollo/react-hooks'
import cards from '../../env/cards.json'
import {Context} from '../../context/WebProvider'
import CloseIt from '../UI&UX/CloseIt'

const Login = () => {
    const {change_context} = useContext(Context)
    const [card, setCard] = useState<any | null>(null)
    const [state, setState] = useState({
        security_code: ''
    })

    const {security_code} = state

    const loginM = gql`
        mutation login($security_code: String!) {
            login(security_code: $security_code) {
                account_id
                username
                field
                course
            }
        }
    `

    const [login] = useMutation(loginM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.login)
            change_context('update', data.login, 3)
        }
    })

    const onLogin = () => {
        login({
            variables: {
                security_code
            }
        })
    }

    return (
        <div className='main'>
            <h1>Добро пожаловать!</h1>
            <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Код безопасности' type='text' />           

            <button onClick={onLogin}>Войти</button>

            {card === null ?
                    <>
                        <h1>Что это за платформа?</h1>
                        <div className='items half'>
                            {cards.map(el => 
                                <div onClick={() => setCard(el)} className='item panel'>
                                    {el.headline}
                                    <h5 className='pale'>{el.category}</h5>
                                </div>    
                            )}
                        </div>
                    </>
                :
                    <>
                        <CloseIt onClick={() => setCard(null)} />
                        
                        <h1>{card.headline}</h1>
                        <h3 className='pale'>{card.category}</h3>
                        <p className='text'>{card.text}</p>
                    </>
            }
        </div>
    )
}

export default Login