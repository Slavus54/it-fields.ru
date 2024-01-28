import {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {LINK_TYPES, FIELDS, COURSE_LIMIT, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import ImageLoader from '../UI&UX/ImageLoader'
import MapPicker from '../UI&UX/MapPicker'
import QuantityLabel from '../UI&UX/QuantityLabel'
import FormPagination from '../UI&UX/FormPagination'
import {TownType} from '../../types/types'

const Register = () => {
    const {change_context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [image, setImage] = useState<string>('')
    const [idx, setIdx] = useState<number>(0)
    const [course, setCourse] = useState<number>(1)
    const [state, setState] = useState({
        username: '', 
        security_code: '', 
        link_type: LINK_TYPES[0], 
        link_content: '', 
        field: FIELDS[0], 
        region: towns[0].title, 
        cords: towns[0].cords
    })

    const centum = new Centum()

    const {username, security_code, link_type, link_content, field, region, cords} = state

    const registerM = gql`
        mutation register($username: String!, $security_code: String!, $link_type: String!, $link_content: String!, $field: String!, $course: Float!, $region: String!, $cords: ICord!, $main_photo: String!) {
            register(username: $username, security_code: $security_code, link_type: $link_type, link_content: $link_content, field: $field, course: $course, region: $region, cords: $cords, main_photo: $main_photo) {
                account_id
                username
                field
                course
            }
        }
    `

    const [register] = useMutation(registerM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.register)
            change_context('update', data.register, 1)
        }
    })

    useMemo(() => {
        if (region !== '') {
            let result = towns.find(el => centum.search(el.title, region, SEARCH_PERCENT)) 
    
            if (result !== undefined) {
                setState({...state, region: result.title, cords: result.cords})
            }           
        }
    }, [region])

    useMemo(() => {
        setView({...view, latitude: cords.lat, longitude: cords.long, zoom: 17})
    }, [cords])

    const onCreate = () => {
        register({
            variables: {
                username, security_code, link_type, link_content, field, course, region, cords, main_photo: image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Создайте аккаунт' num={idx} setNum={setIdx} items={[
                    <>
                        <div className='items half'>
                            <div className='item'>
                                <h3 className='pale'>Имя</h3>
                                <input value={username} onChange={e => setState({...state, username: e.target.value})} placeholder='Ваше имя' type='text' />
                            </div>

                            <div className='item'>
                                <h3 className='pale'>Код безопасности</h3>
                                <input value={security_code} onChange={e => setState({...state, security_code: e.target.value})} placeholder='Код безопасности' type='text' />
                            </div>

                            <div className='item'>
                                <h3 className='pale'>Ник, ID или Тег</h3>
                                <input value={link_content} onChange={e => setState({...state, link_content: e.target.value})} placeholder='Ваш идентификатор' type='text' />
                            </div>
                        </div>  
                       
                        <h3 className='pale'>Вид связи</h3>
                        <div className='items small'>
                            {LINK_TYPES.map(el => <div onClick={() => setState({...state, link_type: el})} className={el === link_type ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                    </>,
                    <>
                        <h3 className='pale'>Поле деятельности, курс обучения и фото</h3>
                        <select value={field} onChange={e => setState({...state, field: e.target.value})}>
                            {FIELDS.map(el => <option value={el}>{el}</option>)}
                        </select>
                        <QuantityLabel num={course} setNum={setCourse} part={1} min={1} max={COURSE_LIMIT} label={`Текущий курс: ${course}`} />
                        <ImageLoader setImage={setImage} />
                    </>,
                    <>
                        <h3 className='pale'>Откуда вы?</h3>
                        <input value={region} onChange={e => setState({...state, region: e.target.value})} placeholder='Название города' type='text' />
                        <ReactMapGL onClick={e => setState({...state, cords: centum.mapboxCords(e)})} {...view} onViewportChange={(e: any) => setView(e)} mapboxApiAccessToken={token} className='map'>
                            <Marker latitude={cords.lat} longitude={cords.long}>
                                <MapPicker type='picker' />
                            </Marker>
                        </ReactMapGL>  
                    </>
                ]} 
            />

            <button onClick={onCreate}>Создать</button>
        </div>
    )
}

export default Register