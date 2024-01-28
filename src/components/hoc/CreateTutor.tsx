import React, {useState, useMemo, useContext} from 'react'
import ReactMapGL, {Marker} from 'react-map-gl'
import {useMutation, gql} from '@apollo/react-hooks'
import {TUTOR_TYPES, INSTITUTION_TYPES, SEARCH_PERCENT, VIEW_CONFIG, token} from '../../env/env'
//@ts-ignore
import Centum from 'centum.js'
import {gain} from '../../store/ls'
import {Context} from '../../context/WebProvider'
import MapPicker from '../UI&UX/MapPicker'
import ImageLoader from '../UI&UX/ImageLoader'
import ImageLook from '../UI&UX/ImageLook'
import FormPagination from '../UI&UX/FormPagination'
import {CollectionPropsType, TownType} from '../../types/types'

const CreateTutor: React.FC<CollectionPropsType> = ({params}) => {
    const {context} = useContext<any>(Context)
    const [view, setView] = useState(VIEW_CONFIG)
    const [towns] = useState<TownType[]>(gain())
    const [image, setImage] = useState<string>('')
    const [subject, setSubject] = useState<string>('')
    const [idx, setIdx] = useState<number>(0)
    const [percent, setPercent] = useState<number>(80)
    const [state, setState] = useState<any>({
        fullname: '', 
        category: TUTOR_TYPES[0], 
        institution: INSTITUTION_TYPES[0],
        subjects: [],
        region: towns[0].title,
        cords: towns[0].cords, 
        url: '',
        grade: 4
    })

    const centum = new Centum()

    const {fullname, category, institution, subjects, region, cords, url, grade} = state

    const createTutorM = gql`
        mutation createTutor($username: String!, $id: String!, $fullname: String!, $category: String!, $institution: String!, $subjects: [String]!, $region: String!, $cords: ICord!, $url: String!, $grade: Float!, $image: String!) {
            createTutor(username: $username, id: $id, fullname: $fullname, category: $category, institution: $institution, subjects: $subjects, region: $region, cords: $cords, url: $url, grade: $grade, image: $image) 
        }
    `

    const [createTutor] = useMutation(createTutorM, {
        optimisticResponse: true,
        onCompleted(data) {
            console.log(data.createTutor)
            window.location.reload()
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

    useMemo(() => {
        setState({...state, grade: centum.part(percent, 5, 1)})
    }, [percent])

    const onSubject = () => {
        if (subjects.find((el: string) => centum.search(el, subject, 100)) === undefined) {
            setState({...state, subjects: [...subjects, subject]})
        }

        setSubject('')
    }

    const onCreate = () => {
        createTutor({
            variables: {
                username: context.username, id: params.id, fullname, category, institution, subjects, region, cords, url, grade, image
            }
        })
    }

    return (
        <div className='main'>          
            <FormPagination label='Создайте наставника' num={idx} setNum={setIdx} items={[
                    <>
                        <h3 className='pale'>Полное имя</h3>
                        <textarea value={fullname} onChange={e => setState({...state, fullname: e.target.value})} placeholder='Введите имя' />                       
                       
                        <h3 className='pale'>Должность</h3>
                        <div className='items small'>
                            {TUTOR_TYPES.map(el => <div onClick={() => setState({...state, category: el})} className={el === category ? 'item label active' : 'item label'}>{el}</div>)}
                        </div>
                        
                        <h3 className='pale'>Учереждение</h3>
                        <select value={institution} onChange={e => setState({...state, institution: e.target.value})}>
                            {INSTITUTION_TYPES.map(el => <option value={el}>{el}</option>)}
                        </select>
                    </>,
                    <>
                        <h3 className='pale'>Ссылка на профиль</h3>
                        <input value={url} onChange={e => setState({...state, url: e.target.value})} placeholder='URL' type='text' />  
                        <h3 className='pale'>Ваша успеваемость: {grade}</h3>
                        <input value={percent} onChange={e => setPercent(parseInt(e.target.value))} type='range' step={1} />
                        <ImageLoader setImage={setImage} />
                    </>,
                    <>
                        <h3 className='pale'>Список дисциплин</h3>
                        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder='Название предмета' type='text' />
                        <button onClick={onSubject} className='light-btn'>+</button>
                        <div className='items half'>
                            {subjects.map((el: string) => <div className='item card'>{el}</div>)}
                        </div>
                     
                    </>,
                    <>
                        <h3 className='pale'>Где находится?</h3>
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

export default CreateTutor